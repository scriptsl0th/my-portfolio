import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="btt" [class.visible]="visible()" (click)="scrollTop()" aria-label="Back to top">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  `,
  styles: [`
    .btt {
      position: fixed; bottom: 2rem; right: 2rem; z-index: 80;
      width: 44px; height: 44px; border-radius: 50%;
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: var(--transition);
      opacity: 0; pointer-events: none; transform: translateY(12px);
    }
    .btt.visible { opacity: 1; pointer-events: all; transform: translateY(0); }
    .btt:hover { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-accent-dim); transform: translateY(-2px); }
  `],
})
export class BackToTopComponent {
  visible = signal(false);

  @HostListener('window:scroll')
  onScroll(): void { this.visible.set(window.scrollY > 400); }

  scrollTop(): void { window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
