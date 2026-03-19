import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'filter',
  },
  template: `
    <div class="filter-wrapper">
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
      </svg>
      <input
        type="text"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="onInput($event)"
        aria-label="Filter"
      />
      @if (value()) {
        <button class="clear-btn" (click)="clear()" aria-label="Clear filter">
          &#x2715;
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .filter-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      width: 16px;
      height: 16px;
      color: #94a3b8;
      pointer-events: none;
    }

    input {
      width: 100%;
      padding: 10px 36px 10px 36px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #334155;
      background: #fff;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;

      &::placeholder {
        color: #94a3b8;
      }

      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
      }
    }

    .clear-btn {
      position: absolute;
      right: 8px;
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #94a3b8;
      font-size: 0.75rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: #f1f5f9;
        color: #64748b;
      }
    }
  `,
})
export class Filter {
  placeholder = input('Search...');
  value = signal('');
  filterChange = output<string>();

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.filterChange.emit(val);
  }

  clear() {
    this.value.set('');
    this.filterChange.emit('');
  }
}
