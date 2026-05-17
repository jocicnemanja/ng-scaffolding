import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { SdkInput } from '../input/input';

/**
 * Generic shape for an option rendered by the SDK select.
 *
 * Intentionally permissive (`object`) so plain interfaces — without an
 * explicit index signature — satisfy the constraint.
 */
export type SdkSelectOption = object;

/** Function used to format an option into a user-facing label. */
export type SdkSelectLabelFormatter<T extends SdkSelectOption = SdkSelectOption> =
  (option: T) => string | undefined;

/** Configuration object for the SDK select component. */
export type SdkSelectConfiguration<T extends SdkSelectOption = SdkSelectOption> = {
  /** Whether the inline search input filters the option list. */
  searchEnabled?: boolean;
  /** Placeholder text shown in the search input. */
  placeholder?: string;
  /** Function used to derive the display label for each option. */
  labelFormatter?: SdkSelectLabelFormatter<T>;
  /** Property name on the option object used as a unique identifier. */
  idPropertyName?: string;
};

type ResolvedConfiguration<T extends SdkSelectOption> = {
  searchEnabled: boolean;
  placeholder: string;
  idPropertyName: string;
  labelFormatter: SdkSelectLabelFormatter<T> | undefined;
};

const DEFAULT_CONFIGURATION: ResolvedConfiguration<SdkSelectOption> = {
  searchEnabled: false,
  placeholder: '',
  idPropertyName: 'id',
  labelFormatter: undefined,
};

const OVERLAY_POSITIONS: ConnectedPosition[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: 4,
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
    offsetY: -4,
  },
];

let _instanceCounter = 0;

/** Read a string-keyed property from an object whose type does not declare an index signature. */
function prop(o: object, key: string): unknown {
  return (o as Record<string, unknown>)[key];
}

/**
 * High-performance, accessible multi-select component for the SDK.
 *
 * - Two-way binding through ControlValueAccessor (works with Reactive Forms)
 * - Signal-based state with OnPush change detection
 * - Generic over the option shape: `SdkSelect<MyOption>`
 * - Combobox keyboard support (Arrow/Home/End/Enter/Escape)
 */
