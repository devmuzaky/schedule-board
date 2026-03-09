import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PinService } from './pin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pin-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, InputTextModule, ButtonModule],
  template: `
    <p-dialog
      header="Enter PIN"
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '320px' }"
      (onHide)="onCancel()"
      styleClass="pin-dialog"
    >
      <p class="pin-hint">Enter PIN to continue.</p>
      <div class="pin-field">
        <label for="pinVerify">PIN</label>
        <input
          pInputText
          id="pinVerify"
          type="password"
          [(ngModel)]="pin"
          placeholder="••••"
          maxlength="6"
          inputmode="numeric"
          autocomplete="off"
          class="pin-input"
          (keydown.enter)="onSubmit()"
        />
      </div>
      @if (errorMsg) {
        <p class="pin-error">{{ errorMsg }}</p>
      }
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" class="p-button-text" (click)="onCancel()"></button>
        <button pButton label="OK" (click)="onSubmit()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .pin-hint {
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
        color: var(--app-text-secondary);
      }
      .pin-field {
        margin-bottom: 1rem;
      }
      .pin-field label {
        display: block;
        margin-bottom: 0.35rem;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--app-text);
      }
      .pin-input {
        width: 100%;
      }
      .pin-error {
        margin: -0.5rem 0 0.5rem 0;
        font-size: 0.85rem;
        color: #ef4444;
      }
    `,
  ],
})
export class PinDialogComponent implements OnDestroy {
  private pinService = inject(PinService);
  private sub?: Subscription;

  visible = false;
  pin = '';
  errorMsg = '';

  constructor() {
    this.sub = this.pinService.dialogState.subscribe((state) => {
      if (state) {
        this.pin = '';
        this.errorMsg = '';
        this.visible = true;
      } else {
        this.visible = false;
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onCancel() {
    this.pinService.completeDialog(false);
  }

  async onSubmit() {
    const ok = await this.pinService.verifyPin(this.pin);
    if (ok) {
      this.pinService.completeDialog(true);
    } else {
      this.errorMsg = 'Incorrect PIN';
    }
  }
}
