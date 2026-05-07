import { signalStore } from '@ngrx/signals';
import { withBaseStore } from '../shared/grid-store/base-signal.store';
import { User } from './user.model';
import { UsersDataSource } from './users.datasource';

export const UsersSignalStore = signalStore(
  withBaseStore<User>(UsersDataSource),
);
