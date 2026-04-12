import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OsInfo } from '../../lib/content-metadata/content-metadata';

interface TerminalLine {
  type: 'prompt' | 'output' | 'blank' | 'header';
  text?: string;
  label?: string;
  value?: string;
  color?: string;
}

@Component({
  selector: 'app-terminal-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terminal-modal.html',
  styleUrl: './terminal-modal.scss',
})
export class TerminalModalComponent implements OnInit, OnDestroy {
  @Input() os!: OsInfo;
  @Output() close = new EventEmitter<void>();

  lines: TerminalLine[] = [];
  visibleCount = 0;
  private timer: any;

  ngOnInit(): void {
    this.buildLines();
    this.animateLines();
    document.addEventListener('keydown', this.onKey);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    document.removeEventListener('keydown', this.onKey);
  }

  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.close.emit();
  };

  private buildLines(): void {
    this.lines = [
      { type: 'prompt', text: `neofetch --os ${this.os.name}` },
      { type: 'blank' },
      { type: 'header', text: this.os.hostname, color: this.os.color },
      { type: 'output', label: 'OS', value: this.os.version },
      { type: 'output', label: 'Kernel', value: this.os.kernel },
      { type: 'output', label: 'Shell', value: this.os.shell },
      { type: 'output', label: 'Uptime', value: this.os.uptime },
      { type: 'output', label: 'Packages', value: this.os.packages },
      { type: 'output', label: 'CPU', value: this.os.cpu },
      { type: 'output', label: 'Memory', value: this.os.memory },
      { type: 'blank' },
      { type: 'prompt', text: 'echo $USER' },
      { type: 'output', value: 'aziz' },
      { type: 'blank' },
      { type: 'prompt', text: 'whoami --verbose' },
      { type: 'output', value: 'Backend Engineer | Cloud Enthusiast | DevOps Explorer' },
      { type: 'blank' },
      { type: 'prompt', text: '' },
    ];
  }

  private animateLines(): void {
    const step = () => {
      if (this.visibleCount < this.lines.length) {
        this.visibleCount++;
        this.timer = setTimeout(step, 55);
      }
    };
    step();
  }

  get visibleLines(): TerminalLine[] {
    return this.lines.slice(0, this.visibleCount);
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('terminal-overlay')) {
      this.close.emit();
    }
  }
}
