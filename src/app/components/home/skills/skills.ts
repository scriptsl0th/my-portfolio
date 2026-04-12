import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Skill { name: string; icon: string; }
interface SkillCategory { label: string; index: string; skills: Skill[]; }

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class SkillsComponent {
  categories: SkillCategory[] = [
    { label: 'Backend', index: '01', skills: [
      { name: 'Python',      icon: 'https://img.icons8.com/?size=48&id=13441&format=png&color=ffffff' },
      { name: 'Django',      icon: 'https://img.icons8.com/?size=48&id=qV-JzWYl9dzP&format=png' },
      { name: 'Node.js',     icon: 'https://img.icons8.com/?size=48&id=hsPbhkOH4FMe&format=png' },
      { name: 'Spring Boot', icon: 'https://img.icons8.com/?size=48&id=90519&format=png' },
      { name: 'Java',        icon: 'https://img.icons8.com/?size=48&id=GPfHz0SM85FX&format=png&color=ffffff' },
      { name: 'TypeScript',  icon: 'https://img.icons8.com/?size=48&id=uJM6fQYqDaZK&format=png' },
    ]},
    { label: 'Frontend', index: '02', skills: [
      { name: 'Angular',    icon: 'https://img.icons8.com/?size=48&id=6SWtW8hxZWSo&format=png' },
      { name: 'React.js',   icon: 'https://img.icons8.com/?size=48&id=asWSSTBrDlTW&format=png' },
      { name: 'JavaScript', icon: 'https://img.icons8.com/?size=48&id=108784&format=png' },
      { name: 'Tailwind',   icon: 'https://img.icons8.com/?size=48&id=CIAZz2CYc6Kc&format=png' },
    ]},
    { label: 'Infrastructure & Cloud', index: '03', skills: [
      { name: 'Docker',     icon: 'https://img.icons8.com/?size=48&id=cdYUlRaag9G9&format=png' },
      { name: 'Kubernetes', icon: 'https://img.icons8.com/?size=48&id=cvzmaEA4kC0o&format=png' },
      { name: 'Kafka',      icon: 'https://img.icons8.com/?size=48&id=fOhLNqGJsUbJ&format=png' },
      { name: 'Redis',      icon: 'https://img.icons8.com/?size=48&id=pHS3eRpynIRQ&format=png' },
      { name: 'Keycloak',   icon: 'https://img.icons8.com/fluency/48/key-cloak.png' },
      { name: 'Prometheus', icon: 'https://img.icons8.com/?size=48&id=lOqoeP2Zy02f&format=png' },
      { name: 'Grafana',    icon: 'https://img.icons8.com/?size=48&id=9uVrNMu3Zx1K&format=png' },
    ]},
    { label: 'Databases', index: '04', skills: [
      { name: 'PostgreSQL', icon: 'https://img.icons8.com/?size=48&id=38561&format=png' },
      { name: 'MongoDB',    icon: 'https://img.icons8.com/?size=48&id=8rKdRqZFLurS&format=png' },
      { name: 'MySQL',      icon: 'https://img.icons8.com/?size=48&id=9nLaR5KFGjN0&format=png' },
    ]},
  ];
}
