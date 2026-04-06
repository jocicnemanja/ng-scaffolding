import { InjectionToken } from "@angular/core";
import { signalStore, withState } from "@ngrx/signals";
import { withMethods } from "@ngrx/signals";
import { of } from "rxjs";
import { BaseGridProvider, LoadParams, PageResult, withBaseTable } from "../shared/grid-providers/base-signal-grid.provider";
import { MOCK_USERS, User } from "./user.model";

export const UsersStore = signalStore(
  withMethods(() => ({
    fetchPage(params: LoadParams) {
      const start = (params.page - 1) * params.pageSize;
      const data = MOCK_USERS.slice(start, start + params.pageSize);
      console.log('Fetching page with params:', params, 'Returning data:', data);
      return of({ data, total: MOCK_USERS.length } as PageResult<User>);
    },
  })),
withBaseTable<User>(),
  withState({providerName: 'UsersProvider'}),

);