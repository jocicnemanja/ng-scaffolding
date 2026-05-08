import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';

export type SdkConfirmKind = 'info' | 'warning' | 'danger';

@Component({
  selector: 'sdk-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sdk-confirm-open]': 'open()',
    '[attr.role]': 'open() ? "dialog" : null',
    '[attr.aria-modal]': 'open() ? "true" : null',
    '[attr.aria-labelledby]': 'open() ? "sdk-confirm-title" : null',
    '(escape)': 'onEscape()',
  },
})
export class SdkConfirmDialog {
  readonly open = input<boolean>(false);
  readonly title = input<string>('Confirm');
  readonly message = input<string>('Are you sure?');
  readonly confirmLabel = input<string>('Confirm');
  readonly cancelLabel = input<string>('Cancel');
  readonly kind = input<SdkConfirmKind>('info');

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel.emit();
    }
  }

  // @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.cancel.emit();
    }
  }
}
