import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-side-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  host: {
    'class': 'side-nav',
    '[class.collapsed]': 'collapsed()',
    'role': 'navigation',
    '[attr.aria-label]': '"Main navigation"',
  },
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNav {
  items = input<NavItem[]>([]);
  collapsed = signal(false);

  toggle() {
    this.collapsed.update((v) => !v);
  }
}
