import { computed, effect, Signal } from '@angular/core';
import {
  signalStoreFeature,
  withState,
  withComputed,
  withMethods,
  withHooks,
  patchState,
  getState,
  signalStore,
} from '@ngrx/signals';
import {
  withEntities,
  setAllEntities,
  addEntity,
  updateEntity,
  removeEntity,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize,
} from 'rxjs/operators';
import { GridError, QueryState, PaginationState } from './gird.models';
import { PageResponse } from '../models/page-response.models';
import { buildError } from '../utils/http-request.utils';

// ── withBaseStore ─────────────────────────────────────────────────────────────

/**
 * withBaseStore<T>
 *
 * Composable SignalStore feature aligned with GridStore.
 * Wire it into any signalStore() call alongside a withMethods block
 * that provides fetchPage():
 *
 *   export const UsersStore = signalStore(
 *     withMethods(() => ({
 *       fetchPage: (query: QueryState, pagination: PaginationState) =>
 *         inject(UsersApi).getPage(query, pagination),
 *     })),
 *     withBaseStore<User>(),
 *   );
 *
 * Exposed signals (mirrors GridStore):
 *   store.entities()        — T[]
 *   store.isLoading()       — boolean
 *   store.query()           — QueryState
 *   store.pagination()      — PaginationState
 *   store.totalPages()      — number
 *   store.hasNext()         — boolean
 *   store.hasPrev()         — boolean
 *   store.errors()          — GridError[]
 *   store.selectedIds()     — ReadonlySet<string>
 *   store.activeId()        — string | null
 *   store.selectedEntities()— T[]
 *   store.isAllSelected()   — boolean
 *   store.isIndeterminate() — boolean
 *   store.activeEntity()    — T | null
 */
