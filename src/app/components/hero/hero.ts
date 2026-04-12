import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class HeroComponent implements OnInit, OnDestroy {
  typedText = '';
  private words = ['Backend Engineer', 'Cloud Enthusiast', 'DevOps Explorer', 'Fullstack Developer'];
  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private timer: any;
  showCursor = true;
  private cursorTimer: any;

  ngOnInit(): void {
    this.type();
    this.cursorTimer = setInterval(() => this.showCursor = !this.showCursor, 530);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
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

    if (!this.isDeleting && this.charIndex === current.length) {
      delay = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.words.length;
      delay = 400;
    }

    this.timer = setTimeout(() => this.type(), delay);
  }

  scrollToContact(): void {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToAbout(): void {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  }
}
