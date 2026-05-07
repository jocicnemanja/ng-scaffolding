import { signalStore } from '@ngrx/signals';
import { withBaseStore } from 'ui-sdk';
import { User } from './user.model';
import { UsersDataSource } from './users.datasource';

export const UsersSignalStore = signalStore(
  withBaseStore<User>(UsersDataSource),
);
