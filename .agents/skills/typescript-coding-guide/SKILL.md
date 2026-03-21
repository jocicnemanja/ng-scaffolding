---
name: typescript-coding-guide
description: "TypeScript coding style and patterns guide. Use when: writing TypeScript code, reviewing code style, applying early-return guard clauses, choosing between if/else vs early return, writing clean control flow, or enforcing consistent code patterns in .ts files."
---

# TypeScript Coding Guide

Consistent TypeScript style rules for this project. Apply these patterns in all `.ts` files.

## Early Return (Guard Clauses)

Prefer early returns to reduce nesting and improve readability. Handle errors and edge cases first, then proceed with the happy path.

### Do — early return

```ts
function getUser(id: number): User {
  const user = this.users.find(u => u.id === id);
  if (!user) {
    throw new Error(`User ${id} not found`);
  }

  return user;
}
```

```ts
submit() {
  this.formRef.markAllAsTouched();
  if (this.formRef.invalid){
     return;
  }

  const payload = this.formRef.toPayload;
  this.save(payload);
}
```

```ts
onClick(event: Event) {
  if (this.disabled()) {
    return;
  }

  this.clicked.emit();
}
```

### Don't — unnecessary else after return

```ts
// BAD: else is redundant when the if-branch returns
function getUser(id: number): User {
  const user = this.users.find(u => u.id === id);
  if (!user) {
    throw new Error(`User ${id} not found`);
  } else {
    return user;
  }
}
```

## When `if/else` Is Acceptable

Use `if/else` only when **both branches produce a value** in an expression-like pattern with no early exit, or when the two branches are truly symmetric alternatives.

### Acceptable — two symmetric assignments

```ts
let label: string;
if (user.role === 'admin') {
  label = 'Administrator';
} else {
  label = 'Member';
}
```

Even better — prefer a ternary for simple cases:

```ts
const label = user.role === 'admin' ? 'Administrator' : 'Member';
```

### Acceptable — template control flow

Angular `@if/@else` in templates is fine because templates don't have `return`:

```html
@if (isLoading()) {
  <p>Loading…</p>
} @else {
  <app-table />
}
```

## Multi-Branch Logic

For 3+ branches, prefer `switch`, a lookup map, or early returns over chained `if/else if/else`.

### Do — early returns

```ts
function getDiscount(role: string): number {
  if (role === 'admin') {
    return 0.3;
  }
  if (role === 'editor') {
    return 0.15;
  }
  if (role === 'viewer') {
    return 0.05;
  }
  return 0;
}
```

### Do — lookup map

```ts
const discountByRole: Record<string, number> = {
  admin: 0.3,
  editor: 0.15,
  viewer: 0.05,
};

const discount = discountByRole[role] ?? 0;
```

### Don't — chained if/else

```ts
// BAD: hard to scan, easy to miss a branch
function getDiscount(role: string): number {
  if (role === 'admin') {
    return 0.3;
  } else if (role === 'editor') {
    return 0.15;
  } else if (role === 'viewer') {
    return 0.05;
  } else {
    return 0;
  }
}
```

## Summary Rules

1. **Guard clause first** — check for errors / invalid state and `return` early
2. **No `else` after `return`** — the `else` is always redundant
3. **Flat over nested** — one level of indentation in the happy path
4. **Ternary for simple values** — `const x = cond ? a : b` over `if/else` assignment
5. **Maps or early returns for multi-branch** — avoid chained `if/else if/else`
