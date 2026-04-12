import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { Experience } from '../../models/portfolio.model';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
})
export class ExperienceComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  experiences: Experience[] = [];
  activeIndex = 0;

  ngOnInit(): void {
    this.experiences = this.portfolioService.getExperiences();
  }

  setActive(index: number): void {
    this.activeIndex = index;
  }
}
