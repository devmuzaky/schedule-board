import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    FloatLabelModule,
    ButtonModule,
    RippleModule,
  ],
  template: `
    <div class="login-container">
      <p-card class="login-card">
        <ng-template pTemplate="header">
          <div class="card-header">
            <div class="logo-area">
              <i class="pi pi-calendar"></i>
            </div>
            <h2>Moe Zaky's Schedule</h2>
            <p class="subtitle">Sign in to manage your schedule</p>
            <p class="tagline">Track your weekly goals and progress in one place.</p>
          </div>
        </ng-template>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
          <div class="field full-width">
            <span class="p-float-label">
              <input pInputText id="username" formControlName="username" autocomplete="username" class="full-width" />
              <label for="username">Username</label>
            </span>
            @if (form.get('username')?.hasError('required') && form.get('username')?.touched) {
              <small class="p-error">Username is required</small>
            }
          </div>
          <div class="field full-width">
            <span class="p-float-label">
              <input pInputText id="password" type="password" formControlName="password" autocomplete="current-password" class="full-width" />
              <label for="password">Password</label>
            </span>
            @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
              <small class="p-error">Password is required</small>
            }
          </div>
          <button pButton type="submit" [disabled]="form.invalid || loading" [label]="loading ? 'Signing in...' : 'Sign In'" class="full-width submit-btn"></button>
        </form>
      </p-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 1.5rem;
      }
      .login-card {
        max-width: 420px;
        width: 100%;
      }
      .login-card ::ng-deep .p-card {
        border-radius: 20px;
        border: 1px solid var(--app-accent);
        box-shadow: var(--app-card-shadow-hover), 0 0 0 1px var(--app-accent-bg);
        overflow: hidden;
      }
      .login-card ::ng-deep .p-card:hover {
        box-shadow: 0 20px 40px -10px var(--app-accent-bg);
      }
      .card-header {
        text-align: center;
        padding: 1.5rem 1.5rem 0.5rem;
      }
      .logo-area {
        width: 56px;
        height: 56px;
        margin: 0 auto 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--app-accent-bg);
        border: 1px solid var(--app-accent);
        border-radius: 14px;
      }
      .logo-area i {
        font-size: 1.75rem;
        color: var(--app-accent-text);
      }
      .card-header h2 {
        margin: 0 0 0.35rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--app-text);
      }
      .card-header .subtitle {
        margin: 0;
        font-size: 0.95rem;
        color: var(--app-text-secondary);
      }
      .card-header .tagline {
        margin: 0.5rem 0 0 0;
        font-size: 0.85rem;
        color: var(--app-text-secondary);
        opacity: 0.9;
      }
      .login-form {
        padding: 1rem 1.5rem 1.5rem;
      }
      .field {
        margin-bottom: 1.25rem;
      }
      .field .p-float-label input {
        padding: 0.75rem 1rem;
      }
      .full-width {
        width: 100%;
        display: block;
      }
      .submit-btn {
        margin-top: 0.5rem;
        padding: 0.75rem 1rem;
      }
      @media (max-width: 480px) {
        .login-container {
          padding: 1rem;
          align-items: flex-start;
          padding-top: 2rem;
        }
        .login-card ::ng-deep .p-card {
          border-radius: 16px;
        }
        .card-header {
          padding: 1rem 1rem 0.5rem;
        }
        .card-header h2 {
          font-size: 1.25rem;
        }
        .login-form {
          padding: 0.75rem 1rem 1rem;
        }
      }
    `,
  ],
})
export class LoginComponent {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth
      .login(this.form.value.username!, this.form.value.password!)
      .subscribe({
        next: () => {
          this.router.navigate(['/board']);
        },
        error: () => {
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
