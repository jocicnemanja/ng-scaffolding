import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { LoginForm } from './login.form';

@Component({
  selector: 'kim-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  host: { 'class': 'auth-page' },
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  formRef = new LoginForm();
  errorMsg = signal('');

  submit() {
    this.formRef.markAllAsTouched();
    if (this.formRef.invalid) return;

    const { email, password } = this.formRef.toPayload;
    const success = this.auth.login(email, password);

    if (!success) {
      this.errorMsg.set('Invalid email or password.');
      return;
    }

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigateByUrl(returnUrl);
  }
}
