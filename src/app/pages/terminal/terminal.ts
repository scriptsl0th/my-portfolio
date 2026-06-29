import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  signal,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog/blog.service';

interface TerminalLine {
  type: 'input' | 'output' | 'ascii' | 'error' | 'system';
  text: string;
  class?: string;
}

@Component({
  selector: 'app-terminal-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terminal.html',
  styleUrl: './terminal.scss',
})
export class TerminalPageComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('terminalInput') terminalInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('terminalBody') terminalBody!: ElementRef<HTMLDivElement>;
  @ViewChild('cursorBlink', { static: false }) cursorBlink!: ElementRef<HTMLSpanElement>;

  private router = inject(Router);
  private blogService = inject(BlogService);

  lines = signal<TerminalLine[]>([]);
  currentInput = signal('');
  commandHistory: string[] = [];
  historyIndex = -1;
  isTyping = signal(false);
  private shouldScroll = false;
  private backtickListener: ((e: KeyboardEvent) => void) | null = null;

  private readonly PROMPT = 'aziz@debian-lab:~$';

  private readonly ASCII_BANNER: string[] = [
    '┌──────────────────────────────────────────────────────────────────┐',
    '│   ______   _____   ___  ___    _____  _   _  _____  _      _    │',
    '│  |  __  | |___  | |  | |   \\  |  ___|| | | ||  ___|| |    | |   │',
    '│  | |__| |   __| | |  | | |\\ \\ | |__  | |_| || |__  | |    | |   │',
    '│  |  __  |  |__  | |  | | | \\ \\|___  ||  _  ||  __| | |    | |   │',
    '│  | |  | | ___/  | |  | | |/ /  __| | | | | || |__  | |__  | |__ │',
    '│  |_|  |_||______| |__| |___/  |____/ |_| |_||_____||____||____|│',
    '│                                                                  │',
    '│  > Full-Stack Developer & DevOps Engineer                       │',
    '│  > Type "help" to see available commands                        │',
    '└──────────────────────────────────────────────────────────────────┘',
  ];

  ngOnInit(): void {
    const banner: TerminalLine[] = this.ASCII_BANNER.map((line) => ({
      type: 'ascii' as const,
      text: line,
    }));
    banner.push({ type: 'system', text: '' });
    banner.push({
      type: 'system',
      text: 'Welcome to Aziz Dridi\'s interactive terminal. Type "help" to get started.',
    });
    banner.push({ type: 'system', text: '' });
    this.lines.set(banner);

    // Position cursor initially
    setTimeout(() => this.updateCursorPosition(), 100);
  }

  ngOnDestroy(): void {
    if (this.backtickListener) {
      document.removeEventListener('keydown', this.backtickListener);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  focusInput(): void {
    this.terminalInput?.nativeElement?.focus();
  }

  updateCursorPosition(): void {
    setTimeout(() => {
      if (this.terminalInput && this.cursorBlink) {
        const textarea = this.terminalInput.nativeElement;
        const cursor = this.cursorBlink.nativeElement;
        const text = this.currentInput();

        // Auto-resize textarea height
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';

        // Get cursor position in the textarea
        const cursorPos = textarea.selectionStart || text.length;
        const textBeforeCursor = text.substring(0, cursorPos);

        // Create a mirror div with exact same styling to measure cursor position
        const mirror = document.createElement('div');
        const computedStyle = getComputedStyle(textarea);

        // Copy all relevant styles
        mirror.style.position = 'absolute';
        mirror.style.visibility = 'hidden';
        mirror.style.whiteSpace = computedStyle.whiteSpace;
        mirror.style.wordWrap = computedStyle.wordWrap;
        mirror.style.overflowWrap = computedStyle.overflowWrap;
        mirror.style.width = computedStyle.width;
        mirror.style.font = computedStyle.font;
        mirror.style.letterSpacing = computedStyle.letterSpacing;
        mirror.style.lineHeight = computedStyle.lineHeight;
        mirror.style.padding = computedStyle.padding;
        mirror.style.border = computedStyle.border;
        mirror.style.boxSizing = computedStyle.boxSizing;

        // Add text before cursor
        mirror.textContent = textBeforeCursor;

        // Add a marker span at cursor position
        const marker = document.createElement('span');
        marker.textContent = '|';
        mirror.appendChild(marker);

        document.body.appendChild(mirror);

        // Get marker position
        const markerRect = marker.getBoundingClientRect();
        const mirrorRect = mirror.getBoundingClientRect();

        const left = markerRect.left - mirrorRect.left;
        const top = markerRect.top - mirrorRect.top;

        document.body.removeChild(mirror);

        // Position cursor
        cursor.style.left = `${left}px`;
        cursor.style.top = `${top}px`;
        cursor.style.display = 'block';
      }
    });
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const cmd = this.currentInput().trim();
      if (cmd) {
        this.commandHistory.push(cmd);
        this.historyIndex = this.commandHistory.length;
      }
      this.processCommand(cmd);
      this.currentInput.set('');
      this.updateCursorPosition();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.currentInput.set(this.commandHistory[this.historyIndex]);
        this.updateCursorPosition();
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.currentInput.set(this.commandHistory[this.historyIndex]);
        this.updateCursorPosition();
      } else {
        this.historyIndex = this.commandHistory.length;
        this.currentInput.set('');
        this.updateCursorPosition();
      }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      this.autocomplete();
    }
  }

  private autocomplete(): void {
    const partial = this.currentInput().trim().toLowerCase();
    if (!partial) return;
    const commands = ['help', 'about', 'projects', 'skills', 'blog', 'cat', 'clear', 'exit'];
    const match = commands.find((c) => c.startsWith(partial));
    if (match) {
      this.currentInput.set(match + (match === 'cat' ? ' ' : ''));
      this.updateCursorPosition();
    }
  }

  private processCommand(cmd: string): void {
    const current = this.lines();
    const inputLine: TerminalLine = { type: 'input', text: `${this.PROMPT} ${cmd}` };

    const parts = cmd.split(/\s+/);
    const command = parts[0]?.toLowerCase() || '';
    const args = parts.slice(1);

    let outputLines: TerminalLine[] = [];

    switch (command) {
      case '':
        this.lines.set([...current, inputLine]);
        this.shouldScroll = true;
        return;

      case 'help':
        outputLines = this.cmdHelp();
        break;

      case 'about':
        outputLines = this.cmdAbout();
        break;

      case 'projects':
        outputLines = this.cmdProjects();
        break;

      case 'skills':
        outputLines = this.cmdSkills();
        break;

      case 'blog':
        outputLines = this.cmdBlog();
        break;

      case 'cat':
        outputLines = this.cmdCat(args);
        break;

      case 'clear':
        this.lines.set([]);
        this.shouldScroll = true;
        return;

      case 'exit':
        this.router.navigate(['/']);
        return;

      default:
        outputLines = [
          { type: 'error', text: `bash: ${command}: command not found` },
          { type: 'system', text: 'Type "help" for a list of available commands.' },
        ];
    }

    this.lines.set([...current, inputLine, ...outputLines, { type: 'system', text: '' }]);
    this.shouldScroll = true;
  }

  private cmdHelp(): TerminalLine[] {
    return [
      { type: 'system', text: '┌─────────────────────────────────────────┐' },
      { type: 'system', text: '│  AVAILABLE COMMANDS                     │' },
      { type: 'system', text: '├─────────────────────────────────────────┤' },
      { type: 'output', text: '  help          Show this help menu', class: 'cmd-help' },
      { type: 'output', text: '  about         Display biography', class: 'cmd-help' },
      { type: 'output', text: '  projects      List portfolio projects', class: 'cmd-help' },
      { type: 'output', text: '  skills        Show skills chart', class: 'cmd-help' },
      { type: 'output', text: '  blog          List recent blog articles', class: 'cmd-help' },
      { type: 'output', text: '  cat <slug>    Read a blog post', class: 'cmd-help' },
      { type: 'output', text: '  clear         Clear terminal buffer', class: 'cmd-help' },
      { type: 'output', text: '  exit          Return to homepage', class: 'cmd-help' },
      { type: 'system', text: '└─────────────────────────────────────────┘' },
    ];
  }

  private cmdAbout(): TerminalLine[] {
    return [
      {
        type: 'output',
        text: '╔═══════════════════════════════════════════════╗',
        class: 'highlight',
      },
      {
        type: 'output',
        text: '║               AZIZ DRIDI                      ║',
        class: 'highlight',
      },
      {
        type: 'output',
        text: '╠═══════════════════════════════════════════════╣',
        class: 'highlight',
      },
      { type: 'output', text: '║  Role     : Full-Stack Developer & DevOps Eng ║', class: 'info' },
      { type: 'output', text: '║  Location : Tunisia                           ║', class: 'info' },
      { type: 'output', text: '║  Stack    : Angular, Node.js, Docker, AWS     ║', class: 'info' },
      { type: 'output', text: '║  Email    : dridiaziz28@gmail.com             ║', class: 'info' },
      {
        type: 'output',
        text: '╠═══════════════════════════════════════════════╣',
        class: 'highlight',
      },
      { type: 'output', text: '║  I build and deploy production-grade web      ║', class: 'info' },
      { type: 'output', text: '║  applications with modern CI/CD pipelines,    ║', class: 'info' },
      { type: 'output', text: '║  container orchestration, and scalable APIs.  ║', class: 'info' },
      {
        type: 'output',
        text: '╚═══════════════════════════════════════════════╝',
        class: 'highlight',
      },
    ];
  }

  private cmdProjects(): TerminalLine[] {
    return [
      { type: 'system', text: '── Portfolio Projects ──────────────────────' },
      { type: 'output', text: '' },
      { type: 'output', text: '  ◆ My Portfolio (Angular + Express)', class: 'project' },
      { type: 'output', text: '    └─ This site! Server-rendered Angular with', class: 'info' },
      { type: 'output', text: '       Spotify integration and CI/CD pipeline.', class: 'info' },
      { type: 'output', text: '' },
      { type: 'output', text: '  ◆ Zero-Downtime Deployer (Docker + Nginx)', class: 'project' },
      { type: 'output', text: '    └─ Blue-green deployment automation with', class: 'info' },
      { type: 'output', text: '       health checks and graceful proxy reload.', class: 'info' },
      { type: 'output', text: '' },
      {
        type: 'output',
        text: '  ◆ API Performance Toolkit (Node.js + Postgres)',
        class: 'project',
      },
      { type: 'output', text: '    └─ Query analyzer and indexing optimizer for', class: 'info' },
      { type: 'output', text: '       high-throughput Express applications.', class: 'info' },
      { type: 'system', text: '────────────────────────────────────────────' },
    ];
  }

  private cmdSkills(): TerminalLine[] {
    const skills = [
      { name: 'Angular / TypeScript', level: 92 },
      { name: 'Node.js / Express   ', level: 88 },
      { name: 'Docker / Containers  ', level: 85 },
      { name: 'PostgreSQL / MongoDB ', level: 80 },
      { name: 'CI/CD Pipelines      ', level: 82 },
      { name: 'Nginx / Reverse Proxy', level: 78 },
      { name: 'AWS / Cloud Services ', level: 75 },
      { name: 'Linux Administration ', level: 83 },
    ];

    const header: TerminalLine[] = [
      { type: 'system', text: '── Skills Proficiency ──────────────────────' },
      { type: 'output', text: '' },
    ];

    const bars: TerminalLine[] = skills.map((skill) => {
      const filled = Math.round(skill.level / 5);
      const empty = 20 - filled;
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      return {
        type: 'output' as const,
        text: `  ${skill.name} ${bar} ${skill.level}%`,
        class: 'skill-bar',
      };
    });

    return [
      ...header,
      ...bars,
      { type: 'output', text: '' },
      { type: 'system', text: '────────────────────────────────────────────' },
    ];
  }

  private cmdBlog(): TerminalLine[] {
    const posts = this.blogService.getPosts();
    const header: TerminalLine[] = [
      { type: 'system', text: '── Recent Blog Posts ───────────────────────' },
      { type: 'output', text: '' },
    ];

    const postLines: TerminalLine[] = posts.flatMap((post) => [
      { type: 'output' as const, text: `  ▸ ${post.title}`, class: 'blog-title' },
      {
        type: 'output' as const,
        text: `    slug: ${post.slug}  |  ${post.readTime}  |  ${post.publishedAt}`,
        class: 'info',
      },
      { type: 'output' as const, text: '' },
    ]);

    return [
      ...header,
      ...postLines,
      { type: 'system', text: '  Use "cat <slug>" to read an article.' },
      { type: 'system', text: '────────────────────────────────────────────' },
    ];
  }

  private cmdCat(args: string[]): TerminalLine[] {
    if (args.length === 0) {
      return [
        { type: 'error', text: 'Usage: cat <slug>' },
        { type: 'system', text: 'Run "blog" to see available slugs.' },
      ];
    }

    const slug = args[0];
    const post = this.blogService.getPostBySlug(slug);

    if (!post) {
      return [
        { type: 'error', text: `cat: ${slug}: No such article found` },
        { type: 'system', text: 'Run "blog" to see available slugs.' },
      ];
    }

    // Strip HTML tags and convert to plain text lines
    const plainText = post.content
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const outputLines: TerminalLine[] = [
      { type: 'system', text: `── cat ${slug} ──────────────────────────` },
      { type: 'output', text: '' },
      { type: 'output', text: `  Title:    ${post.title}`, class: 'highlight' },
      { type: 'output', text: `  Category: ${post.category}  |  ${post.readTime}`, class: 'info' },
      { type: 'output', text: `  Tags:     ${post.tags.join(', ')}`, class: 'info' },
      { type: 'output', text: '' },
      { type: 'system', text: '  ─────────────────────────────────────────' },
      { type: 'output', text: '' },
    ];

    plainText.forEach((line) => {
      outputLines.push({ type: 'output', text: `  ${line}`, class: 'article-text' });
    });

    outputLines.push({ type: 'output', text: '' });
    outputLines.push({ type: 'system', text: '────────────────────────────────────────────' });

    return outputLines;
  }

  private scrollToBottom(): void {
    const el = this.terminalBody?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(e: KeyboardEvent): void {
    // Focus input when user starts typing anywhere on the terminal page
    if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
      this.focusInput();
    }
  }
}
