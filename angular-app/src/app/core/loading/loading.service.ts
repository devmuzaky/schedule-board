import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const MIN_SHOW_MS = 400;

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = 0;
  private loading$ = new BehaviorSubject<boolean>(false);
  private minShowUntil = 0;

  get isLoading() {
    return this.loading$.asObservable();
  }

  show(): void {
    this.count++;
    if (this.count === 1) {
      this.minShowUntil = Date.now() + MIN_SHOW_MS;
      this.loading$.next(true);
    }
  }

  hide(): void {
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0) {
      const remaining = this.minShowUntil - Date.now();
      if (remaining > 0) {
        setTimeout(() => this.loading$.next(false), remaining);
      } else {
        this.loading$.next(false);
      }
    }
  }
}
