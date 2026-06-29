import { Component, OnInit, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NowPlayingComponent } from '../now-playing/now-playing';

interface NavLink {
  label: string;
  href: string;
}

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
  private router = inject(Router);

  ngOnInit(): void {
    this.navLinks = [
      { label: 'About', href: '#about' },
      { label: 'Experience', href: '#experience' },
      { label: 'Projects', href: '#projects' },
      { label: 'Skills', href: '#skills' },
      { label: 'Blog', href: '/blog' },
      { label: 'Terminal', href: '/terminal' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Contact', href: '#contact' },
    ];
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
  }

  navigate(href: string): void {
    this.isMenuOpen.set(false);
    if (href.startsWith('#')) {
      if (this.router.url === '/' || this.router.url.startsWith('/#') || this.router.url === '') {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        this.router.navigate(['/'], { fragment: href.substring(1) });
      }
    } else {
      this.router.navigate([href]);
    }
  }
}
