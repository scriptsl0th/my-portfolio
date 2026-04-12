import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { ScrollService } from '../../services/scroll.service';
import { NavLink } from '../../models/portfolio.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  private scrollService = inject(ScrollService);

  navLinks: NavLink[] = [];
  isScrolled = false;
  isMenuOpen = false;

  ngOnInit(): void {
    this.navLinks = this.portfolioService.getNavLinks();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  navigate(href: string): void {
    this.isMenuOpen = false;
    this.scrollService.scrollTo(href);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
