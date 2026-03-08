import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  constructor() {
    document.documentElement.classList.add('dark-theme');
  }

  get darkMode(): boolean {
    return true;
  }
}
