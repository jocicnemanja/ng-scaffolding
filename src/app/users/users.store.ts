import { Injectable, signal, computed, inject, InjectionToken } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Dialog } from '@angular/cdk/dialog';
import { BehaviorSubject, map, switchMap, tap, timer } from 'rxjs';
import { MOCK_USERS, User } from './user.model';
import {
  UserFormDialogComponent,
  UserFormDialogData,
} from './user-form/user-form-dialog.component';
import { UserFormPayload } from './user-form/user.form';
import { ConfirmModal } from '../shared/confirm-modal/confirm-modal.component';

type UserPayload = Omit<User, 'id'>;

export class UsersStore {
  private readonly dialog = inject(Dialog);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  filterQuery = signal('');
  currentPage = signal(1);
  readonly pageSize = 5;

  private readonly reload$ = new BehaviorSubject<void>(undefined);

  users$ = this.reload$.pipe(
    tap(() => {
      this.loading.set(true);
      this.error.set(null);
    }),
    switchMap(() => timer(400).pipe(map(() => MOCK_USERS))),
  );

  private readonly users = toSignal(this.users$, { initialValue: [] });



  // ─── Derived state ────────────────────────────────────────────────────────
  isLoading = this.loading.asReadonly();
  hasError = computed(() => this.error() !== null);
  errorMessage = this.error.asReadonly();

  filteredUsers = computed(() => {
    const query = this.filterQuery().toLowerCase();
    const users = this.users();
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

  setFilter(query: string) {
    this.filterQuery.set(query);
    this.currentPage.set(1);
  }

  setPage(page: number) {
    this.currentPage.set(page);
  }

  save(user: User | null): void {
    const ref = this.dialog.open<UserFormPayload, UserFormDialogData>(UserFormDialogComponent, {
      data: { user },
      disableClose: true,
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
      panelClass: 'dialog-pane',
      width: '520px',
    });

    ref.closed.subscribe((payload) => {
      if (!payload) {
        return;
      }
      switch (user) {
        case null:
          this.createUser(payload);
          break;
        default:
          this.updateUser(user.id, payload);
      }
    });
  }

  delete(user: User): void {
    const dialogRef = this.dialog.open(ConfirmModal, {
      data: {
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this user?',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.deleteUser(user.id);
    });
  }

  reload(): void {
    this.reload$.next();
  }

  private createUser(payload: UserPayload) {
    this.reload();
  }

  private readUser(id: number): User | undefined {
    return this.users().find((u) => u.id === id);
  }

  private updateUser(id: number, payload: UserPayload) {
    this.reload();
  }

  private deleteUser(id: number) {
    this.reload();
  }
}

export const USERS_STORE = new InjectionToken<UsersStore>('USERS_STORE');

export const USERS_STORE_FACTORY = {
  provide: UsersStore,
  useFactory: () => new UsersStore(),
};
