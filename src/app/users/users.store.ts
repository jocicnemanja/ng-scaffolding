import { inject, InjectionToken } from '@angular/core';
import { GridStore } from '../shared/grid-store/grid.store';
import { User } from './user.model';
import { UsersDataSource } from './users.datasource';

class UsersStore extends GridStore<User, any> {
  constructor() {
    super(inject(UsersDataSource));
  }
}

export const USERS_STORE = new InjectionToken<GridStore<User, any>>('USERS_STORE');
export const USERS_STORE_FACTORY = {
  provide: USERS_STORE,
  useClass: UsersStore,
};
