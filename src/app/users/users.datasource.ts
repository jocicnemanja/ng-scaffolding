import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GridDataSource, PaginationState, QueryState } from '../shared/grid-store/gird.models';
import { PageResponse } from '../shared/models/page-response.models';
import { MOCK_USERS, User } from './user.model';

@Injectable({ providedIn: 'root' })
export class UsersDataSource implements GridDataSource<User, QueryState, PaginationState> {
  read(query: QueryState, pagination: PaginationState): Observable<PageResponse<User>> {
    const start = (pagination.page - 1) * pagination.size;
    const content = MOCK_USERS.slice(start, start + pagination.size);
    const totalElements = MOCK_USERS.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / pagination.size));

    return of({
      content,
      totalElements,
      totalPages,
      size: pagination.size,
      number: pagination.page,
      pageable: {
        sort: { sorted: false, unsorted: true, empty: true },
        offset: start,
        pageNumber: pagination.page,
        pageSize: pagination.size,
        paged: true,
        unpaged: false,
      },
      last: pagination.page >= totalPages,
      first: pagination.page === 1,
      numberOfElements: content.length,
      empty: content.length === 0,
    });
  }
}
