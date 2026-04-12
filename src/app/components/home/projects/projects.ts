import { Component, ElementRef, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Project {
  category: string;
  title: string;
  description: string;
  features: string[];
  technologies: string[];
  url?: string;
  isPrivate: boolean;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class ProjectsComponent {
  @ViewChild('slider') sliderRef!: ElementRef<HTMLDivElement>;

  activeIndex = signal(0);

  projects: Project[] = [
    {
      category: 'Collaboration platform',
      title: 'PeoplMap',
      description: 'Immersive video conferencing platform transforming remote work with 3D virtual offices and lifelike avatars. Features AI-powered meeting transcription, seamless calendar integration, and secure sovereign hosting.',
      features: [
        'Immersive 3D Virtual Offices',
        'AI Meeting Transcription',
        'Sovereign & Secure Hosting',
        'LiveKit & Socket.IO Integration',
      ],
      technologies: ['React.js', 'Redux', 'Node.js', 'PostgreSQL', 'Docker', 'Keycloak', 'Socket.IO', 'LiveKit'],
      url: undefined,
      isPrivate: false,
    },
    {
      category: 'PeoplMap Management System',
      title: 'PeoplMap Administration',
      description: 'Management system for PeoplMap platform. Allows admin to manage users, realms, domains, and virtual offices with RBAC-secured access and optimised workflows.',
      features: [
        'User management',
        'Realm and Domain management',
        'Virtual office management',
        'Reduced virtual office creation time by 40%',
      ],
      technologies: ['Angular', 'Django', 'Django REST Framework', 'PostgreSQL', 'Docker', 'Bash', 'Apache'],
      url: undefined,
      isPrivate: true,
    },
    {
      category: 'Monitoring System',
      title: 'BerryChron',
      description: 'Monitoring system for DigitalBerry. Allows admin to monitor tasks (Certificates, CSRs, and more) and their status alongside microservice health — improving monitoring efficiency by 30%.',
      features: [
        'Real-time monitoring',
        'Task management',
        'System status monitoring',
        'Improved monitoring efficiency by 30%',
      ],
      technologies: ['Django', 'Django REST Framework', 'Angular', 'Redis', 'Celery', 'PostgreSQL', 'GitLab', 'Docker'],
      url: undefined,
      isPrivate: true,
    },
    {
      category: 'Microservices Platform',
      title: 'DigitalBerry Platform',
      description: 'Scalable microservices architecture spanning authentication, task scheduling, real-time chat with image sharing, cryptography, and notifications — monitored with Prometheus and RedisInsight.',
      features: [
        '5+ independent Django microservices',
        'WebSocket-based chat with image sharing',
        'Celery task scheduling with Flower dashboard',
        'JWT + RBAC authentication (OWASP-compliant)',
      ],
      technologies: ['Django', 'DRF', 'Redis', 'Celery', 'PostgreSQL', 'Docker', 'Prometheus', 'Git'],
      url: undefined,
      isPrivate: true,
    },
  ];

  canPrev = computed(() => this.activeIndex() > 0);
  canNext = computed(() => this.activeIndex() < this.projects.length - 1);

  prev(): void {
    if (this.canPrev()) {
      this.activeIndex.update(i => i - 1);
      this.scrollToActive();
    }
  }

  next(): void {
    if (this.canNext()) {
      this.activeIndex.update(i => i + 1);
      this.scrollToActive();
    }
  }

  goTo(index: number): void {
    this.activeIndex.set(index);
    this.scrollToActive();
  }

  private scrollToActive(): void {
    setTimeout(() => {
      const slider = this.sliderRef?.nativeElement;
      if (!slider) return;
      const card = slider.children[this.activeIndex()] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 30);
  }

  getTechSlice(techs: string[]): string[] {
    return techs.slice(0, 6);
  }

  getOverflow(techs: string[]): number {
    return Math.max(0, techs.length - 6);
  }
}
