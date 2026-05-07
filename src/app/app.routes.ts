import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './auth/auth.guards';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.Register), canActivate: [guestGuard] },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.Dashboard), canActivate: [authGuard] },
  { path: 'users', loadComponent: () => import('./users/users-list/users-list.component').then(m => m.UsersList), canActivate: [authGuard] },
  { path: 'users-2', loadComponent: () => import('./users/users-list-2/users-list-2.component').then(m => m.UsersList2), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./admin/admin.component').then(m => m.Admin), canActivate: [authGuard, adminGuard] },
  { path: 'posts', loadComponent: () => import('./posts/posts').then(m => m.Posts), canActivate: [authGuard] },
  { path: 'playground', loadComponent: () => import('ui-sdk').then(m => m.Playground) },
];
