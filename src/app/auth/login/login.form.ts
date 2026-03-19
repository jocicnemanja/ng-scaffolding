import { FormControl, FormGroup, Validators } from '@angular/forms';

export class LoginForm extends FormGroup {
  constructor() {
    super({
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(4)],
      }),
    });
  }

  get toPayload() {
    return this.getRawValue() as { email: string; password: string };
  }
}
