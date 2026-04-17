import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Table } from '../../shared/components/table/table.component';
import { BaseStore } from '../../shared/grid-store/base-signal.store';
import { UsersStore } from '../users.store';

@Component({
  selector: 'kim-users-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table],
  providers: [UsersStore, { provide: BaseStore, useExisting: UsersStore }],
  host: { class: 'users-list' },
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersList {
  protected readonly provider = inject(UsersStore);
}
