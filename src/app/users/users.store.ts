import { Injectable, signal, computed } from '@angular/core';
import { MOCK_USERS, User } from './user.model';

@Injectable()
export class UsersStore {
  // ─── State ────────────────────────────────────────────────────────────────
  private readonly allUsers = signal<User[]>([]);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  filterQuery = signal('');
  currentPage = signal(1);
  readonly pageSize = 5;

  // ─── Derived state ────────────────────────────────────────────────────────
  isLoading = this.loading.asReadonly();
  hasError = computed(() => this.error() !== null);
  errorMessage = this.error.asReadonly();

  filteredUsers = computed(() => {
    const query = this.filterQuery().toLowerCase();
    const users = this.allUsers();
    if (!query) return users;
    return users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(query) ||
        u.lastName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query) ||
        u.status.toLowerCase().includes(query),
    );
  });

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  totalItems = computed(() => this.filteredUsers().length);

  // ─── Actions ──────────────────────────────────────────────────────────────
  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    // Simulate HTTP fetch — replace with httpResource / HttpClient when a real API is available
    setTimeout(() => {
      this.allUsers.set(MOCK_USERS);
      this.loading.set(false);
    }, 400);
  }

  setFilter(query: string) {
    this.filterQuery.set(query);
    this.currentPage.set(1);
  }

  setPage(page: number) {
    this.currentPage.set(page);
  }
}
