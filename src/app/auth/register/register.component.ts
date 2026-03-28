import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { RegisterForm } from './register.form';

@Component({
  selector: 'kim-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  host: { 'class': 'auth-page' },
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);

  formRef = new RegisterForm();
  errorMsg = signal('');

  submit() {
    this.formRef.markAllAsTouched();
    if (this.formRef.invalid) return;

    const { firstName, lastName, email, password } = this.formRef.toPayload;
    const success = this.auth.register(firstName, lastName, email, password);

    if (!success) {
      this.errorMsg.set('Registration failed. Please try again.');
      return;
    }

    this.router.navigate(['/dashboard']);
  }
}
