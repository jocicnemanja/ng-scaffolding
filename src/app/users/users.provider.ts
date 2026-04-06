import { InjectionToken } from "@angular/core";
import { signalStore, withState } from "@ngrx/signals";
import { withMethods } from "@ngrx/signals";
import { of } from "rxjs";
import { BaseGridProvider, LoadParams, PageResult, withBaseTable } from "../shared/grid-providers/base-signal-store-grid.provider";
import { MOCK_USERS, User } from "./user.model";

export const UsersProvider = signalStore(
  withBaseTable<User>(),
  withState({providerName: 'UsersProvider'}),
  withMethods(() => ({
    fetchPage(params: LoadParams) {
      const start = (params.page - 1) * params.pageSize;
      const data2 = MOCK_USERS.slice(start, start + params.pageSize);
      const data = MOCK_USERS.slice(0,5) || [];
      console.log('Fetching page with params:', params, 'Returning data:', data);
      return of({ data, total: MOCK_USERS.length } as PageResult<User>);
    },
  })),
);

export const USERS_PROVIDER = new InjectionToken<BaseGridProvider<User>>('USERS_PROVIDER');
export const USERS_PROVIDER_FACTORY = () => ({ provide: USERS_PROVIDER, useValue: UsersProvider });