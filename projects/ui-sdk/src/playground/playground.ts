import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SdkInput } from '../sdk-input/sdk-input';

@Component({
  selector: 'sdk-playground',
  standalone: true,
  imports: [SdkInput, ReactiveFormsModule, JsonPipe],
  templateUrl: './playground.html',
  styleUrl: './playground.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Playground {
  readonly liveValue = signal<string>('');
  readonly emittedEvents = signal<string[]>([]);

  readonly form = new FormGroup({
    name: new FormControl('Ada Lovelace'),
    email: new FormControl(''),
    password: new FormControl(''),
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
