import { Injectable } from '@angular/core';
import { Experience, SkillCategory, NavLink } from '../models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class PortfolioService {

  getNavLinks(): NavLink[] {
    return [
      { label: 'About', href: '#about' },
      { label: 'Experience', href: '#experience' },
      { label: 'Skills', href: '#skills' },
      { label: 'Contact', href: '#contact' },
    ];
  }

  getExperiences(): Experience[] {
    return [
      {
        role: 'Software Developer',
        company: 'AdvyTeam',
        location: 'Lac 1, Tunisia',
        period: 'Oct. 2024 – Jul. 2025',
        type: 'full-time',
        projects: [
          {
            name: 'PeoplMap',
            bullets: [
              'Engineered a modular React.js frontend with real-time collaboration using WebSocket, Socket.IO, and LiveKit.',
              'Implemented backend synchronization and REST APIs with Node.js/Express for consistent multi-user sessions.',
              'Integrated JWT-based authentication and middleware to secure client-server communication.',
              'Optimized Redis caching and Socket.IO event handling for low-latency performance under high load.',
              'Refactored Redux with selective re-rendering, enhancing frontend responsiveness.',
            ],
          },
          {
            name: 'PeoplMap Administration',
            bullets: [
              'Engineered Django backend for admin dashboard to manage tenants and clients with secure REST APIs.',
              'Implemented RBAC and Angular routing guards, reducing access issues across user tiers.',
              'Automated admin workflows with Django/Apache and optimized caching, API endpoints, and DNS.',
              'Configured Keycloak for centralized authentication and role-based access management.',
            ],
          },
        ],
        skills: ['Django', 'DRF', 'Keycloak', 'WebSockets', 'React.js', 'Redux', 'Angular', 'Docker', 'PostgreSQL', 'Node.js', 'LiveKit'],
      },
      {
        role: 'Backend Developer Intern',
        company: 'Digitalberry',
        location: 'Lac 2, Tunisia',
        period: 'Feb. 2024 – Jun. 2024',
        type: 'intern',
        projects: [
          {
            name: 'Microservices Platform',
            bullets: [
              'Architected and deployed 5+ Django microservices with independent scaling and service isolation.',
              'Containerized the entire application stack with Docker and Docker Compose, reducing deployment time.',
              'Built a WebSocket-based chat system with image sharing across distributed microservices.',
              'Implemented Celery task scheduling with Redis broker and real-time monitoring via Flower dashboard.',
              'Designed JWT-based authentication with RBAC to secure all APIs, adhering to OWASP principles.',
              'Created RESTful APIs for 5 business domains ensuring inter-service data consistency.',
              'Integrated Prometheus, RedisInsight, and custom metrics for real-time system monitoring.',
            ],
          },
        ],
        skills: ['Django', 'DRF', 'PostgreSQL', 'Angular', 'Redis', 'Docker', 'Git', 'Celery', 'Prometheus'],
      },
    ];
  }

  getSkillCategories(): SkillCategory[] {
    return [
      {
        label: 'Backend',
        skills: [
          { name: 'Python', icon: 'python', category: 'backend' },
          { name: 'Django', icon: 'django', category: 'backend' },
          { name: 'Node.js', icon: 'nodejs', category: 'backend' },
          { name: 'Spring Boot', icon: 'spring', category: 'backend' },
          { name: 'Java', icon: 'java', category: 'backend' },
          { name: 'TypeScript', icon: 'typescript', category: 'backend' },
        ],
      },
      {
        label: 'Frontend',
        skills: [
          { name: 'Angular', icon: 'angular', category: 'frontend' },
          { name: 'React.js', icon: 'react', category: 'frontend' },
          { name: 'JavaScript', icon: 'javascript', category: 'frontend' },
          { name: 'Tailwind CSS', icon: 'tailwind', category: 'frontend' },
        ],
      },
      {
        label: 'Infrastructure & Cloud',
        skills: [
          { name: 'Docker', icon: 'docker', category: 'infra' },
          { name: 'Kubernetes', icon: 'kubernetes', category: 'infra' },
          { name: 'Apache Kafka', icon: 'kafka', category: 'infra' },
          { name: 'Redis', icon: 'redis', category: 'infra' },
          { name: 'Keycloak', icon: 'keycloak', category: 'infra' },
          { name: 'Prometheus', icon: 'prometheus', category: 'infra' },
          { name: 'Grafana', icon: 'grafana', category: 'infra' },
        ],
      },
      {
        label: 'Databases',
        skills: [
          { name: 'PostgreSQL', icon: 'postgresql', category: 'db' },
          { name: 'MongoDB', icon: 'mongodb', category: 'db' },
          { name: 'MySQL', icon: 'mysql', category: 'db' },
        ],
      },
    ];
  }

  getSkillIconUrl(icon: string): string {
    const iconMap: Record<string, string> = {
      python: 'https://img.icons8.com/?size=48&id=13441&format=png&color=ffffff',
      django: 'https://img.icons8.com/?size=48&id=qV-JzWYl9dzP&format=png',
      nodejs: 'https://img.icons8.com/?size=48&id=hsPbhkOH4FMe&format=png',
      spring: 'https://img.icons8.com/?size=48&id=90519&format=png',
      java: 'https://img.icons8.com/?size=48&id=GPfHz0SM85FX&format=png&color=ffffff',
      typescript: 'https://img.icons8.com/?size=48&id=uJM6fQYqDaZK&format=png',
      angular: 'https://img.icons8.com/?size=48&id=6SWtW8hxZWSo&format=png',
      react: 'https://img.icons8.com/?size=48&id=asWSSTBrDlTW&format=png',
      javascript: 'https://img.icons8.com/?size=48&id=108784&format=png',
      tailwind: 'https://img.icons8.com/?size=48&id=CIAZz2CYc6Kc&format=png',
      docker: 'https://img.icons8.com/?size=48&id=cdYUlRaag9G9&format=png',
      kubernetes: 'https://img.icons8.com/?size=48&id=cvzmaEA4kC0o&format=png',
      kafka: 'https://img.icons8.com/?size=48&id=fOhLNqGJsUbJ&format=png',
      redis: 'https://img.icons8.com/?size=48&id=pHS3eRpynIRQ&format=png',
      keycloak: 'https://img.icons8.com/fluency/48/key-cloak.png',
      prometheus: 'https://img.icons8.com/?size=48&id=lOqoeP2Zy02f&format=png',
      grafana: 'https://img.icons8.com/?size=48&id=9uVrNMu3Zx1K&format=png',
      postgresql: 'https://img.icons8.com/?size=48&id=38561&format=png',
      mongodb: 'https://img.icons8.com/?size=48&id=8rKdRqZFLurS&format=png',
      mysql: 'https://img.icons8.com/?size=48&id=9nLaR5KFGjN0&format=png',
    };
    return iconMap[icon] || '';
  }
}
