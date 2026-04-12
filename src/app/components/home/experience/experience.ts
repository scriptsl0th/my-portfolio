import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ExpProject { name: string; bullets: string[]; }
interface Experience { role: string; company: string; location: string; period: string; type: 'full-time'|'intern'; projects: ExpProject[]; skills: string[]; }

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
})
export class ExperienceComponent implements OnInit {
  activeIndex = signal(0);
  experiences: Experience[] = [];

  ngOnInit(): void {
    this.experiences = [
      { role: 'Software Developer', company: 'AdvyTeam', location: 'Lac 1, Tunisia', period: 'Oct. 2024 – Jul. 2025', type: 'full-time',
        projects: [
          { name: 'PeoplMap', bullets: [
            'Engineered a modular React.js frontend with real-time collaboration using WebSocket, Socket.IO, and LiveKit.',
            'Implemented backend sync and REST APIs with Node.js/Express for consistent multi-user sessions.',
            'Integrated JWT-based auth and middleware to secure client-server communication.',
            'Optimised Redis caching and Socket.IO event handling for low-latency performance under high load.',
            'Refactored Redux with selective re-rendering, enhancing frontend responsiveness.',
          ]},
          { name: 'PeoplMap Administration', bullets: [
            'Engineered Django backend for admin dashboard to manage tenants and clients with secure REST APIs.',
            'Implemented RBAC and Angular routing guards, reducing access issues across user tiers.',
            'Automated admin workflows with Django/Apache, optimised caching, API endpoints, and DNS.',
            'Configured Keycloak for centralised authentication and role-based access management.',
          ]},
        ],
        skills: ['Django','DRF','Keycloak','WebSockets','React.js','Redux','Angular','Docker','PostgreSQL','Node.js','LiveKit'],
      },
      { role: 'Backend Developer Intern', company: 'Digitalberry', location: 'Lac 2, Tunisia', period: 'Feb. 2024 – Jun. 2024', type: 'intern',
        projects: [
          { name: 'Microservices Platform', bullets: [
            'Architected and deployed 5+ Django microservices with independent scaling and service isolation.',
            'Containerised the entire application stack with Docker and Docker Compose, reducing deployment time.',
            'Built a WebSocket-based chat system with image sharing across distributed microservices.',
            'Implemented Celery task scheduling with Redis broker and real-time monitoring via Flower.',
            'Designed JWT-based auth with RBAC securing all APIs, adhering to OWASP principles.',
            'Created RESTful APIs for 5 business domains ensuring inter-service data consistency.',
            'Integrated Prometheus, RedisInsight, and custom metrics for real-time system monitoring.',
          ]},
        ],
        skills: ['Django','DRF','PostgreSQL','Angular','Redis','Docker','Git','Celery','Prometheus'],
      },
    ];
  }
}
