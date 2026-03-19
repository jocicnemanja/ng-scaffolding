import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Table } from '../../shared/table/table.component';
import { Pagination } from '../../shared/pagination/pagination.component';
import { Filter } from '../../shared/filter/filter.component';
import { UsersStore } from '../users.store';

@Component({
  selector: 'app-users-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table, Pagination, Filter],
  providers: [UsersStore],
  host: { 'class': 'users-list' },
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersList implements OnInit {
  protected readonly store = inject(UsersStore);

  ngOnInit() {
    this.store.loadUsers();
  }
}
