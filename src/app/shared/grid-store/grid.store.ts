import { computed, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { GridDataSource, GridError, GridState, PaginationState, QueryState } from './gird.models';
import { buildError } from '../utils/http-request.utils';

export class GridStore<T extends { id: string }, TRaw = T> {
  private readonly destroyRef = inject(DestroyRef);

  // ─── Action subjects (declarative triggers) ──────────────────────────────
  private readonly refresh$ = new Subject<void>();
  private readonly createAction$ = new Subject<Partial<T>>();
  private readonly updateAction$ = new Subject<T>();
  private readonly deleteAction$ = new Subject<string | number>();
  

  constructor(private readonly dataSource: GridDataSource<T, QueryState>) {
    this.registerRead();

    this.createAction$
      .pipe(
        switchMap((payload) => {
          const source = this.dataSource.create?.(payload);
          if (!source) {
            return EMPTY;
          }

          this.incrementLoading();
          return source.pipe(
            tap(() => this.reload()),
            catchError((err) => {
              this.setError(buildError(err));
              return EMPTY;
            }),
            finalize(() => this.decrementLoading()),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.updateAction$
      .pipe(
        switchMap((payload) => {
          const source = this.dataSource.update?.(payload);
          if (!source) {
            return EMPTY;
          }

          this.incrementLoading();
          return source.pipe(
            tap(() => this.reload()),
            catchError((err) => {
              this.setError(buildError(err));
              return EMPTY;
            }),
            finalize(() => this.decrementLoading()),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.deleteAction$
      .pipe(
        switchMap((payload) => {
          const source = this.dataSource.delete?.(payload);
          if (!source) {
            return EMPTY;
          }

          this.incrementLoading();
          return source.pipe(
            tap(() => this.reload()),
            catchError((err) => {
              this.setError(buildError(err));
              return EMPTY;
            }),
            finalize(() => this.decrementLoading()),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  // ─── State ────────────────────────────────────────────────────────────────
  protected readonly state: WritableSignal<GridState<T>> = signal({
    entities: [],
    query: {
      page: 1,
      size: 25,
      sort: [],
      filters: {},
    },
    pagination: {
      page: 1,
      size: 25,
      totalItems: 0,
      totalPages: 0,
    },
    loadingCounter: 0,
    errors: [],
    selectedIds: new Set<string>(),
    activeId: null,
  });

  readonly entities = computed(() => this.state().entities);
  readonly query = computed(() => this.state().query);
  readonly pagination = computed(() => this.state().pagination);
  readonly loadingCounter = computed(() => this.state().loadingCounter);
  readonly errors = computed(() => this.state().errors);
  readonly selectedIds = computed(() => this.state().selectedIds);
  readonly activeId = computed(() => this.state().activeId);

  readonly isLoading = computed(() => this.loadingCounter() > 0);
  readonly hasNext = computed(() => this.pagination().page < this.pagination().totalPages);
  readonly hasPrev = computed(() => this.pagination().page > 1);
  readonly selectedEntities = computed(() =>
    this.entities().filter((entity) => this.selectedIds().has(entity.id)),
  );
  readonly isAllSelected = computed(() => {
    const _all = this.entities();
    return _all.length > 0 && _all.every((entity) => this.selectedIds().has(entity.id));
  });
  readonly isIndeterminate = computed(() => {
    const _all = this.entities();
    const selectedCount = _all.filter((entity) => this.selectedIds().has(entity.id)).length;
    return selectedCount > 0 && selectedCount < _all.length;
  });
  readonly activeEntity = computed(() => {
    const _id = this.activeId();
    if (!_id) {
      return null;
    }

    return this.entities().find((entity) => entity.id === _id) ?? null;
  });

  // ─── Public API ───────────────────────────────────────────────────────────
  reload(): void {
    this.refresh$.next();
  }

  create(entity: Partial<T>): void {
    this.createAction$.next(entity);
  }

  update(entity: T): void {
    this.updateAction$.next(entity);
  }

  delete(id: string | number): void {
    this.deleteAction$.next(id);
  }

  // ─── State helpers ────────────────────────────────────────────────────────
  protected patchState(patch: Partial<GridState<T>>): void {
    this.state.update((current) => ({
      ...current,
      ...patch,
    }));
  }

  protected setEntities(entities: T[], total?: number): void {
    this.patchState({
      entities,
      pagination: {
        ...this.pagination(),
        totalItems: total ?? entities.length,
        totalPages: Math.ceil((total ?? entities.length) / this.pagination().size),
      },
    });
  }

  protected setError(error: GridError): void {
    this.patchState({
      errors: [...this.errors(), error],
    });
  }

  

  // ─── Declarative pipelines ────────────────────────────────────────────────
  private registerRead(): void {
    this.refresh$
      .pipe(
        switchMap(() => {
          this.incrementLoading();
          return this.dataSource.read(this.query(), this.pagination()).pipe(
            catchError((err) => {
              this.setError(buildError(err));
              return EMPTY;
            }),
            finalize(() => this.decrementLoading()),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.setEntities(response.content, response.totalElements);
      });
  }

  private incrementLoading(): void {
    this.patchState({ loadingCounter: this.loadingCounter() + 1 });
  }

  private decrementLoading(): void {
    this.patchState({ loadingCounter: this.loadingCounter() - 1 });
  }
}