@Component({
  selector: 'sdk-select',
  imports: [SdkInput, OverlayModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SdkSelect),
      multi: true,
    },
  ],
  templateUrl: './select.html',
  styleUrl: './select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sdk-select-touched]': '_touched()',
    '[class.sdk-select-disabled]': 'disabled()',
    '[class.sdk-select-open]': '_showDropdown()',
    '[attr.role]': '"combobox"',
    '[attr.aria-haspopup]': '"listbox"',
    '[attr.aria-expanded]': '_showDropdown()',
    '[attr.aria-controls]': 'listboxId',
    '[attr.aria-activedescendant]': 'activeOptionId()',
    '[attr.aria-disabled]': 'disabled()',
    '(keydown)': '_onKeyDown($event)',
  },
})
export class SdkSelect<T extends SdkSelectOption = SdkSelectOption>
  implements ControlValueAccessor
{
  /** Options available for selection. */
  readonly options = input<T[]>([]);

  /** Configuration controlling search, placeholder, label formatting and id property. */
  readonly configuration = input<SdkSelectConfiguration<T>>({});

  /**
   * Disabled state supplied directly as an input. Combined with the form-driven
   * state set via {@link setDisabledState} — read the combined value through
   * {@link disabled}.
   */
  protected readonly _disabledInput = input<boolean>(false, { alias: 'disabled' });

  /** Emitted when the selected options change. */
  readonly valueChange = output<T[]>();

  readonly overlayPositions = OVERLAY_POSITIONS;
  readonly listboxId = `sdk-select-listbox-${++_instanceCounter}`;

  // CDK overlay hide on scoll
  constructor() {
    effect((onCleanup) => {
      if (!this._showDropdown()) return;
      const handler = (event: Event) => {
        const target = event.target as Node | null;
        if (target instanceof Element && target.closest('.sdk-select-list')) {
          return;
        }
        this.onClose();
      };
      window.addEventListener('scroll', handler, true);
      onCleanup(() => window.removeEventListener('scroll', handler, true));
    });
  }

  /** Configuration with defaults applied — single source of truth. */
  readonly cfg = computed<ResolvedConfiguration<T>>(() => ({
    ...(DEFAULT_CONFIGURATION as ResolvedConfiguration<T>),
    ...this.configuration(),
  }));

  private readonly _disabledFromForm = signal(false);

  /** Effective disabled state, merging input and Reactive Forms `disable()`. */
  readonly disabled: Signal<boolean> = computed(
    () => this._disabledInput() || this._disabledFromForm(),
  );

  private readonly _selectedOptions = signal<readonly T[]>([]);

  /** Currently selected options (readonly view of internal state). */
  readonly selectedOptions: Signal<readonly T[]> = this._selectedOptions.asReadonly();

  /** Filtered options shown in the dropdown after applying the search term. */
  readonly filteredOptions = computed<T[]>(() => {
    const opts = this.options() ?? [];
    const term = this._searchTerm().toLowerCase();
    if (!term) {
      return opts;
    }
    const { labelFormatter, idPropertyName } = this.cfg();
    return opts.filter((opt) =>
      this._labelFor(opt, labelFormatter, idPropertyName)
        .toLowerCase()
        .includes(term),
    );
  });

  /** ID of the currently active option for `aria-activedescendant`. */
  readonly activeOptionId = computed<string | null>(() => {
    if (!this._showDropdown()) return null;
    const idx = this._activeIndex();
    const opts = this.filteredOptions();
    if (idx < 0 || idx >= opts.length) return null;
    return this._optionDomId(opts[idx]);
  });

  readonly _searchTerm = signal<string>('');
  readonly _showDropdown = signal<boolean>(false);
  readonly _touched = signal<boolean>(false);
  readonly _activeIndex = signal<number>(-1);

  private _onChange: ((value: T[]) => void) | null = null;
  private _onTouched: (() => void) | null = null;

  // ─── ControlValueAccessor ──────────────────────────────────────────

  writeValue(value: unknown): void {
    this._selectedOptions.set(Array.isArray(value) ? (value as T[]) : []);
    this._searchTerm.set('');
    this._touched.set(false);
    this._showDropdown.set(false);
    this._activeIndex.set(-1);
  }

  registerOnChange(fn: (value: T[]) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabledFromForm.set(isDisabled);
    if (isDisabled) {
      this._showDropdown.set(false);
    }
  }

  // ─── Public API ────────────────────────────────────────────────────

  toggleOption(option: T): void {
    if (this.disabled()) return;
    const idKey = this.cfg().idPropertyName;
    const target = prop(option, idKey);
    const current = this._selectedOptions();
    const next = current.some((o) => prop(o, idKey) === target)
      ? current.filter((o) => prop(o, idKey) !== target)
      : [...current, option];
    this._selectedOptions.set(next);
    this._onChange?.(next as T[]);
    this.valueChange.emit(next as T[]);
    this._markAsTouched();
  }

  isSelected(option: T): boolean {
    const idKey = this.cfg().idPropertyName;
    const target = prop(option, idKey);
    return this._selectedOptions().some((o) => prop(o, idKey) === target);
  }

  displayLabel(option: T): string {
    const { labelFormatter, idPropertyName } = this.cfg();
    return this._labelFor(option, labelFormatter, idPropertyName);
  }

  optionDomId(option: T): string {
    return this._optionDomId(option);
  }

  /** Track-by for `@for` — uses the configured id property. */
  trackById = (_index: number, option: T): unknown =>
    prop(option, this.cfg().idPropertyName);

  onOpen(): void {
    if (this.disabled() || this._showDropdown()) return;
    this._showDropdown.set(true);
    if (this._activeIndex() < 0 && this.filteredOptions().length > 0) {
      this._activeIndex.set(0);
    }
  }

  onClose(): void {
    if (!this._showDropdown()) return;
    this._showDropdown.set(false);
    this._activeIndex.set(-1);
    this._markAsTouched();
  }

  onSearchChange(value: string): void {
    this._searchTerm.set(value);
    if (!this._showDropdown()) {
      this.onOpen();
    }
    const items = this.filteredOptions();
    this._activeIndex.set(items.length > 0 ? 0 : -1);
  }

  _onKeyDown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const items = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this._showDropdown()) {
          this.onOpen();
          return;
        }
        if (items.length) {
          this._activeIndex.update((i) => (i + 1) % items.length);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this._showDropdown()) {
          this.onOpen();
          return;
        }
        if (items.length) {
          this._activeIndex.update((i) => (i <= 0 ? items.length - 1 : i - 1));
        }
        break;

      case 'Home':
        if (!this._showDropdown() || !items.length) return;
        event.preventDefault();
        this._activeIndex.set(0);
        break;

      case 'End':
        if (!this._showDropdown() || !items.length) return;
        event.preventDefault();
        this._activeIndex.set(items.length - 1);
        break;

      case 'Enter': {
        if (!this._showDropdown()) {
          this.onOpen();
          return;
        }
        const idx = this._activeIndex();
        const active = items[idx];
        if (active) {
          event.preventDefault();
          this.toggleOption(active);
        }
        break;
      }

      case 'Escape':
        if (this._showDropdown()) {
          event.preventDefault();
          this.onClose();
        }
        break;
    }
  }

  // ─── Internals ─────────────────────────────────────────────────────

  private _labelFor(
    option: T,
    formatter: SdkSelectLabelFormatter<T> | undefined,
    idKey: string,
  ): string {
    if (formatter) {
      const out = formatter(option);
      if (out !== undefined && out !== null) return String(out);
    }
    const id = prop(option, idKey);
    return id === undefined || id === null ? '' : String(id);
  }

  private _optionDomId(option: T): string {
    return `${this.listboxId}-opt-${String(prop(option, this.cfg().idPropertyName))}`;
  }

  private _markAsTouched(): void {
    if (this._touched()) return;
    this._touched.set(true);
    this._onTouched?.();
  }
}