export function withBaseStore<T extends { id: string }>() {
  return signalStoreFeature(

    // ── 1. Normalized entity collection ──────────────────────────────────
    withEntities<T>(),

    // ── 2. Non-entity state slices ────────────────────────────────────────
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
    loadingCounter: 0,
    errors: [] as GridError[],
    selectedIds: new Set<string>(),
    activeId: null as string | null,
    }),

    // ── 3a. Computed (base) ──────────────────────────────────────────────
    withComputed((store) => ({
      isLoading: computed(() => store.loadingCounter() > 0),

      totalPages: computed(() => {
        const ps = store.pagination().size;
        return ps === 0 ? 1 : Math.ceil(store.pagination().totalItems / ps);
      }),
    })),

    // ── 3b. Computed (derived — needs totalPages on store) ────────────
    withComputed((store) => {
      return {
        hasNext: computed(() => store.pagination().page < store.totalPages()),
        hasPrev: computed(() => store.pagination().page > 1),

        // ── Selection derived ───────────────────────────────────────────

        selectedEntities: computed((): T[] =>
          (store.entities() as T[]).filter((e) => store.selectedIds().has(e.id)),
        ),

        isAllSelected: computed(() => {
          const all = store.entities() as T[];
          return all.length > 0 && all.every((e) => store.selectedIds().has(e.id));
        }),

        isIndeterminate: computed(() => {
          const all   = store.entities() as T[];
          const count = all.filter((e) => store.selectedIds().has(e.id)).length;
          return count > 0 && count < all.length;
        }),

        activeEntity: computed((): T | null => {
          const id = store.activeId();
          return id ? ((store.entities() as T[]).find((e) => e.id === id) ?? null) : null;
        }),
      };
    }),

    // ── 4. Methods ────────────────────────────────────────────────────────
    withMethods((store) => {

      type LoadSnapshot = { query: QueryState; pagination: PaginationState };

      // Internal push bus — carries query+pagination snapshots to the pipeline
      const load$ = new Subject<LoadSnapshot>();

      const _push = () => load$.next({ query: store.query(), pagination: store.pagination() });

      // rxMethod: debounce → dedup → switchMap → fetchPage (provided by subclass)
      const _load = rxMethod<LoadSnapshot>(
        pipe(
          debounceTime(0),
          distinctUntilChanged(
            (a, b) => JSON.stringify(a) === JSON.stringify(b),
          ),
          switchMap(({ query, pagination }) => {
            patchState(store, { loadingCounter: store.loadingCounter() + 1 });

            return (store as any).fetchPage(query, pagination).pipe(
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
                  patchState(store, {
                    errors: [...store.errors(), buildError(err)],
                  });
                },
              }),
              finalize(() =>
                patchState(store, {
                  loadingCounter: Math.max(0, store.loadingCounter() - 1),
                }),
              ),
            );
          }),
        ),
      );

      return {

        // Expose so withHooks can seed the pipeline on init
        _connectPipeline() {
          _load(load$);
        },

        // ── Load commands ───────────────────────────────────────────────

        reload() { _push(); },

        setSort(sort: QueryState['sort'][number]) {
          patchState(store, { query: { ...store.query(), sort: [sort] }, pagination: { ...store.pagination(), page: 1 } });
          _push();
        },

        goToPage(page: number) {
          patchState(store, { pagination: { ...store.pagination(), page } });
          _push();
        },

        setPageSize(pageSize: number) {
          patchState(store, { pagination: { ...store.pagination(), size: pageSize, page: 1 } });
          _push();
        },

        setFilter(patch: Record<string, string>) {
          patchState(store, { query: { ...store.query(), filters: { ...store.query().filters, ...patch } }, pagination: { ...store.pagination(), page: 1 } });
          _push();
        },

        resetFilter() {
          patchState(store, { query: { ...store.query(), filters: {} }, pagination: { ...store.pagination(), page: 1 } });
          _push();
        },

        clearErrors() {
          patchState(store, { errors: [] });
        },

        dismissError(id: string) {
          patchState(store, { errors: store.errors().filter((e) => e.id !== id) });
        },

        // ── Selection commands ──────────────────────────────────────────

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

        selectAll() {
          const ids = new Set(
            (store.entities() as T[]).map((e) => e.id),
          );
          patchState(store, { selectedIds: ids });
        },

        clearSelection() {
          patchState(store, { selectedIds: new Set<string>() });
        },

        setActive(id: string | null) {
          patchState(store, { activeId: id });
        },

        // ── Optimistic entity primitives (for concrete stores) ──────────

        addEntity(entity: T) {
          patchState(store, addEntity(entity));
          patchState(store, { pagination: { ...store.pagination(), totalItems: store.pagination().totalItems + 1 } });
        },

        _patchEntity(id: string, patch: Partial<T>) {
          patchState(store, updateEntity({ id, changes: patch }));
        },

        _removeEntity(id: string) {
          patchState(store, removeEntity(id));
          patchState(store, { pagination: { ...store.pagination(), totalItems: Math.max(0, store.pagination().totalItems - 1) } });
        },

        _setAllEntities(entities: T[], total?: number) {
          patchState(store, setAllEntities(entities));
          if (total !== undefined) patchState(store, { pagination: { ...store.pagination(), totalItems: total } });
        },
      };
    }),

    // ── 5. Lifecycle ──────────────────────────────────────────────────────
    withHooks({
      onInit(store) {
        // Connect the Subject → rxMethod pipeline, then seed the first load
        (store as any)._connectPipeline();
        (store as any).reload();
             effect(() => {
        // 👇 The effect is re-executed on state change.
        const state = getState(store);
        console.log('counter state', state);
      });
      },
    }),
  );
}

// ── Provider interface for the table component ───────────────────────────────

export interface IBaseStore<T extends { id: string } = { id: string }> {
  // State signals
  entities: Signal<T[]>;
  isLoading: Signal<boolean>;
  query: Signal<QueryState>;
  pagination: Signal<PaginationState>;
  totalPages: Signal<number>;
  hasNext: Signal<boolean>;
  hasPrev: Signal<boolean>;
  errors: Signal<GridError[]>;
  selectedIds: Signal<ReadonlySet<string>>;
  activeId: Signal<string | null>;
  selectedEntities: Signal<T[]>;
  isAllSelected: Signal<boolean>;
  isIndeterminate: Signal<boolean>;
  activeEntity: Signal<T | null>;

  // Methods
  reload: () => void;
  setSort: (sort: QueryState['sort'][number]) => void;
  goToPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilter: (patch: Record<string, string>) => void;
  resetFilter: () => void;
  clearErrors: () => void;
  dismissError: (id: string) => void;
  selectOne: (id: string) => void;
  deselectOne: (id: string) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setActive: (id: string | null) => void;
}

export const BaseStore = signalStore(
  withBaseStore(),
);

// export const BASE_GRID_PROVIDER = new InjectionToken<BaseGridProvider>('BASE_GRID_PROVIDER');
// export const BASE_GRID_PROVIDER_FACTORY = () => ({ provide: BASE_GRID_PROVIDER, useValue: BaseGridProvder });
