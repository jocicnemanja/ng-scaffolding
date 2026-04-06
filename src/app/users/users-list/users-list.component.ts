import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { Table } from '../../shared/table/table.component';
import { Pagination } from '../../shared/pagination/pagination.component';
import { Filter } from '../../shared/filter/filter.component';
import { UsersProvider } from '../users.provider';
import { BASE_GRID_PROVIDER } from '../../shared/grid-providers/base-signal-store-grid.provider';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'kim-users-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table, Pagination, Filter, JsonPipe],
  providers: [
    UsersProvider,
    { provide: BASE_GRID_PROVIDER, useExisting: UsersProvider },
  ],
  host: { class: 'users-list' },
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersList {
  protected readonly provider = inject(UsersProvider);
  constructor() {
    effect(() => {
      this.provider.refresh();
    });
  }
}
