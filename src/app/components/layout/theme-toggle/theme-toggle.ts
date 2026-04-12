import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../lib/theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-btn" (click)="theme.toggle()" [title]="theme.isDark() ? 'Switch to light' : 'Switch to dark'">
      @if (theme.isDark()) {
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      } @else {
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      }
    </button>
  `,
  styles: [`
    .theme-btn {
      width: 36px; height: 36px; border-radius: var(--radius-md);
      background: var(--color-bg-card); border: 1px solid var(--color-border);
      color: var(--color-text-secondary); display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: var(--transition);
      &:hover { border-color: var(--color-border-hover); color: var(--color-accent); }
    }
  `],
})
export class ThemeToggleComponent {
  theme = inject(ThemeService);
}
