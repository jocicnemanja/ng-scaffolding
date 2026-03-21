import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'confirm-modal',
    '[class.confirm-modal--open]': 'open()',
    '(click)': 'onBackdropClick($event)',
  },
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModal {
  title = input.required<string>();
  message = input.required<string>();
  confirmLabel = input('Confirm');
  cancelLabel = input('Cancel');
  open = input(false, { transform: booleanAttribute });

  confirmed = output<void>();
  dismissed = output<void>();

  private readonly el = inject(ElementRef);

  constructor() {
    effect(() => {
      if (this.open()) {
        setTimeout(() => {
          const btn = this.el.nativeElement.querySelector(
            '.confirm-modal__confirm',
          ) as HTMLElement | null;
          btn?.focus();
        });
      }
    });
  }

  confirm(): void {
    this.confirmed.emit();
  }

  dismiss(): void {
    this.dismissed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.el.nativeElement) {
      this.dismiss();
    }
  }
}
