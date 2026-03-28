import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DialogConfig } from './dialog.model';

/**
 * Pure presentational shell — rendered inside a CDK Dialog overlay.
 * Open/close is controlled by the CDK DialogRef injected in the
 * feature-specific dialog component that wraps this shell.
 */
@Component({
  selector: 'kim-dialog-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'dialog-shell' },
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogShell {
  config = input.required<DialogConfig>();

  /** Emitted when the × close button is clicked. */
  closed = output<void>();

  close(): void {
    this.closed.emit();
  }
}
