import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private doc = inject(DOCUMENT);

  setTheme(theme: Theme) {
    this.doc.documentElement.setAttribute('data-theme', theme);
  }
}
