import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/layout/navbar/navbar';
import { FooterComponent } from '../../components/layout/footer/footer';
import { BackToTopComponent } from '../../components/layout/back-to-top/back-to-top';

interface Container {
  name: string;
  status: 'running' | 'idle' | 'error';
  cpu: number;
  memory: number;
  uptime: string;
  port: string;
}

interface PipelineStage {
  name: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  duration?: string;
}

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  source: string;
  message: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, BackToTopComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private intervals: any[] = [];

  // System metrics
  cpuUsage = signal(34);
  memoryUsage = signal(62);
  diskUsage = signal(47);
  networkIn = signal(12.4);
  networkOut = signal(5.8);
  systemUptime = signal('47d 12h 33m');
  totalRequests = signal(284912);

  // CPU history for mini chart
  cpuHistory = signal<number[]>([28, 35, 32, 41, 38, 34, 29, 33, 37, 42, 36, 31, 34, 38, 35, 30, 33, 39, 36, 34]);

  // Containers
  containers = signal<Container[]>([
    { name: 'nginx-ingress', status: 'running', cpu: 2.1, memory: 128, uptime: '47d 12h', port: '80/443' },
    { name: 'portfolio-app', status: 'running', cpu: 8.3, memory: 256, uptime: '12d 6h', port: '4200' },
    { name: 'postgres-db', status: 'running', cpu: 4.7, memory: 512, uptime: '47d 12h', port: '5432' },
    { name: 'redis-cache', status: 'running', cpu: 1.2, memory: 64, uptime: '30d 4h', port: '6379' },
    { name: 'jenkins-runner', status: 'running', cpu: 15.6, memory: 1024, uptime: '5d 18h', port: '8080' },
    { name: 'grafana-monitor', status: 'idle', cpu: 0.0, memory: 192, uptime: '—', port: '3000' },
  ]);

  // Pipeline
  pipelineStages = signal<PipelineStage[]>([
    { name: 'Clone', status: 'completed', duration: '3s' },
    { name: 'Install', status: 'completed', duration: '28s' },
    { name: 'Lint', status: 'completed', duration: '12s' },
    { name: 'Build', status: 'running' },
    { name: 'Test', status: 'pending' },
    { name: 'Deploy', status: 'pending' },
  ]);

  pipelineBranch = signal('main');
  pipelineCommit = signal('a3f82c1');

  // Logs
  logs = signal<LogEntry[]>([
    { timestamp: '14:32:01', level: 'INFO', source: 'nginx', message: 'GET /api/health 200 OK (2ms)' },
    { timestamp: '14:32:03', level: 'DEBUG', source: 'redis', message: 'Cache HIT for key: session:usr_10452' },
    { timestamp: '14:32:05', level: 'INFO', source: 'postgres', message: 'Query executed: SELECT * FROM "Users" (0.4ms)' },
    { timestamp: '14:32:08', level: 'WARN', source: 'jenkins', message: 'Build #247: Stage "Build" taking longer than expected' },
    { timestamp: '14:32:11', level: 'INFO', source: 'nginx', message: 'GET /assets/main.js 200 OK (1ms)' },
    { timestamp: '14:32:14', level: 'INFO', source: 'app', message: 'SSR render completed for route / (34ms)' },
  ]);

  // Computed
  runningContainers = computed(() =>
    this.containers().filter(c => c.status === 'running').length
  );

  totalContainers = computed(() => this.containers().length);

  ngOnInit(): void {
    // Simulate CPU fluctuation
    this.intervals.push(setInterval(() => {
      this.cpuUsage.update(v => {
        const delta = (Math.random() - 0.5) * 12;
        return Math.max(5, Math.min(95, Math.round(v + delta)));
      });
      this.cpuHistory.update(h => {
        const newH = [...h.slice(1), this.cpuUsage()];
        return newH;
      });
    }, 2000));

    // Simulate memory fluctuation
    this.intervals.push(setInterval(() => {
      this.memoryUsage.update(v => {
        const delta = (Math.random() - 0.5) * 4;
        return Math.max(30, Math.min(90, Math.round(v + delta)));
      });
    }, 3000));

    // Simulate network traffic
    this.intervals.push(setInterval(() => {
      this.networkIn.set(+(Math.random() * 25 + 2).toFixed(1));
      this.networkOut.set(+(Math.random() * 12 + 1).toFixed(1));
    }, 2500));

    // Simulate request counter
    this.intervals.push(setInterval(() => {
      this.totalRequests.update(v => v + Math.floor(Math.random() * 5));
    }, 1000));

    // Simulate container CPU fluctuations
    this.intervals.push(setInterval(() => {
      this.containers.update(containers => containers.map(c => {
        if (c.status !== 'running') return c;
        const delta = (Math.random() - 0.5) * 6;
        return { ...c, cpu: Math.max(0.1, +(c.cpu + delta).toFixed(1)) };
      }));
    }, 3000));

    // Simulate log entries
    this.intervals.push(setInterval(() => {
      this.addRandomLog();
    }, 4000));

    // Simulate pipeline progression
    this.intervals.push(setInterval(() => {
      this.advancePipeline();
    }, 8000));
  }

  ngOnDestroy(): void {
    this.intervals.forEach(i => clearInterval(i));
  }

  private addRandomLog(): void {
    const sources = ['nginx', 'postgres', 'redis', 'jenkins', 'app', 'docker'];
    const levels: LogEntry['level'][] = ['INFO', 'INFO', 'INFO', 'DEBUG', 'WARN', 'ERROR'];
    const messages = [
      'GET /api/health 200 OK (2ms)',
      'Connection pool: 12/50 connections active',
      'Cache MISS for key: assets:bundle_hash',
      'Worker process spawned (PID: 4821)',
      'TLS handshake completed (TLSv1.3)',
      'Query plan cache refreshed',
      'Container health check: PASS',
      'Rate limiter: 142 req/min (threshold: 500)',
      'Garbage collection completed (12ms)',
      'WebSocket connection established',
      'Build artifact uploaded to registry',
      'Memory pressure alert cleared',
    ];

    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const newLog: LogEntry = {
      timestamp: ts,
      level: levels[Math.floor(Math.random() * levels.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
    };

    this.logs.update(l => [...l.slice(-25), newLog]);
  }

  private advancePipeline(): void {
    this.pipelineStages.update(stages => {
      const runningIdx = stages.findIndex(s => s.status === 'running');
      if (runningIdx === -1) return stages;

      const updated = stages.map((s, i) => {
        if (i === runningIdx) {
          return { ...s, status: 'completed' as const, duration: `${Math.floor(Math.random() * 30 + 5)}s` };
        }
        if (i === runningIdx + 1) {
          return { ...s, status: 'running' as const };
        }
        return s;
      });

      // If all completed, reset after a delay
      if (updated.every(s => s.status === 'completed')) {
        setTimeout(() => {
          this.pipelineStages.set([
            { name: 'Clone', status: 'completed', duration: '3s' },
            { name: 'Install', status: 'running' },
            { name: 'Lint', status: 'pending' },
            { name: 'Build', status: 'pending' },
            { name: 'Test', status: 'pending' },
            { name: 'Deploy', status: 'pending' },
          ]);
          this.pipelineCommit.set(
            Math.random().toString(16).substring(2, 9)
          );
        }, 3000);
      }

      return updated;
    });
  }

  getCpuChartPath(): string {
    const history = this.cpuHistory();
    const width = 200;
    const height = 40;
    const points = history.map((val, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - (val / 100) * height;
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  }

  getCpuChartAreaPath(): string {
    const history = this.cpuHistory();
    const width = 200;
    const height = 40;
    const points = history.map((val, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - (val / 100) * height;
      return `${x},${y}`;
    });
    return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'running': return 'var(--color-terminal-green)';
      case 'completed': return 'var(--color-terminal-green)';
      case 'idle': return 'var(--color-terminal-yellow)';
      case 'pending': return 'var(--color-text-muted)';
      case 'error':
      case 'failed': return 'var(--color-terminal-red)';
      default: return 'var(--color-text-muted)';
    }
  }

  getLogLevelClass(level: string): string {
    switch (level) {
      case 'INFO': return 'log-info';
      case 'WARN': return 'log-warn';
      case 'ERROR': return 'log-error';
      case 'DEBUG': return 'log-debug';
      default: return '';
    }
  }
}
