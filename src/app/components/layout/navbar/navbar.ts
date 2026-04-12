import { Component, OnInit, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NowPlayingComponent } from '../now-playing/now-playing';

interface NavLink { label: string; href: string; }

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NowPlayingComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent implements OnInit {
  navLinks: NavLink[] = [];
  isScrolled = signal(false);
  isMenuOpen = signal(false);

  ngOnInit(): void {
    this.navLinks = [
      { label: 'About',      href: '#about' },
      { label: 'Experience', href: '#experience' },
      { label: 'Projects',   href: '#projects' },
      { label: 'Skills',     href: '#skills' },
      { label: 'Contact',    href: '#contact' },
    ];
  }

  @HostListener('window:scroll')
  onScroll(): void { this.isScrolled.set(window.scrollY > 50); }

  navigate(href: string): void {
    this.isMenuOpen.set(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  }
}
