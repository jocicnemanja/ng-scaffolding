import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { User } from '../user.model';

export type UserFormPayload = Omit<User, 'id'>;

export class UserForm extends FormGroup {
  constructor(user?: Partial<User>) {
    super({
      firstName: new FormControl(user?.firstName ?? ''),
      lastName: new FormControl(user?.lastName ?? ''),
      email: new FormControl(user?.email ?? ''),
      role: new FormControl<'admin' | 'editor' | 'viewer'>(user?.role ?? 'viewer'),
      status: new FormControl<'active' | 'inactive'>(user?.status ?? 'active'),
    });

    this._setValidators();
  }

  private _setValidators(): void {
    this.updateValueAndValidity();
  }

  fromResponse(user: User | null): void {
    if (!user) {
      this.reset();
      return;
    }

    this.patchValue({
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role:      user.role,
      status:    user.status,
    });
  }

  get firstNameCtrl(): FormControl {
    return this.get('firstName') as FormControl;
  }

  get lastNameCtrl(): FormControl {
    return this.get('lastName') as FormControl;
  }

  get emailCtrl(): FormControl {
    return this.get('email') as FormControl;
  }

  get toPayload(): UserFormPayload {
    return this.getRawValue() as UserFormPayload;
  }
}
