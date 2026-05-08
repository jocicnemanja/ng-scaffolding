import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SdkTable } from 'ui-sdk';
import { USERS_STORE, USERS_STORE_FACTORY } from '../users.store';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'kim-users-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SdkTable, UserFormComponent],
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
