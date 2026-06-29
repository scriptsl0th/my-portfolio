import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  HostListener,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { BlogService, BlogPost } from '../../services/blog/blog.service';
import { NavbarComponent } from '../../components/layout/navbar/navbar';
import { FooterComponent } from '../../components/layout/footer/footer';
import { ReadingProgressComponent } from '../../components/layout/reading-progress/reading-progress';
import { BackToTopComponent } from '../../components/layout/back-to-top/back-to-top';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    ReadingProgressComponent,
    BackToTopComponent,
  ],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.scss',
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);

  slug = signal<string>('');
  isTerminalMode = signal(false);
  private observer: IntersectionObserver | null = null;

  post = computed(() => {
    return this.blogService.getPostBySlug(this.slug());
  });

  adjacentPosts = computed(() => {
    return this.blogService.getAdjacentPosts(this.slug());
  });

  relatedPosts = computed(() => {
    return this.blogService.getRelatedPosts(this.slug(), 2);
  });

  processedContent = computed(() => {
    const rawContent = this.post()?.content || '';
    return rawContent.replace(
      /<div class="code-header">\s*<span class="code-title">(.*?)<\/span>\s*<\/div>/g,
      `<div class="code-header">
        <span class="code-title">$1</span>
        <button class="copy-btn" aria-label="Copy code">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy</span>
        </button>
      </div>`,
    );
  });

  terminalContent = computed(() => {
    const currentPost = this.post();
    if (!currentPost) return '';

    // Strip HTML tags for terminal view
    const content = currentPost.content;
    const temp = document.createElement('div');
    temp.innerHTML = content;
    return temp.textContent || temp.innerText || '';
  });

  constructor() {
    // Re-observe fade-in elements whenever terminal mode changes
    effect(() => {
      // Read the signal to trigger the effect
      this.isTerminalMode();

      // Wait for DOM to update
      setTimeout(() => {
        this.setupFadeInObserver();
      }, 50);
    });
  }

  toggleMode(): void {
    this.isTerminalMode.update((v) => !v);
  }

  private setupFadeInObserver(): void {
    // Clean up existing observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Create new observer
    this.observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        }),
      { threshold: 0.05 },
    );

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach((el) => this.observer!.observe(el));
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slugVal = params.get('slug') || '';
      this.slug.set(slugVal);
      window.scrollTo({ top: 0 });

      if (slugVal && !this.blogService.getPostBySlug(slugVal)) {
        this.router.navigate(['/blog']);
      }

      // Reset terminal mode when navigating to new post
      this.isTerminalMode.set(false);
    });

    setTimeout(() => {
      this.setupFadeInObserver();
    }, 150);
  }

  @HostListener('click', ['$event'])
  onComponentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const copyBtn = target.closest('.copy-btn') as HTMLButtonElement;
    if (copyBtn) {
      const codeFrame = copyBtn.closest('.code-frame');
      const codeBlock = codeFrame?.querySelector('code');
      if (codeBlock) {
        const codeText = codeBlock.innerText;
        navigator.clipboard.writeText(codeText).then(() => {
          const btnSpan = copyBtn.querySelector('span');
          if (btnSpan) {
            btnSpan.innerText = 'Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
              btnSpan.innerText = 'Copy';
              copyBtn.classList.remove('copied');
            }, 2000);
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
