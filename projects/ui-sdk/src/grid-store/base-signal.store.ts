import { inject, ProviderToken, computed } from '@angular/core';
import {
  signalStoreFeature,
  withState,
  withComputed,
  withMethods,
  withHooks,
  patchState,
} from '@ngrx/signals';
import {
  withEntities,
  setAllEntities,
  addEntity as addEntityUpdater,
  updateEntity,
  removeEntity as removeEntityUpdater,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe } from 'rxjs';
import { debounceTime, switchMap, finalize } from 'rxjs/operators';
import { GridDataSource, GridError, QueryState, PaginationState } from './gird.models';
import { PageResponse } from '../models/page-response.models';
import { buildError } from '../utils/http-request.utils';

const pagesFor = (totalItems: number, size: number): number =>
  size <= 0 ? 1 : Math.max(1, Math.ceil(totalItems / size));

/**
 * withBaseStore<T>
 *
 * Composable SignalStore feature for paginated, filterable, sortable
 * collections backed by a GridDataSource.
 *
 *   export const UsersStore = signalStore(
 *     { providedIn: 'root' },
 *     withBaseStore<User>(UsersDataSource),
 *   );
 *
 * Page-scoped selection helpers (selectPage, isPageSelected, isPageIndeterminate)
 * operate on the rows currently loaded into the entity collection — not the
 * full server-side result set.
 */
export function withBaseStore<T extends { id: string }>(
  dataSourceToken: ProviderToken<GridDataSource<T, QueryState, PaginationState>>,
) {
  return signalStoreFeature(
    withEntities<T>(),

    withState({
      query: {
        sort: [] as QueryState['sort'],
        filters: {} as QueryState['filters'],
      },
      pagination: {
        page: 1,
        size: 25,
        totalItems: 0,
        totalPages: 0,
      },
      isLoading: false,
      errors: [] as GridError[],
      selectedIds: new Set<string>(),
      activeId: null as string | null,
    }),

    withComputed((store) => {
      // totalPages lives on pagination state; expose a sibling signal so
      // consumers can read it without destructuring.
      const totalPages = computed(() => store.pagination().totalPages);

      return {
        totalPages,

        hasNext: computed(() => store.pagination().page < totalPages()),
        hasPrev: computed(() => store.pagination().page > 1),

        selectedEntities: computed((): T[] =>
          (store.entities() as T[]).filter((e) => store.selectedIds().has(e.id)),
        ),

        isPageSelected: computed(() => {
          const page = store.entities() as T[];
          return page.length > 0 && page.every((e) => store.selectedIds().has(e.id));
        }),

        isPageIndeterminate: computed(() => {
          const page = store.entities() as T[];
          const count = page.filter((e) => store.selectedIds().has(e.id)).length;
          return count > 0 && count < page.length;
        }),

        activeEntity: computed((): T | null => {
          const id = store.activeId();
          return id ? ((store.entities() as T[]).find((e) => e.id === id) ?? null) : null;
        }),
      };
    }),

    withMethods((store) => {
      const dataSource = inject(dataSourceToken);

      const load = rxMethod<{ query: QueryState; pagination: PaginationState }>(
        pipe(
          debounceTime(0),
          switchMap(({ query, pagination }) => {
            patchState(store, { isLoading: true });
            return dataSource.read(query, pagination).pipe(
              tapResponse({
                next: (result: PageResponse<T>) => {
                  patchState(
                    store,
                    setAllEntities(result.content as T[]),
                    {
                      pagination: {
                        ...store.pagination(),
                        totalItems: result.totalElements,
                        totalPages: result.totalPages,
                      },
                    },
                  );
                },
                error: (err: unknown) => {
                  patchState(store, { errors: [...store.errors(), buildError(err)] });
                },
              }),
              finalize(() => patchState(store, { isLoading: false })),
            );
          }),
        ),
      );

      const fetch = () => load({ query: store.query(), pagination: store.pagination() });

      return {
        // ── Load commands ───────────────────────────────────────────────

        reload: fetch,

        setSort(sort: QueryState['sort']) {
          patchState(store, {
            query: { ...store.query(), sort },
            pagination: { ...store.pagination(), page: 1 },
          });
          fetch();
        },

        clearSort() {
          patchState(store, { query: { ...store.query(), sort: [] } });
          fetch();
        },

        goToPage(page: number) {
          patchState(store, { pagination: { ...store.pagination(), page } });
          fetch();
        },

        setPageSize(size: number) {
          patchState(store, { pagination: { ...store.pagination(), size, page: 1 } });
          fetch();
        },

        setFilter(patch: Record<string, string>) {
          patchState(store, {
            query: { ...store.query(), filters: { ...store.query().filters, ...patch } },
            pagination: { ...store.pagination(), page: 1 },
          });
          fetch();
        },

        resetFilter() {
          patchState(store, {
            query: { ...store.query(), filters: {} },
            pagination: { ...store.pagination(), page: 1 },
          });
          fetch();
        },

        clearErrors() {
          patchState(store, { errors: [] });
        },

        dismissError(id: string) {
          patchState(store, { errors: store.errors().filter((e) => e.id !== id) });
        },

        // ── Selection ────────────────────────────────────────────────────

        selectOne(id: string) {
          patchState(store, { selectedIds: new Set([...store.selectedIds(), id]) });
        },

        deselectOne(id: string) {
          const next = new Set(store.selectedIds());
          next.delete(id);
          patchState(store, { selectedIds: next });
        },

        toggleSelect(id: string) {
          const next = new Set(store.selectedIds());
          next.has(id) ? next.delete(id) : next.add(id);
          patchState(store, { selectedIds: next });
        },

        selectPage() {
          const ids = new Set((store.entities() as T[]).map((e) => e.id));
          patchState(store, { selectedIds: ids });
        },

        clearSelection() {
          patchState(store, { selectedIds: new Set<string>() });
        },

        setActive(id: string | null) {
          patchState(store, { activeId: id });
        },

        // ── Local entity mutators ───────────────────────────────────────
        // These do not call the data source. Concrete stores wire them to
        // create/update/delete observables (with their own rollback if needed).

        addEntity(entity: T) {
          const p = store.pagination();
          const totalItems = p.totalItems + 1;
          patchState(
            store,
            addEntityUpdater(entity),
            { pagination: { ...p, totalItems, totalPages: pagesFor(totalItems, p.size) } },
          );
        },

        patchEntity(id: string, changes: Partial<T>) {
          patchState(store, updateEntity({ id, changes }));
        },

        removeEntity(id: string) {
          const p = store.pagination();
          const totalItems = Math.max(0, p.totalItems - 1);
          patchState(
            store,
            removeEntityUpdater(id),
            { pagination: { ...p, totalItems, totalPages: pagesFor(totalItems, p.size) } },
          );
        },

        replaceEntities(entities: T[], totalItems?: number) {
          if (totalItems === undefined) {
            patchState(store, setAllEntities(entities));
            return;
          }
          const p = store.pagination();
          patchState(
            store,
            setAllEntities(entities),
            { pagination: { ...p, totalItems, totalPages: pagesFor(totalItems, p.size) } },
          );
        },
      };
    }),

    withHooks({
      onInit(store) {
        store.reload();
      },
    }),
  );
}
