import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type SdkDrawerSide = 'right' | 'left';

@Component({
  selector: 'sdk-drawer',
  standalone: true,
  templateUrl: './sdk-drawer.html',
  styleUrl: './sdk-drawer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sdk-drawer-open]': 'open()',
    '[attr.role]': 'open() ? "dialog" : null',
    '[attr.aria-modal]': 'open() ? "true" : null',
  },
})
export class SdkDrawer {
  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly side = input<SdkDrawerSide>('right');
  readonly closable = input<boolean>(true);

  readonly closed = output<void>();

  onClose(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
