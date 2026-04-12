import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubApiService } from '../../../lib/github/github-api.service';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-me.html',
  styleUrl: './about-me.scss',
})
export class AboutMeComponent implements OnInit {
  github = inject(GithubApiService);

  certifications = [
    { name: 'Oracle Cloud Infrastructure Foundations Associate', issuer: 'Oracle', year: '2024' },
    { name: 'Engineering Degree — Cloud Computing', issuer: 'ESPRIT', year: 'In Progress' },
  ];

  ngOnInit(): void { this.github.fetchStats(); }

  get stats() {
    return [
      { value: '2+', label: 'Years Experience' },
      { value: '1K+', label: 'Users Served' },
      { value: String(this.github.stats().followers), label: 'GitHub Followers' },
      { value: String(this.github.stats().repos), label: 'Public Repos' },
    ];
  }
}
