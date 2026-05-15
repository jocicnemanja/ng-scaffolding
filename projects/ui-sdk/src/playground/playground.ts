import { ChangeDetectionStrategy, Component, Signal, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SdkInput } from '../form/input/input';
import { SdkSelect } from '../form/select/select';

@Component({
  selector: 'sdk-playground',
  standalone: true,
  imports: [SdkInput, SdkSelect, ReactiveFormsModule, JsonPipe],
  templateUrl: './playground.html',
  styleUrl: './playground.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Playground {
  readonly liveValue = signal<string>('');
  readonly emittedEvents = signal<string[]>([]);

  configuration = signal({
    searchEnabled: true,
    placeholder: 'Select a role',
    labelFormatter: (option : any) => `Role: ${option.label}`,
    idPropertyName: 'id'
  });

  options: Signal<any[]> = signal<any[]>([
    { id: 1, value: 'admin', label: 'Admin' },
    { id: 2, value: 'editor', label: 'Editor' },
    { id: 3, value: 'viewer', label: 'Viewer' },
  ]);

  readonly form = new FormGroup({
    name: new FormControl('Ada Lovelace'),
    email: new FormControl(''),
    password: new FormControl(''),
    role: new FormControl([]),
  });

  onValueChange(value: string): void {
    this.liveValue.set(value);
  }

  onFocus(): void {
    this.pushEvent('focus');
  }

  onBlur(): void {
    this.pushEvent('blur');
  }

  reset(): void {
    this.form.reset({ name: '', email: '', password: '' });
    this.liveValue.set('');
    this.emittedEvents.set([]);
  }

  private pushEvent(name: string): void {
    const stamp = new Date().toLocaleTimeString();
    this.emittedEvents.update((events) => [`${stamp} — ${name}`, ...events].slice(0, 8));
  }
}
