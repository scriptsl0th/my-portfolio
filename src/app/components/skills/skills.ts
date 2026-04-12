import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { SkillCategory } from '../../models/portfolio.model';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class SkillsComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  categories: SkillCategory[] = [];

  ngOnInit(): void {
    this.categories = this.portfolioService.getSkillCategories();
  }

  getIconUrl(icon: string): string {
    return this.portfolioService.getSkillIconUrl(icon);
  }
}
