import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

let _instanceCounter = 0;

/**
 * High-performance, accessible checkbox component for the SDK.
 *
 * - Two-way binding through ControlValueAccessor (works with Reactive Forms)
 * - Signal-based state with OnPush change detection
 * - Tri-state support via the `indeterminate` input
 * - Keyboard support is delegated to the native input for free a11y
 */
@Component({
  selector: 'sdk-checkbox',
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SdkCheckbox),
      multi: true,
    },
  ],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sdk-checkbox-checked]': '_checked()',
    '[class.sdk-checkbox-indeterminate]': 'indeterminate()',
    '[class.sdk-checkbox-disabled]': 'disabled()',
    '[class.sdk-checkbox-touched]': '_touched()',
    '[class.sdk-checkbox-switch]': 'toggleSwitchModel()',
    '[attr.aria-disabled]': 'disabled()',
  },
})
export class SdkCheckbox implements ControlValueAccessor {
  /** Optional label rendered next to the box. Use `ng-content` for richer content. */
  readonly label = input<string>('');

  /** Indeterminate (tri-state) marker — visually shows a dash. */
  readonly indeterminate = input<boolean>(false);

  /** Accessible label forwarded to the native input. */
  readonly ariaLabel = input<string>('');

  readonly toggleSwitchModel = input<boolean>(false);

  /**
   * Disabled state supplied directly as an input. Combined with the form-driven
   * state set via {@link setDisabledState} — read the combined value through
   * {@link disabled}.
   */
  protected readonly _disabledInput = input<boolean>(false, { alias: 'disabled' });
  

  /** Emitted when the checked state changes. */
  readonly valueChange = output<boolean>();

  readonly inputId = `sdk-checkbox-${++_instanceCounter}`;

  readonly _checked = signal<boolean>(false);
  readonly _touched = signal<boolean>(false);
  private readonly _disabledFromForm = signal<boolean>(false);

  /** Current checked state (readonly view of internal state). */
  readonly checked: Signal<boolean> = this._checked.asReadonly();

  /** Effective disabled state, merging input and Reactive Forms `disable()`. */
  readonly disabled: Signal<boolean> = computed(
    () => this._disabledInput() || this._disabledFromForm(),
  );

  /** `aria-checked` value — `'mixed'` when indeterminate. */
  readonly ariaChecked = computed<'true' | 'false' | 'mixed'>(() =>
    this.indeterminate() ? 'mixed' : (this._checked() ? 'true' : 'false'),
  );

  private _onChange: ((value: boolean) => void) | null = null;
  private _onTouched: (() => void) | null = null;

  // ─── ControlValueAccessor ──────────────────────────────────────────

  writeValue(value: unknown): void {
    this._checked.set(value === true);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabledFromForm.set(isDisabled);
  }

  // ─── Public API ────────────────────────────────────────────────────

  toggle(): void {
    if (this.disabled()) return;
    this._commit(!this._checked());
  }

  _onNativeChange(event: Event): void {
    if (this.disabled()) return;
    const target = event.target as HTMLInputElement;
    this._commit(target.checked);
  }

  _onBlur(): void {
    this._markAsTouched();
  }

  // ─── Internals ─────────────────────────────────────────────────────

  private _commit(next: boolean): void {
    this._checked.set(next);
    this._onChange?.(next);
    this.valueChange.emit(next);
    this._markAsTouched();
  }

  private _markAsTouched(): void {
    if (this._touched()) return;
    this._touched.set(true);
    this._onTouched?.();
  }
}
