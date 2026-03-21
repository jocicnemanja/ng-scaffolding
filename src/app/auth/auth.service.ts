import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser } from './auth.model';

const STORAGE_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private currentUser = signal<AuthUser | null>(this.loadFromStorage());

  user = this.currentUser.asReadonly();
  isAuthenticated = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  token = computed(() => {
    const user = this.currentUser();
    return user ? `session-${user.id}` : null;
  });

  login(email: string, _password: string): boolean {
    // Mock authentication — replace with real HTTP call
    const mockUsers: (AuthUser & { password: string })[] = [
      { id: 1, firstName: 'Alice', lastName: 'Johnson', email: 'admin@example.com', role: 'admin', password: 'admin' },
      { id: 2, firstName: 'Bob', lastName: 'Smith', email: 'user@example.com', role: 'editor', password: 'user' },
    ];

    const found = mockUsers.find((u) => u.email === email && u.password === _password);
    if (!found) return false;

    const { password: _, ...user } = found;
    this.currentUser.set(user);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return true;
  }

  register(firstName: string, lastName: string, email: string, _password: string): boolean {
    // Mock registration — replace with real HTTP call
    const user: AuthUser = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      role: 'viewer',
    };
    this.currentUser.set(user);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return true;
  }

  logout() {
    this.currentUser.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  private loadFromStorage(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
