import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../services/portfolio.service';
import { Experience } from '../../../models/portfolio.model';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
})
export class ExperienceComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  activeIndex = signal(0);
  experiences = signal<Experience[]>([]);

  ngOnInit(): void {
    this.experiences.set(this.portfolioService.getExperiences());
  }
}
