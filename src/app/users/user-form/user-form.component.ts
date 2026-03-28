import { Component, ChangeDetectionStrategy, effect, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { User } from '../user.model';
import { UserForm, UserFormPayload } from './user.form';

@Component({
  selector: 'kim-user-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  host: { 'class': 'user-form' },
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
  user = input<User | null>(null);

  saved = output<UserFormPayload>();
  cancelled = output<void>();

  protected formRef = new UserForm();

  constructor() {
    effect(() => this.formRef.fromResponse(this.user()));
  }

  protected get isEditMode(): boolean {
    return this.user() !== null;
  }

  save(): void {
    this.formRef.markAllAsTouched();
    if (this.formRef.invalid) {
        return;
    }
    this.saved.emit(this.formRef.toPayload);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
