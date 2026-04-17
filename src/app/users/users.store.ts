import { signalStore, withState } from "@ngrx/signals";
import { withMethods } from "@ngrx/signals";
import { of } from "rxjs";
import { withBaseStore } from "../shared/grid-store/base-signal.store";
import { QueryState, PaginationState } from "../shared/grid-store/gird.models";
import { PageResponse } from "../shared/models/page-response.models";
import { MOCK_USERS, User } from "./user.model";

export const UsersStore = signalStore(
  withMethods(() => ({
    fetchPage(query: QueryState, pagination: PaginationState) {
      const data = MOCK_USERS.slice(0, 25);
      console.log('Fetching page with params:', { query, pagination }, 'Returning data:', data);
      return of({ content: data, totalElements: MOCK_USERS.length, totalPages: Math.ceil(MOCK_USERS.length / pagination.size) } as PageResponse<User>);
    },
  })),
  withBaseStore<User>(),
  withState({ providerName: 'UsersProvider' }),
);