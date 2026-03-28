import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Table } from '../../shared/table/table.component';
import { Pagination } from '../../shared/pagination/pagination.component';
import { Filter } from '../../shared/filter/filter.component';
import { USERS_STORE, USERS_STORE_FACTORY, UsersStore } from '../users.store';

@Component({
  selector: 'kim-users-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table, Pagination, Filter],
  providers: [USERS_STORE_FACTORY],
  host: { 'class': 'users-list' },
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersList {
  protected readonly store = inject(USERS_STORE);
}
