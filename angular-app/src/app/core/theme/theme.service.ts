import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'schedule-dark-mode';
const THEME_DARK = 'theme-dark.css';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDark = false;
  darkMode$ = new BehaviorSubject<boolean>(false);

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    this.isDark = stored === 'true';
    this.darkMode$.next(this.isDark);
    this.apply();
  }

  get darkMode(): boolean {
    return this.isDark;
  }

  toggle(): void {
    this.isDark = !this.isDark;
    this.darkMode$.next(this.isDark);
    localStorage.setItem(STORAGE_KEY, String(this.isDark));
    this.apply();
  }

  private apply(): void {
    document.documentElement.classList.toggle('dark-theme', this.isDark);
    const themeLink = document.getElementById('theme-link') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = this.isDark ? THEME_DARK : '';
    }
  }
}
