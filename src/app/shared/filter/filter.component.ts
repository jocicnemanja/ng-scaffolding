import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'filter' },
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
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
