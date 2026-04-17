import { Component, signal, viewChild, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header.component';
import { SideNav, NavItem } from './shared/components/side-nav/side-nav.component';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'kim-root',
  imports: [RouterOutlet, Header, SideNav],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  protected readonly title = signal('ng-scaffolding');
  protected auth = inject(AuthService);

  private sideNav = viewChild(SideNav);

  private readonly baseNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    },
    {
      label: 'Users',
      route: '/users',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    },
  ];

  private readonly adminNavItem: NavItem = {
    label: 'Admin',
    route: '/admin',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  };

  protected navItems = computed(() => {
    const items = [...this.baseNavItems];
    if (this.auth.isAdmin()) {
      items.push(this.adminNavItem);
    }
    return items;
  });

  protected toggleSideNav() {
    this.sideNav()?.toggle();
  }
}
