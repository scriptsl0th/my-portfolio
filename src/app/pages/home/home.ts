import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent }         from '../../components/layout/navbar/navbar';
import { FooterComponent }          from '../../components/layout/footer/footer';
import { BackToTopComponent }       from '../../components/layout/back-to-top/back-to-top';
import { ReadingProgressComponent } from '../../components/layout/reading-progress/reading-progress';
import { HeroComponent }            from '../../components/home/hero/hero';
import { AboutMeComponent }         from '../../components/home/about-me/about-me';
import { ExperienceComponent }      from '../../components/home/experience/experience';
import { ProjectsComponent }        from '../../components/home/projects/projects';
import { SkillsComponent }          from '../../components/home/skills/skills';
import { ContactComponent }         from '../../components/home/contact/contact';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent, FooterComponent, BackToTopComponent, ReadingProgressComponent,
    HeroComponent, AboutMeComponent, ExperienceComponent,
    ProjectsComponent, SkillsComponent, ContactComponent,
  ],
  template: `
    <app-reading-progress />
    <app-navbar />
    <main>
      <app-hero />
      <app-about-me />
      <app-experience />
      <app-projects />
      <app-skills />
      <app-contact />
    </main>
    <app-footer />
    <app-back-to-top />
  `,
  styles: [`main { background: var(--color-bg); }`],
})
export class HomePageComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
        { threshold: 0.08 }
      );
      document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }, 120);
  }
}
