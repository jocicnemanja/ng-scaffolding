import { Component, ChangeDetectionStrategy, input, output, inject, computed } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { SdkCheckbox } from 'ui-sdk';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'kim-header',
  imports: [SdkCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'header',
    'role': 'banner',
  },
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class Header {
  title = input('ng-scaffolding');
  menuToggle = output<void>();

  protected auth = inject(AuthService);
  private theme = inject(ThemeService);

  protected userName = computed(() => {
    const u = this.auth.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  protected userInitial = computed(() => {
    const u = this.auth.user();
    return u ? u.firstName.charAt(0).toUpperCase() : '';
  });

  onThemeChange(checked: boolean) {
    this.theme.setTheme(checked ? 'dark' : 'light');
  }
}
