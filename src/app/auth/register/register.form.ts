import { FormControl, FormGroup, Validators, ValidationErrors, AbstractControl } from '@angular/forms';

export const passwordMatchValidator = (group: AbstractControl): ValidationErrors | null => {
  const password = (group as FormGroup).controls['password']?.value;
  const confirm = (group as FormGroup).controls['confirmPassword']?.value;
  if (!password || !confirm) return null;
  return password === confirm ? null : { passwordMismatch: true };
};

export class RegisterForm extends FormGroup {
  constructor() {
    super(
      {
        firstName: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        lastName: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        email: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.email],
        }),
        password: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required, Validators.minLength(4)],
        }),
        confirmPassword: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
      },
      { validators: [passwordMatchValidator] },
    );
  }

  get toPayload() {
    const { confirmPassword, ...rest } = this.getRawValue() as {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
    };
    return rest;
  }
}
