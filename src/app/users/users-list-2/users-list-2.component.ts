import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { UsersSignalStore } from '../users.signal-store';

@Component({
  selector: 'kim-users-list-2',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsersSignalStore],
  host: { class: 'users-list-2' },
  templateUrl: './users-list-2.component.html',
  styleUrl: './users-list-2.component.scss',
})
export class UsersList2 {
  readonly store = inject(UsersSignalStore);
}
