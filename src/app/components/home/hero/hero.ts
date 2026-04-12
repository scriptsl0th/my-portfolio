import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalModalComponent } from '../../ui/terminal-modal';
import { OS_INFO, OsInfo } from '../../../lib/content-metadata/content-metadata';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, TerminalModalComponent],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class HeroComponent implements OnInit, OnDestroy {
  typedText = '';
  showCursor = true;
  activeOs = signal<OsInfo | null>(null);
  osList = OS_INFO;

  private words = ['Backend Engineer', 'Cloud Enthusiast', 'DevOps Explorer', 'Fullstack Developer'];
  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private typeTimer: any;
  private cursorTimer: any;

  ngOnInit(): void {
    this.type();
    this.cursorTimer = setInterval(() => this.showCursor = !this.showCursor, 530);
  }

  ngOnDestroy(): void {
    clearTimeout(this.typeTimer);
    clearInterval(this.cursorTimer);
  }

  private type(): void {
    const current = this.words[this.wordIndex];
    if (this.isDeleting) {
      this.typedText = current.slice(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      this.typedText = current.slice(0, this.charIndex + 1);
      this.charIndex++;
    }
    let delay = this.isDeleting ? 60 : 100;
    if (!this.isDeleting && this.charIndex === current.length) { delay = 2000; this.isDeleting = true; }
    else if (this.isDeleting && this.charIndex === 0) { this.isDeleting = false; this.wordIndex = (this.wordIndex + 1) % this.words.length; delay = 400; }
    this.typeTimer = setTimeout(() => this.type(), delay);
  }

  openOs(os: OsInfo): void { this.activeOs.set(os); }
  closeOs(): void { this.activeOs.set(null); }

  scrollTo(id: string): void {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
