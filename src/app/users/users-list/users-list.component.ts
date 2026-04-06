import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { Table } from '../../shared/table/table.component';
import { Pagination } from '../../shared/pagination/pagination.component';
import { Filter } from '../../shared/filter/filter.component';
import { UsersStore } from '../users.provider';
import { JsonPipe } from '@angular/common';
import { BASE_GRID_PROVIDER } from '../../shared/grid-providers/base-signal-grid.provider';

@Component({
  selector: 'kim-users-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table, Pagination, Filter, JsonPipe],
  providers: [
    UsersStore,
    { provide: BASE_GRID_PROVIDER, useExisting: UsersStore },
  ],
  host: { class: 'users-list' },
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersList {
  protected readonly provider = inject(UsersStore);
  constructor() {
    effect(() => {
      this.provider.refresh();
    });
  }
}
