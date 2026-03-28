import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DialogShell } from '../../shared/dialog/dialog.component';
import { DialogConfig } from '../../shared/dialog/dialog.model';
import { UserFormComponent } from './user-form.component';
import { UserFormPayload } from './user.form';
import { User } from '../user.model';

export interface UserFormDialogData {
  user: User | null;
}

@Component({
  selector: 'kim-user-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogShell, UserFormComponent],
  template: `
    <kim-dialog-shell [config]="shellConfig" (closed)="cancel()">
      <kim-user-form
        [user]="data.user"
        (saved)="save($event)"
        (cancelled)="cancel()"
      />
    </kim-dialog-shell>
  `,
})
export class UserFormDialogComponent {
  protected readonly data = inject<UserFormDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<UserFormPayload>);

  protected readonly shellConfig: DialogConfig = {
    title: this.data.user ? 'Edit User' : 'Add User',
    size: 'md',
    closable: true,
  };

  save(payload: UserFormPayload): void {
    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
