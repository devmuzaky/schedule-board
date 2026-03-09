import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = 0;
  private loading$ = new BehaviorSubject<boolean>(false);

  get isLoading() {
    return this.loading$.asObservable();
  }

  show(): void {
    this.count++;
    this.loading$.next(this.count > 0);
  }

  hide(): void {
    this.count = Math.max(0, this.count - 1);
    this.loading$.next(this.count > 0);
  }
}
