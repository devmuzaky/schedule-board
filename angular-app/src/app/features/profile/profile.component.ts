import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ConfirmationService } from 'primeng/api';
import { TaskService, ProgressLogResponse } from '../../shared/services/task.service';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RippleModule],
  template: `
    <div class="profile">
      <h2>Progress History</h2>
      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header">
            <h3>Activity Log</h3>
            <p class="subtitle">All logged progress entries</p>
            @if (auth.isLoggedIn()) {
            <button pButton (click)="exportCsv()" [disabled]="exporting" [label]="exporting ? 'Exporting...' : 'Export to CSV'" icon="pi pi-download" class="export-btn"></button>
          }
          </div>
        </ng-template>
        @if (logs.length === 0) {
          <div class="empty-state">
            <i class="pi pi-history empty-state-icon"></i>
            <p>No progress logged yet.</p>
          </div>
        } @else {
          <div class="log-list">
            @for (log of logs; track log.id) {
              <div class="log-item">
                <div class="log-main">
                  <span class="log-date">{{ log.date | date:'short' }}</span>
                  <span class="log-aspect">{{ log.task.aspect }}</span>
                  <span class="log-task">{{ log.task.description }}</span>
                  <span class="log-hours">{{ log.loggedHours }}h</span>
                </div>
                <button
                  pButton
                  icon="pi pi-trash"
                  pRipple
                  (click)="confirmDeleteLog(log)"
                  [disabled]="deleting[log.id]"
                  class="p-button-text p-button-danger p-button-rounded p-button-sm"
                ></button>
              </div>
            }
          </div>
        }
      </p-card>
    </div>
  `,
  styles: [
    `
      .profile {
        max-width: 900px;
      }
      .profile h2 {
        margin-bottom: 1.25rem;
        font-weight: 600;
        font-size: 1.5rem;
        color: var(--app-text);
        letter-spacing: -0.02em;
      }
      .profile ::ng-deep .p-card {
        border-radius: var(--app-card-radius);
        border: var(--app-card-border);
        box-shadow: var(--app-card-shadow);
        transition: box-shadow 0.25s ease;
        overflow: hidden;
      }
      .profile ::ng-deep .p-card:hover {
        box-shadow: var(--app-card-shadow-hover);
      }
      .profile ::ng-deep .p-card-header {
        padding: 1.25rem 1.5rem !important;
        background: var(--app-surface-elevated);
        border-bottom: 1px solid var(--app-border);
      }
      .profile ::ng-deep .p-card-body {
        padding: 1.25rem 1.5rem !important;
      }
      .card-header {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }
      .card-header h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--app-text);
      }
      .card-header .subtitle {
        margin: 0;
        font-size: 0.9rem;
        color: var(--app-text-secondary);
        flex-basis: 100%;
      }
      .export-btn {
        margin-top: 0.25rem;
      }
      .log-list {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .log-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.9rem 1.15rem;
        background: var(--app-column-bg);
        border-radius: 10px;
        border: 1px solid var(--app-border);
        transition: border-color 0.2s, background 0.2s;
      }
      .log-item:hover {
        background: var(--app-surface-elevated);
        border-color: rgba(13, 159, 187, 0.2);
      }
      .log-main {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        flex: 1;
        min-width: 0;
      }
      .log-date {
        font-size: 0.82rem;
        color: var(--app-text-secondary);
        flex-shrink: 0;
        font-variant-numeric: tabular-nums;
      }
      .log-aspect {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.55rem;
        border-radius: 6px;
        background: var(--app-accent-bg);
        border: 1px solid var(--app-accent);
        color: var(--app-accent-text);
        flex-shrink: 0;
        letter-spacing: 0.02em;
      }
      .log-task {
        font-weight: 500;
        color: var(--app-text);
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.95rem;
      }
      .log-hours {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--app-accent-text);
        flex-shrink: 0;
      }
      @media (max-width: 768px) {
        .profile {
          width: 100%;
        }
        .profile h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }
        .card-header {
          flex-direction: column;
          align-items: stretch;
          gap: 0.75rem;
        }
        .card-header .subtitle {
          flex-basis: auto;
        }
        .export-btn {
          min-height: 44px;
          width: 100%;
        }
        .log-list {
          gap: 0.6rem;
        }
        .log-item {
          flex-direction: column;
          align-items: stretch;
          gap: 0.5rem;
          padding: 0.85rem 1rem;
          min-height: 56px;
        }
        .log-item .p-button {
          min-width: 44px;
          min-height: 44px;
          align-self: flex-end;
        }
        .log-main {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .log-task {
          overflow: visible;
          text-overflow: clip;
        }
      }
      @media (max-width: 480px) {
        .profile h2 {
          font-size: 1.1rem;
        }
        .log-date, .log-aspect, .log-task, .log-hours {
          font-size: 0.8rem;
        }
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  private taskService = inject(TaskService);
  private confirmationService = inject(ConfirmationService);
  auth = inject(AuthService);
  private router = inject(Router);
  logs: ProgressLogResponse[] = [];
  exporting = false;
  deleting: Record<string, boolean> = {};

  ngOnInit() {
    this.taskService.getProgressLogs().subscribe((logs) => {
      this.logs = logs;
    });
  }

  confirmDeleteLog(log: ProgressLogResponse) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.confirmationService.confirm({
      message: `Remove this log? (${log.loggedHours}h for ${log.task.description})`,
      header: 'Remove Log',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleting[log.id] = true;
        this.taskService.deleteProgressLog(log.id).subscribe({
          next: () => {
            this.logs = this.logs.filter((l) => l.id !== log.id);
          },
          complete: () => {
            this.deleting[log.id] = false;
          },
        });
      },
    });
  }

  exportCsv() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.exporting = true;
    this.taskService.exportCsv().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'progress-export.csv';
        a.click();
        URL.revokeObjectURL(url);
      },
      complete: () => {
        this.exporting = false;
      },
    });
  }
}
