import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Table } from '../../shared/components/table/table.component';
import { USERS_STORE, USERS_STORE_FACTORY } from '../users.store';

@Component({
  selector: 'kim-users-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table],
  providers: [USERS_STORE_FACTORY],
  host: { class: 'users-list' },
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersList {
  readonly store = inject(USERS_STORE);

  constructor() {
    this.store.refresh();
  }
}
