import { InjectionToken } from "@angular/core";
import { signalStore, withState } from "@ngrx/signals";
import { withMethods } from "@ngrx/signals";
import { of } from "rxjs";
import { IBaseStore, LoadParams, PageResult, withBaseStore } from "../shared/grid-providers/base-signal.store";
import { MOCK_USERS, User } from "./user.model";

export const UsersStore = signalStore(
  withMethods(() => ({
    fetchPage(params: LoadParams) {
      const start = (params.page - 1) * params.pageSize;
      const data = MOCK_USERS.slice(0, 25);
      console.log('Fetching page with params:', params, 'Returning data:', data);
      return of({ data, total: MOCK_USERS.length } as PageResult<User>);
    },
  })),
withBaseStore<User>(),
  withState({providerName: 'UsersProvider'}),

);