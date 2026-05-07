import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  signal,
  input,
  output,
  effect,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';

/**
 * Callback function type for value changes in the SDK input component.
 *
 * @example
 * ```typescript
 * const callback: SdkInputValueChangeFn = (value: string) => {
 *   console.log('Value changed:', value);
 * };
 * ```
 */
export type SdkInputValueChangeFn = (value: string) => void;

/**
 * Callback function type for touched events in the SDK input component.
 */
export type SdkInputTouchedFn = () => void;

/**
 * High-performance, accessible text input component for the SDK.
 *
 * This component provides a production-ready input field with:
 * - Two-way data binding through ControlValueAccessor
 * - Signal-based state management
 * - OnPush change detection for optimal performance
 * - Full accessibility support (WCAG AA compliant)
 * - TypeScript strict mode support
 *
 * @example
 * ```typescript
 * // In your component
 * const form = new FormGroup({
 *   name: new FormControl(''),
 * });
 *
 * // In your template
 * <lib-sdk-input
 *   formControl="name"
 *   placeholder="Enter your name"
 *   ariaLabel="Full Name"
 * />
 * ```
 *
 * @example
 * ```typescript
 * // Direct signal binding
 * export class MyComponent {
 *   inputValue = signal('');
 *   inputPlaceholder = input('Enter text');
 * }
 *
 * // In template
 * <lib-sdk-input [ngModel]="inputValue()" (ngModelChange)="inputValue.set($event)" />
 * ```
 */
@Component({
  selector: 'lib-sdk-input',
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SdkInput),
      multi: true,
    },
  ],
  templateUrl: './sdk-input.html',
  styleUrl: './sdk-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  /**
   * Host bindings: Dynamically bind attributes/classes/styles to the host element
   * Modern Angular approach (v14+) instead of @HostBinding decorators
   */
  host: {
    // Bind CSS classes to host element based on state
    '[class.sdk-input-focused]': '_touched()',
    '[class.sdk-input-error]': 'false', // Can be connected to error state
    '[class.sdk-input-disabled]': 'disabled()',

    // Bind attributes to the host
    '[attr.role]': '"group"',
    '[attr.data-input-type]': 'type()',

    // Bind styles to host (CSS variables from :host)
    '[style.--sdk-input-padding]': '"0.75rem 1rem"',
  },
})
export class SdkInput implements ControlValueAccessor {
  /**
   * Placeholder text displayed in the input field when empty.
   * @default ''
   */
  readonly placeholder = input<string>('');

  /**
   * Whether the input is disabled. When disabled, user cannot interact with the input.
   * @default false
   */
  readonly disabled = input<boolean>(false);

  /**
   * Accessible label for the input field (ARIA attribute).
   * Should be provided for accessibility compliance.
   * @default ''
   */
  readonly ariaLabel = input<string>('');

  /**
   * CSS class names to apply to the input element.
   * Useful for custom styling without modifying the component.
   * @default ''
   */
  readonly cssClass = input<string>('');

  /**
   * Maximum length of the input value.
   * If not specified, no limit is enforced.
   * @default undefined
   */
  readonly maxLength = input<number | undefined>(undefined);

  /**
   * Type of input field (text, password, email, etc.).
   * @default 'text'
   */
  readonly type = input<'text' | 'password' | 'email' | 'tel' | 'url'>('text');

  /**
   * Emitted when the input value changes.
   * Consumers can listen to value changes through this output.
   */
  readonly valueChange = output<string>();

  /**
   * Emitted when the input receives focus.
   */
  readonly focusEvent = output<FocusEvent>();

  /**
   * Emitted when the input loses focus.
   */
  readonly blurEvent = output<FocusEvent>();

  /**
   * Internal signal to manage the current input value.
   * @internal
   */
  private readonly _value = signal<string>('');

  /**
   * Internal signal to track whether the input has been touched by the user.
   * @internal
   */
  private readonly _touched = signal<boolean>(false);

  /**
   * ControlValueAccessor callback for value changes.
   * @internal
   */
  private _onChange: SdkInputValueChangeFn | null = null;

  /**
   * ControlValueAccessor callback for touched events.
   * @internal
   */
  private _onTouched: SdkInputTouchedFn | null = null;

  constructor() {
    // Sync disabled state from input to signal when it changes
    effect(() => {
      const disabledState = this.disabled();
      // This effect tracks the disabled input to ensure proper updates
      // to the control value accessor
      if (disabledState) {
        this._onChange = null;
      }
    });
  }

  /**
   * ControlValueAccessor: Write a new value to the element.
   *
   * @param value - The new value from the form control
   */
  writeValue(value: unknown): void {
    if (value === null || value === undefined) {
      return;
    }
    this._value.set(String(value));
  
  }

  /**
   * ControlValueAccessor: Register a callback to be invoked when the value changes.
   *
   * @param fn - Callback function to invoke on value change
   */
  registerOnChange(fn: SdkInputValueChangeFn): void {
    this._onChange = fn;
  }

  /**
   * ControlValueAccessor: Register a callback to be invoked when the input is touched.
   *
   * @param fn - Callback function to invoke on touch
   */
  registerOnTouched(fn: SdkInputTouchedFn): void {
    this._onTouched = fn;
  }

  /**
   * ControlValueAccessor: Set the disabled state of the component.
   *
   * @param isDisabled - Whether the component should be disabled
   */
  setDisabledState(isDisabled: boolean): void {
    // Note: disabled state is managed through input() signal
    // This method is kept for ControlValueAccessor compliance
  }

  /**
   * Get the current value of the input.
   *
   * @returns The current input value
   */
  getValue(): string {
    return this._value();
  }

  /**
   * Check if the input has been touched by the user.
   *
   * @returns True if the input has been touched
   */
  isTouched(): boolean {
    return this._touched();
  }

  /**
   * Handle input changes and propagate to form control.
   *
   * @param event - The input event from the template
   * @internal
   */
  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    this._value.set(value);

    if (this._onChange) {
      this._onChange(value);
    }

    this.valueChange.emit(value);
  }

  /**
   * Handle input blur (focus lost) event.
   *
   * @param event - The blur event from the template
   * @internal
   */
  onBlur(event: FocusEvent): void {
    this._touched.set(true);

    if (this._onTouched) {
      this._onTouched();
    }

    this.blurEvent.emit(event);
  }

  /**
   * Handle input focus event.
   *
   * @param event - The focus event from the template
   * @internal
   */
  onFocus(event: FocusEvent): void {
    this.focusEvent.emit(event);
  }

}
