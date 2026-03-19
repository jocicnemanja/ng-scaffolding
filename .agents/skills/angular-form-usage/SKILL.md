---
name: angular-form-usage
description: 'How to create and use Angular forms in this project. Use when: creating a new form class, wiring a form to a component or template, adding validation, or building a form payload for save/update.'
---

# Angular Form Usage

This project uses **typed reactive forms** (`FormGroup` / `FormControl`) in dedicated `*.form.ts` files. Keep form definitions out of components.

### File layout

```
my-feature/
├── my-feature.form.ts        ← form class (extends FormGroup)
├── my-feature.component.ts   ← creates the form instance
└── my-feature.component.html
```

---

## Form Class Examples

### Plain `FormGroup` — for UI-only or sub-forms

```ts
// decision-logic.form.ts
import { FormControl, FormGroup, ValidationErrors, AbstractControl, Validators } from '@angular/forms';

// Custom cross-field validator
export const allOrNothingValidator = (group: AbstractControl): ValidationErrors | null => {
  const controls = (group as FormGroup).controls;
  const values = Object.values(controls).map(c => c.value);
  const filled = values.filter(v => !!v).length;
  const valid = filled === values.length || filled === 0;
  return valid ? null : { notAllFilled: true };
};

export class DecisionLogicForm extends FormGroup {
  constructor() {
    super(
      {
        accountNumber:      new FormControl(null, [Validators.pattern(/^\d+$/)]),
        routingNumber:      new FormControl(null, [Validators.pattern(/^\d+$/)]),
        emailAddress:       new FormControl(null, { validators: [Validators.email], updateOn: 'blur' }),
        notificationTarget: new FormControl(null),
      },
      { validators: [allOrNothingValidator] }  // group-level validator
    );
  }

  // Typed payload — prefer getRawValue() for all fields including disabled
  get toPayload() {
    return this.getRawValue();
  }
}
```

### When sub-forms hold runtime data

It is acceptable to store auxiliary state as **class properties** (not form controls) on a `FormGroup` subclass:

```ts
export class TenantEventSettingsForm extends FormGroup {
  // Runtime context (not serialized to form value)
  private _stipulations: any[] = [];

  get stipulations() { return this._stipulations; }
  set stipulations(v: any[]) {
    this._stipulations = v;
    this._onStipulationsChanged();  // propagate to child controls
  }

  // Typed getter for a child control
  get emailCtrl(): FormControl {
    return this.get('emailTemplateId') as FormControl;
  }

  // ...
}
```

---

## Component Usage

Instantiate the form in the component. For forms that need services, pass them via constructor:

```ts
@Component({
  selector: 'app-my-feature',
  templateUrl: './my-feature.component.html',
})
export class MyFeatureComponent {
  formRef = new DecisionLogicForm();

  save() {
    this.formRef.markAllAsTouched();
    if (this.formRef.invalid) return;
    const payload = this.formRef.toPayload;
    // send payload to service...
  }
}
```

If a form needs an injected service, pass it directly:

```ts
private service = inject(MyService);
formRef = new MyFeatureForm(this.service);
```

---

## Validation Rules

- **Field-level**: pass `Validators.*` to `FormControl`
- **Cross-field**: pass a validator function to the `FormGroup` constructor's `validators` option
- Always call `this.formRef.markAllAsTouched()` before checking `formRef.invalid` in save handlers
- Use `updateOn: 'blur'` on controls that should validate only after user leaves the field

---

## Template Conventions

```html
<form [formGroup]="formRef" (ngSubmit)="save()">
  <!-- Standard Angular reactive binding -->
  <label>
    Field Name
    <input formControlName="fieldName" />
  </label>

  <!-- Nested FormGroup -->
  <div formGroupName="address">
    <label>
      City
      <input formControlName="city" />
    </label>
  </div>

  <!-- FormArray — use a typed getter, not formRef.get('items') -->
  <ng-container formArrayName="items">
    @for (ctrl of itemsArray.controls; let i = $index; track i) {
      <div [formGroupName]="i">
        <input formControlName="name" />
      </div>
    }
  </ng-container>

  <button type="submit">Save</button>
</form>
```

For `FormArray`, always expose a typed getter in the component:

```ts
import { FormArray } from '@angular/forms';

get itemsArray(): FormArray {
  return this.formRef.get('items') as FormArray;
}
```

---

## Typed Forms (Angular 14+)

Prefer typed form controls — the compiler catches field name mismatches and wrong value types:

```ts
import { FormControl, FormGroup, Validators } from '@angular/forms';

// nonNullable: true removes `| null` from the type
const form = new FormGroup({
  name:  new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  age:   new FormControl<number>(0, { nonNullable: true }),
  email: new FormControl<string | null>(null, { validators: [Validators.email] }),
});

form.value.name;  // string (not string | null)
form.value.age;   // number
form.value.email; // string | null

// getRawValue() includes disabled controls and is fully typed
const payload = form.getRawValue();
```

---

## Do Not

- **Do not** use `UntypedFormBuilder` / `UntypedFormGroup` in new code — use typed `FormGroup` / `FormControl`
- **Do not** put form definitions inside components — keep them in separate `*.form.ts` files
- **Do not** use `formRef.value` directly as a payload — use `getRawValue()` or define a `toPayload` getter
- **Do not** use `formRef.get('field')` in templates — use typed getters in the component class
