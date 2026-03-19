---
name: angular-state-per-component
description: 'How to create a per-component store and use it in Angular components in this project. Use when: creating a new store, adding state to a component, wiring up httpResource or BehaviorSubject-based data, using InjectionToken factory providers, or injecting a store into child components.'
---

# Angular Per-Component State (Store Pattern)

This project uses a **plain `@Injectable()` class** as a store — no NgRx `ComponentStore`. Each feature area gets its own store class, provided at the component level so Angular creates a fresh instance per component tree. Use an `InjectionToken` only when you need to swap implementations (e.g. testing, multi-tenant); otherwise provide the class directly.

## When to Use

- A component (or subtree) owns its own data and lifecycle
- Multiple child components need to share data from a single source
- You need reactive data (HTTP, signals, RxJS streams)

---

## Store Structure

### 1. Create the store class

```ts
// my-feature.store.ts
import { inject, Injectable, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap } from 'rxjs';
import { MyService } from '@core/services';

@Injectable()
export class MyFeatureStore {
  // ─── DI (use inject(), never constructor params) ───────────────────────────
  private myService = inject(MyService);

  // ─── Input signals (drive reactive requests) ───────────────────────────────
  itemId = signal<number>(0);

  // ─── Modern: httpResource (auto-fetches when signals change) ──────────────
  data = httpResource<ItemModel>(() => {
    const id = this.itemId();
    return id ? { url: this.myService.getUrl() + `${id}` } : undefined;
  });

  // ─── RxJS style (BehaviorSubject + pipe + toSignal) ───────────────────────
  reload$ = new BehaviorSubject<number>(0);

  items$ = this.reload$.pipe(
    switchMap(() => this.myService.list()),
    // shareReplay(1) if multiple subscribers
  );
  items = toSignal(this.items$, { initialValue: [] });

  // ─── Derived / computed state ──────────────────────────────────────────────
  activeItems = computed(() => (this.items() || []).filter(i => i.active));

  // ─── UI state ─────────────────────────────────────────────────────────────
  // Note: httpResource already exposes data.isLoading() — no need for a separate isLoading signal.
  selectedId = signal<number | null>(null);

  // ─── Actions ──────────────────────────────────────────────────────────────
  reload() {
    this.reload$.next(this.reload$.value + 1);
  }

  select(id: number) {
    this.selectedId.set(id);
  }
}
```

### 2. Provide the store in the root component (simple approach)

The simplest way — provide the class directly. Angular creates one instance per component tree.

```ts
// my-feature-root.component.ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MyFeatureStore } from './my-feature.store';

@Component({
  selector: 'app-my-feature',
  templateUrl: './my-feature-root.component.html',
  standalone: true,
  providers: [MyFeatureStore],  // ← one instance per component tree
})
export class MyFeatureRootComponent {
  private store = inject(MyFeatureStore);
  private route = inject(ActivatedRoute);

  // Reactive route params → store input
  private id = toSignal(this.route.params.pipe(map(p => +p['id'])));

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.store.itemId.set(id);
    });
  }
}
```

### 2b. (Optional) Expose via InjectionToken — when you need swappable implementations

Use an `InjectionToken` only when you need to swap the store for testing or multi-tenant scenarios.

```ts
// my-feature.models.ts
import { InjectionToken } from '@angular/core';
import { MyFeatureStore } from './my-feature.store';

export const MY_FEATURE_STORE = new InjectionToken<MyFeatureStore>('MY_FEATURE_STORE');

// useClass lets Angular instantiate the class in a proper injection context
// (inject() calls inside the store will work correctly).
// NEVER use useFactory: () => new MyFeatureStore() — that bypasses DI and inject() will throw NG0203.
export const MY_FEATURE_STORE_PROVIDER = {
  provide: MY_FEATURE_STORE,
  useClass: MyFeatureStore,
};
```

Then in the component:

```ts
providers: [MY_FEATURE_STORE_PROVIDER],
// ...
store = inject(MY_FEATURE_STORE);
```

### 3. Inject in child components

Child components **never** provide the store again — they just inject from the parent's DI context.

```ts
// my-feature-child.component.ts
import { Component, inject } from '@angular/core';
import { MyFeatureStore } from '../my-feature.store';

@Component({ ... })
export class MyFeatureChildComponent {
  store = inject(MyFeatureStore);
  // store.data, store.activeItems() etc. are immediately available
}
```

---

## Reactive State Approaches

### A) `httpResource` — preferred for simple GET (Angular 19+)

```ts
data = httpResource<ItemModel>(() =>
  this.itemId() ? { url: `/api/items/${this.itemId()}` } : undefined
);
// data.value() — the loaded value (signal)
// data.isLoading() — loading state (signal)
// data.error() — error state (signal)
// data.reload() — manual reload
```

Use when: single GET, reactive to signal changes, no complex transforms.

### B) `BehaviorSubject` + RxJS + `toSignal` — for complex streams

```ts
tenantId$ = new BehaviorSubject<number>(0);

events$ = this.tenantId$.pipe(
  debounceTime(250),
  tap(() => this.loading$.next(true)),
  switchMap(id => id ? this.service.getEvents(id) : of(null)),
  tap(() => this.loading$.next(false)),
  shareReplay(1)
);

events = toSignal(this.events$, { initialValue: null });
```

Use when: multiple chained observables, debounce, forkJoin, complex transforms.

### C) Mixed signals + RxJS

Stores can combine both:

```ts
selectedRulesetId = signal<string | null>(null);               // writable signal
filteredRuleSets = computed(() =>                              // derived from another signal
  filterRulesets(this.filter(), this.allRuleSets())
);
allRuleSets = toSignal(this.allRulesets$, { initialValue: [] }); // from RxJS
```

---

## Rules & Conventions

- **Always use `inject()`** inside the class body — never add constructor params to the store
- **Provide the class directly** (`providers: [MyStore]`) for simple cases; use `InjectionToken` + `useClass` only when you need swappable implementations
- **Never `useFactory: () => new MyStore()`** — this bypasses Angular DI and all `inject()` calls will throw `NG0203`
- **Provide only at the root** of the component subtree that owns the data
- **Child components inject the store** — never `new MyStore()` in a component
- **Prefer `signal()` + `httpResource()`** for new stores; use BehaviorSubject only for complex RxJS pipelines
- **Don't duplicate state** that `httpResource` already provides (e.g. don't add a separate `isLoading` signal when `data.isLoading()` exists)
- **Expose only what consumers need** — keep private helpers private
- **Clean up RxJS subscriptions** — use `takeUntilDestroyed()` or `DestroyRef` for any manual subscriptions; `toSignal()` handles its own cleanup automatically
- **filter Form in store** — inline `FormGroup` for filtering/header controls is acceptable inside the store class
