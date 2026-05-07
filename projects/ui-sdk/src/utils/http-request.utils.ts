import { HttpParams } from '@angular/common/http';
import { QueryState, PaginationState } from '../grid-store/gird.models';

export function buildError(err: unknown) {
  return {
    id: crypto.randomUUID(),
    message:
      err instanceof Error
        ? err.message
        : typeof err === 'string'
          ? err
          : 'An unexpected error occurred.',
    timestamp: Date.now(),
    code: err instanceof Error ? (err as any).code || 'UNKNOWN_ERROR' : 'UNKNOWN_ERROR',
  };
}

export function buildHttpParams(query: QueryState, pagination: PaginationState): HttpParams {
  let _params = new HttpParams()
    .set('page', pagination.page.toString())
    .set('size', pagination.size.toString());
  query.sort.forEach((sort) => {
    _params = _params.append('sort', `${sort.field},${sort.direction}`);
  });
  Object.entries(query.filters).forEach(([key, value]) => {
    _params = _params.set(key, value);
  });
  return _params;
}
