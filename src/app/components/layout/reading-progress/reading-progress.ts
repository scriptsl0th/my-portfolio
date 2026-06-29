import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reading-progress',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="reading-bar" [style.transform]="'scaleX(' + (progress() / 100) + ')'"></div>`,
  styles: [`
    .reading-bar {
      position: fixed; top: 0; left: 0; right: 0; height: 2px;
      background: var(--color-accent);
      z-index: 200; transform-origin: left;
      box-shadow: 0 0 8px var(--color-accent-glow);
    }
  `],
})
export class ReadingProgressComponent {
  progress = signal(0);

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.progress.set(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
  }
}
