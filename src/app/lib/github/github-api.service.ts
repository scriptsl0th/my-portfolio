import { Injectable, signal } from '@angular/core';

export interface GithubStats {
  followers: number;
  repos: number;
}

@Injectable({ providedIn: 'root' })
export class GithubApiService {
  stats = signal<GithubStats>({ followers: 0, repos: 0 });

  async fetchStats(): Promise<void> {
    try {
      const res = await fetch('https://api.github.com/users/scriptsl0th');
      if (res.ok) {
        const data = await res.json();
        this.stats.set({ followers: data.followers ?? 0, repos: data.public_repos ?? 0 });
      }
    } catch { /* silently fail */ }
  }
}
