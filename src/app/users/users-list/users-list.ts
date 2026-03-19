import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Table } from '../../shared/table/table';
import { Pagination } from '../../shared/pagination/pagination';
import { Filter } from '../../shared/filter/filter';
import { UsersStore } from '../users.store';

@Component({
  selector: 'app-users-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table, Pagination, Filter],
  providers: [UsersStore],
  host: {
    'class': 'users-list',
  },
  template: `
    <header class="page-header">
      <h1>Users</h1>
      <app-filter placeholder="Filter users..." (filterChange)="store.setFilter($event)" />
    </header>

    @if (store.isLoading()) {
      <div class="loading-state">Loading users…</div>
    } @else if (store.hasError()) {
      <div class="error-state">
        {{ store.errorMessage() }}
        <button (click)="store.loadUsers()">Retry</button>
      </div>
    } @else {
      <app-table>
        <ng-container table-header>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
        </ng-container>

        <ng-container table-body>
          @for (user of store.paginatedUsers(); track user.id) {
            <tr>
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" [class]="'badge--' + user.role">{{ user.role }}</span>
              </td>
              <td>
                <span class="status" [class]="'status--' + user.status">{{ user.status }}</span>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" class="empty-state">No users found.</td>
            </tr>
          }
        </ng-container>
      </app-table>

      @if (store.totalItems() > 0) {
        <app-pagination
          [currentPage]="store.currentPage()"
          [totalItems]="store.totalItems()"
          [pageSize]="store.pageSize"
          (pageChange)="store.setPage($event)"
        />
      }
    }
  `,
  styles: `
    :host {
      display: block;
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 16px;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 16px;

      h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #0f172a;
      }

      app-filter {
        width: 280px;
      }
    }

    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: capitalize;

      &--admin {
        background: #ede9fe;
        color: #6d28d9;
      }
      &--editor {
        background: #dbeafe;
        color: #1d4ed8;
      }
      &--viewer {
        background: #f1f5f9;
        color: #475569;
      }
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
      text-transform: capitalize;

      &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &--active::before {
        background: #22c55e;
      }
      &--inactive::before {
        background: #94a3b8;
      }
    }

    .empty-state {
      text-align: center;
      padding: 32px 16px !important;
      color: #94a3b8;
      font-style: italic;
    }

    .loading-state {
      text-align: center;
      padding: 48px 16px;
      color: #64748b;
      font-size: 0.875rem;
    }

    .error-state {
      text-align: center;
      padding: 48px 16px;
      color: #dc2626;
      font-size: 0.875rem;

      button {
        margin-top: 12px;
        padding: 6px 16px;
        border: 1px solid #dc2626;
        border-radius: 6px;
        background: transparent;
        color: #dc2626;
        cursor: pointer;

        &:hover {
          background: #fef2f2;
        }
      }
    }
  `,
})
export class UsersList implements OnInit {
  protected readonly store = inject(UsersStore);

  ngOnInit() {
    this.store.loadUsers();
  }
}
