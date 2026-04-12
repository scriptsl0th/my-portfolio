import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyService } from '../../../lib/spotify/spotify.service';

@Component({
  selector: 'app-now-playing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './now-playing.html',
  styleUrl: './now-playing.scss',
})
export class NowPlayingComponent implements OnInit, OnDestroy {
  spotify = inject(SpotifyService);
  track = this.spotify.track;

  progressPct = computed(() => {
    const t = this.track();
    if (!t.isPlaying || t.durationMs === 0) return 0;
    return Math.min(100, (t.progressMs / t.durationMs) * 100);
  });

  formattedProgress = computed(() => this.formatMs(this.track().progressMs));
  formattedDuration  = computed(() => this.formatMs(this.track().durationMs));

  private progressTimer: any;

  ngOnInit(): void {
    this.spotify.startPolling(30_000);
    this.progressTimer = setInterval(() => {
      const t = this.track();
      if (t.isPlaying && t.progressMs < t.durationMs) {
        this.spotify.track.update(v => ({ ...v, progressMs: v.progressMs + 1000 }));
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    this.spotify.stopPolling();
    clearInterval(this.progressTimer);
  }

  private formatMs(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
}
