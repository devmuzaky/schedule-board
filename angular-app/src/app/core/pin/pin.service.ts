import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Static PIN - change this value to update the PIN everywhere */
const STATIC_PIN = '2026';

@Injectable({ providedIn: 'root' })
export class PinService {
  private showDialog$ = new BehaviorSubject<{ mode: 'verify'; resolve: (ok: boolean) => void } | null>(null);

  get dialogState() {
    return this.showDialog$.asObservable();
  }

  async verifyPin(pin: string): Promise<boolean> {
    return pin === STATIC_PIN;
  }

  /** Request PIN verification. Resolves true if correct, false if wrong or cancelled. */
  requestVerify(): Promise<boolean> {
    return new Promise((resolve) => {
      this.showDialog$.next({ mode: 'verify', resolve });
    });
  }

  completeDialog(ok: boolean): void {
    const state = this.showDialog$.value;
    if (state) {
      state.resolve(ok);
      this.showDialog$.next(null);
    }
  }
}
