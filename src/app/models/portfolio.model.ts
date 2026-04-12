export interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  type: 'full-time' | 'intern';
  projects: Project[];
  skills: string[];
}

export interface Project {
  name: string;
  bullets: string[];
}

export interface Skill {
  name: string;
  icon: string;
  category: string;
}

export interface SkillCategory {
  label: string;
  skills: Skill[];
}

export interface NavLink {
  label: string;
  href: string;
}
