import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },

  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'applications', loadComponent: () => import('./features/applications/components/applications-list/applications-list.component').then(m => m.ApplicationsListComponent) },
      { path: 'pipeline', loadComponent: () => import('./pages/applications/applications-kanban/applications-kanban.component').then(m => m.ApplicationsKanbanComponent) },
      { path: 'applications/:id', loadComponent: () => import('./features/applications/components/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'applications' }, // Default to applications
    ],
  },

  { path: '**', redirectTo: 'applications' }, // Fallback
];
