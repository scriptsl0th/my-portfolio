import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog-list/blog-list').then((m) => m.BlogListComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./pages/blog-detail/blog-detail').then((m) => m.BlogDetailComponent),
  },
  {
    path: 'terminal',
    loadComponent: () => import('./pages/terminal/terminal').then((m) => m.TerminalPageComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.DashboardPageComponent),
  },
  { path: '**', redirectTo: '' },
];
