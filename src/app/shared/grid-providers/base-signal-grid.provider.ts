import { computed, InjectionToken, Signal } from '@angular/core';
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
  addEntity,
  updateEntity,
  removeEntity,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, Subject, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize,
} from 'rxjs/operators';

// ── Public types ──────────────────────────────────────────────────────────────

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TableError {
  id: string;
  message: string;
  timestamp: number;
  context?: unknown;
}

export interface LoadParams {
  sort:     SortState | null;
  page:     number;
  pageSize: number;
  filter:   Record<string, unknown>;
}

export interface PageResult<T> {
  data:  T[];
  total: number;
}

// ── withBaseTable ─────────────────────────────────────────────────────────────

/**
 * withBaseTable<T>
 *
 * Composable SignalStore feature. Wire it into any signalStore() call
 * alongside a withMethods block that provides fetchPage():
 *
 *   export const UsersStore = signalStore(
 *     withBaseTable<User>(),
 *     withMethods((store) => ({
 *       fetchPage: (p: LoadParams) => inject(UsersApi).getPage(p),
 *     })),
 *   );
 *
 * Everything the template needs comes off the store directly:
 *   store.entities()        — T[] from normalized entity collection
 *   store.isLoading()       — boolean (counter-safe)
 *   store.sort()            — SortState | null
 *   store.page()            — number
 *   store.pageSize()        — number
 *   store.total()           — number
 *   store.totalPages()      — number
 *   store.hasNext()         — boolean
 *   store.hasPrev()         — boolean
 *   store.errors()          — TableError[]
 *   store.selectedIds()     — ReadonlySet<string>
 *   store.activeId()        — string | null
 *   store.selectedEntities()— T[]
 *   store.isAllSelected()   — boolean
 *   store.isIndeterminate() — boolean (for checkbox tri-state)
 *   store.activeEntity()    — T | null
 */
export function withBaseTable<T extends { id: string }>() {
  return signalStoreFeature(

    // ── 1. Normalized entity collection ──────────────────────────────────
    withEntities<T>(),

    // ── 2. Non-entity state slices ────────────────────────────────────────
    withState({
      sort:           null as SortState | null,
      page:           1,
      pageSize:       25,
      total:          0,
      filter:         {} as Record<string, unknown>,
      loadingCounter: 0,
      errors:         [] as TableError[],
      // Selection
      selectedIds:    new Set<string>() as ReadonlySet<string>,
      activeId:       null as string | null,
    }),

    // ── 3a. Computed (base) ──────────────────────────────────────────────
    withComputed((store) => ({
      isLoading: computed(() => store.loadingCounter() > 0),

      totalPages: computed(() => {
        const ps = store.pageSize();
        return ps === 0 ? 1 : Math.ceil(store.total() / ps);
      }),

      params: computed<LoadParams>(() => ({
        sort:     store.sort(),
        page:     store.page(),
        pageSize: store.pageSize(),
        filter:   store.filter(),
      })),
    })),

    // ── 3b. Computed (derived — needs totalPages on store) ────────────
    withComputed((store) => {
      return {
        hasNext: computed(() => store.page() < store.totalPages()),
        hasPrev: computed(() => store.page() > 1),

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

      // Internal push bus — carries LoadParams snapshots to the pipeline
      const load$ = new Subject<LoadParams>();

      const _push = () => load$.next(store.params());

      // rxMethod: debounce → dedup → switchMap → fetchPage (provided by subclass)
      const _load = rxMethod<LoadParams>(
        pipe(
          debounceTime(0),
          distinctUntilChanged(
            (a, b) => JSON.stringify(a) === JSON.stringify(b),
          ),
          switchMap((params) => {
            patchState(store, { loadingCounter: store.loadingCounter() + 1 });

            return (store as any).fetchPage(params).pipe(
              tapResponse({
                next: (result: PageResult<T>) => {
                  patchState(
                    store,
                    setAllEntities(result.data as T[]),
                    { total: result.total },
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

        refresh() { _push(); },

        setSort(sort: SortState) {
          patchState(store, { sort, page: 1 });
          _push();
        },

        goToPage(page: number) {
          patchState(store, { page });
          _push();
        },

        setPageSize(pageSize: number) {
          patchState(store, { pageSize, page: 1 });
          _push();
        },

        setFilter(patch: Record<string, unknown>) {
          patchState(store, { filter: { ...store.filter(), ...patch }, page: 1 });
          _push();
        },

        resetFilter() {
          patchState(store, { filter: {}, page: 1 });
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
          patchState(store, { total: store.total() + 1 });
        },

        _patchEntity(id: string, patch: Partial<T>) {
          patchState(store, updateEntity({ id, changes: patch }));
        },

        _removeEntity(id: string) {
          patchState(store, removeEntity(id));
          patchState(store, { total: Math.max(0, store.total() - 1) });
        },

        _setAllEntities(entities: T[], total?: number) {
          patchState(store, setAllEntities(entities));
          if (total !== undefined) patchState(store, { total });
        },
      };
    }),

    // ── 5. Lifecycle ──────────────────────────────────────────────────────
    withHooks({
      onInit(store) {
        // Connect the Subject → rxMethod pipeline, then seed the first load
        (store as any)._connectPipeline();
        (store as any).refresh();
      },
    }),
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildError(err: unknown): TableError {
  return {
    id: crypto.randomUUID(),
    message:
      err instanceof Error     ? err.message
      : typeof err === 'string'  ? err
      : 'An unexpected error occurred.',
    timestamp: Date.now(),
    context: err,
  };
}

// ── Provider interface for the table component ───────────────────────────────

export interface BaseGridProvider {
  // State signals
  entities: Signal<{ id: string }[]>;
  isLoading: Signal<boolean>;
  sort: Signal<SortState | null>;
  page: Signal<number>;
  pageSize: Signal<number>;
  total: Signal<number>;
  totalPages: Signal<number>;
  hasNext: Signal<boolean>;
  hasPrev: Signal<boolean>;
  errors: Signal<TableError[]>;
  selectedIds: Signal<ReadonlySet<string>>;
  activeId: Signal<string | null>;
  selectedEntities: Signal<{ id: string }[]>;
  isAllSelected: Signal<boolean>;
  isIndeterminate: Signal<boolean>;
  activeEntity: Signal<{ id: string } | null>;
  params: Signal<LoadParams>;

  // Methods
  refresh: () => void;
  setSort: (sort: SortState) => void;
  goToPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilter: (patch: Record<string, unknown>) => void;
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

const BaseGridProvder = signalStoreFeature(
  withBaseTable(),
);

export const BASE_GRID_PROVIDER = new InjectionToken<BaseGridProvider>('BASE_GRID_PROVIDER');
export const BASE_GRID_PROVIDER_FACTORY = () => ({ provide: BASE_GRID_PROVIDER, useValue: BaseGridProvder });
