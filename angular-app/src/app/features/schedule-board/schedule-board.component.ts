import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import {
  TaskService,
  CreateTaskPayload,
} from '../../shared/services/task.service';
import { Task, Day, Aspect } from '../../shared/models/task.model';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

const DAYS: Day[] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

const ASPECTS: Aspect[] = [
  'English',
  'FE',
  'BE',
  'AI',
  'Soft_skills',
  'Reading',
];

const DAY_ORDER: Day[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const SELECTED_DAY_KEY = 'schedule-board-selected-day';

function getTodayDay(): Day {
  return DAY_ORDER[new Date().getDay()];
}

@Component({
  selector: 'app-schedule-board',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ProgressBarModule,
    InputNumberModule,
    ButtonModule,
    TagModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    FloatLabelModule,
    RippleModule,
  ],
  template: `
    <div class="board-header">
      <h2>Weekly Schedule</h2>
      <div class="header-actions">
        <button
          pButton
          label="Add Task"
          icon="pi pi-plus"
          (click)="openAddDialog()"
        ></button>
        <button
          pButton
          (click)="resetWeek()"
          [disabled]="resetting"
          [label]="resetting ? 'Resetting...' : 'Weekly Reset'"
        ></button>
      </div>
    </div>

    <div class="day-tabs">
      <button
        *ngFor="let opt of dayTabOptions"
        type="button"
        class="day-tab"
        [class.active]="selectedDay === opt.value"
        (click)="selectedDay = opt.value; saveSelectedDay()"
      >
        {{ opt.label }}
      </button>
    </div>

    <section class="task-list-section">
      @if (filteredTasks.length === 0) {
        <div class="empty-state">
          <i class="pi pi-inbox empty-state-icon"></i>
          @if (auth.isLoggedIn()) {
            <p>No tasks yet. Click "Add Task" to create one.</p>
          } @else {
            <p>Log in to add and manage your tasks.</p>
          }
        </div>
      } @else {
        <div class="task-list">
          @for (task of filteredTasks; track task.id) {
            <div class="task-card">
              <div class="task-card-row task-card-top">
                <div class="task-card-meta">
                  <p-tag
                    [value]="task.aspect"
                    [ngClass]="'aspect-' + task.aspect"
                  ></p-tag>
                  <span class="task-day-badge">{{ task.day }}</span>
                  <span class="task-hours">{{ task.studiedHours }}/{{ task.plannedHours }}h</span>
                  <p-dropdown
                    [options]="dayOptions"
                    [ngModel]="task.day"
                    (ngModelChange)="confirmDayChange(task, $event)"
                    optionLabel="label"
                    optionValue="value"
                    styleClass="p-inputtext-sm task-day-dropdown"
                    appendTo="body"
                  ></p-dropdown>
                </div>
                <div class="task-card-actions">
                  <button pButton icon="pi pi-pencil" pRipple (click)="openEditDialog(task)" class="p-button-text p-button-rounded p-button-sm"></button>
                  <button pButton icon="pi pi-trash" pRipple (click)="confirmDelete(task)" class="p-button-text p-button-danger p-button-rounded p-button-sm"></button>
                </div>
              </div>
              <div class="task-card-row task-card-bottom">
                <p class="task-description">{{ task.description }}</p>
                <p-progressBar [value]="getProgressPercent(task)" [showValue]="false" styleClass="task-progress"></p-progressBar>
                <div class="log-form">
                  <p-inputNumber
                    [(ngModel)]="logHours[task.id]"
                    [minFractionDigits]="2"
                    [maxFractionDigits]="2"
                    [min]="0"
                    [step]="0.25"
                    placeholder="Log"
                    styleClass="log-input"
                  ></p-inputNumber>
                  <button pButton icon="pi pi-plus" (click)="logProgress(task)" [disabled]="!logHours[task.id] || logging[task.id]" class="p-button-rounded p-button-sm"></button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </section>

    <p-dialog
      header="Add Task"
      [(visible)]="addDialogVisible"
      [modal]="true"
      [style]="{ width: '400px' }"
      styleClass="add-edit-dialog"
      (onHide)="addForm.reset()"
    >
      <form [formGroup]="addForm" (ngSubmit)="submitAdd()" class="add-edit-form">
        <div class="form-row form-row-2">
          <div class="field">
            <label for="add-aspect">Aspect</label>
            <p-dropdown
              id="add-aspect"
              formControlName="aspect"
              [options]="aspectOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select aspect"
              [style]="{ width: '100%' }"
              appendTo="body"
            ></p-dropdown>
          </div>
          <div class="field">
            <label for="add-day">Day</label>
            <p-dropdown
              id="add-day"
              formControlName="day"
              [options]="dayOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select day"
              [style]="{ width: '100%' }"
              appendTo="body"
            ></p-dropdown>
          </div>
        </div>
        <div class="field">
          <label for="add-description">Description</label>
          <input
            pInputText
            id="add-description"
            formControlName="description"
            placeholder="Task description"
            class="full-width"
          />
        </div>
        <div class="field">
          <label for="add-planned">Planned hours</label>
          <p-inputNumber
            id="add-planned"
            formControlName="plannedHours"
            [min]="0"
            [step]="0.25"
            [minFractionDigits]="2"
            placeholder="0.00"
            [style]="{ width: '100%' }"
          ></p-inputNumber>
        </div>
        <div class="dialog-actions">
          <button
            pButton
            type="button"
            label="Cancel"
            (click)="addDialogVisible = false"
            class="p-button-text"
          ></button>
          <button
            pButton
            type="submit"
            label="Add"
            [disabled]="addForm.invalid || adding"
          ></button>
        </div>
      </form>
    </p-dialog>

    <p-dialog
      header="Edit Task"
      [(visible)]="editDialogVisible"
      [modal]="true"
      [style]="{ width: '400px' }"
      styleClass="add-edit-dialog"
      (onHide)="editingTask = null"
    >
      @if (editingTask) {
        <form [formGroup]="editForm" (ngSubmit)="submitEdit()" class="add-edit-form">
          <div class="form-row form-row-2">
            <div class="field">
              <label for="edit-aspect">Aspect</label>
              <p-dropdown
                id="edit-aspect"
                formControlName="aspect"
                [options]="aspectOptions"
                optionLabel="label"
                optionValue="value"
                [style]="{ width: '100%' }"
                appendTo="body"
              ></p-dropdown>
            </div>
            <div class="field">
              <label for="edit-day">Day</label>
              <p-dropdown
                id="edit-day"
                formControlName="day"
                [options]="dayOptions"
                optionLabel="label"
                optionValue="value"
                [style]="{ width: '100%' }"
                appendTo="body"
              ></p-dropdown>
            </div>
          </div>
          <div class="field">
            <label for="edit-description">Description</label>
            <input
              pInputText
              id="edit-description"
              formControlName="description"
              class="full-width"
            />
          </div>
          <div class="field">
            <label for="edit-planned">Planned hours</label>
            <p-inputNumber
              id="edit-planned"
              formControlName="plannedHours"
              [min]="0"
              [step]="0.25"
              [minFractionDigits]="2"
              [style]="{ width: '100%' }"
            ></p-inputNumber>
          </div>
          <div class="dialog-actions">
            <button
              pButton
              type="button"
              label="Cancel"
              (click)="editDialogVisible = false"
              class="p-button-text"
            ></button>
            <button
              pButton
              type="submit"
              label="Save"
              [disabled]="editForm.invalid || saving"
            ></button>
          </div>
        </form>
      }
    </p-dialog>
  `,
  styles: [
    `
      .board-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .board-header h2 {
        margin: 0;
        font-weight: 600;
        font-size: 1.5rem;
        color: var(--app-text);
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .day-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }
      .day-tab {
        padding: 0.5rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--app-border);
        background: var(--app-surface);
        color: var(--app-text);
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition:
          background 0.2s,
          border-color 0.2s,
          color 0.2s;
      }
      .day-tab:hover {
        background: var(--app-column-bg);
      }
      .day-tab.active {
        background: var(--app-accent-bg);
        border-color: var(--app-accent);
        color: var(--app-accent-text);
      }
      .task-list-section {
        min-height: 200px;
      }
      .task-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .task-card {
        background: var(--app-surface);
        border-radius: var(--app-card-radius);
        border: var(--app-card-border);
        padding: 0.5rem 0.85rem;
        box-shadow: var(--app-card-shadow);
        transition: box-shadow 0.25s ease;
      }
      .task-card:hover {
        box-shadow: var(--app-card-shadow-hover);
      }
      .task-card-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 0;
      }
      .task-card-top {
        margin-bottom: 0.25rem;
      }
      .task-card-meta {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        flex: 1;
        min-width: 0;
      }
      .task-day-badge {
        font-size: 0.7rem;
        padding: 0.2rem 0.45rem;
        border-radius: 5px;
        background: var(--app-column-bg);
        color: var(--app-text-secondary);
        font-weight: 500;
      }
      .task-hours {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--app-text);
      }
      .task-day-dropdown {
        min-width: 100px;
      }
      .task-day-dropdown ::ng-deep .p-dropdown {
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
      }
      .task-card-actions {
        display: flex;
        gap: 0.15rem;
        flex-shrink: 0;
      }
      .task-card-bottom {
        gap: 0.6rem;
      }
      .task-card-bottom .task-description {
        flex: 1;
        min-width: 0;
        font-size: 0.9rem;
        font-weight: 500;
        margin: 0;
        color: var(--app-text);
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .task-progress {
        flex: 1 1 120px;
        margin: 0;
        min-width: 80px;
      }
      .task-progress ::ng-deep .p-progressbar {
        height: 6px;
        border-radius: 4px;
        background: var(--app-column-bg) !important;
        overflow: hidden;
      }
      .task-progress ::ng-deep .p-progressbar .p-progressbar-value {
        border-radius: 4px;
        background: var(--app-accent) !important;
      }
      .log-form {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        flex-shrink: 0;
      }
      .log-form p-inputnumber {
        width: 70px;
      }
      .log-form ::ng-deep .p-inputnumber {
        width: 100%;
      }
      .log-form ::ng-deep .p-inputnumber-input {
        width: 100%;
        padding: 0.3rem 0.5rem;
        font-size: 0.85rem;
        background: var(--app-surface) !important;
        border: 1px solid var(--app-border) !important;
        color: var(--app-text) !important;
        border-radius: 6px;
      }
      .log-form ::ng-deep .p-inputnumber-input::placeholder {
        color: var(--app-text-secondary);
      }
      .log-form ::ng-deep .p-inputnumber-button {
        background: var(--app-column-bg) !important;
        border-color: var(--app-border) !important;
        color: var(--app-text) !important;
      }
      .field {
        margin-bottom: 1rem;
      }
      .field label {
        display: block;
        margin-bottom: 0.35rem;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--app-text);
      }
      .full-width {
        width: 100%;
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 1.25rem;
      }
      @media (max-width: 768px) {
        .board-header {
          flex-direction: column;
          align-items: stretch;
          margin-bottom: 1rem;
        }
        .board-header h2 {
          font-size: 1.25rem;
        }
        .header-actions {
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .header-actions > * {
          flex: 1 1 auto;
          min-width: 100px;
        }
        .day-tabs {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 0.25rem;
          margin-bottom: 1rem;
        }
        .day-tab {
          flex-shrink: 0;
          padding: 0.4rem 0.75rem;
          font-size: 0.85rem;
        }
        .task-card {
          padding: 0.5rem 0.75rem;
        }
        .task-card-top {
          flex-wrap: wrap;
        }
        .task-card-meta {
          flex-wrap: wrap;
        }
        .task-card-bottom {
          flex-wrap: wrap;
        }
        .task-card-bottom .task-description {
          flex-basis: 100%;
          order: -1;
          white-space: normal;
          margin-bottom: 0.25rem;
        }
        .task-progress {
          flex: 1 1 100%;
          min-width: 100%;
        }
        .log-form {
          flex: 1;
          min-width: 0;
        }
      }
      @media (max-width: 480px) {
        .board-header h2 {
          font-size: 1.1rem;
        }
        .header-actions {
          flex-direction: column;
        }
        .task-card-meta .p-tag,
        .task-card-meta .task-day-badge,
        .task-card-meta .task-hours {
          font-size: 0.75rem;
        }
        .task-day-dropdown {
          min-width: 85px;
        }
      }
    `,
  ],
})
export class ScheduleBoardComponent implements OnInit {
  readonly DAYS = DAYS;
  private taskService = inject(TaskService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  private router = inject(Router);

  tasksByDay: Record<Day, Task[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };
  tasks: Task[] = [];
  logHours: Record<string, number> = {};
  logging: Record<string, boolean> = {};
  resetting = false;
  adding = false;
  saving = false;

  selectedDay: Day = getTodayDay();
  dayTabOptions = DAYS.map((d) => ({ label: d.slice(0, 3), value: d }));
  dayOptions = DAYS.map((d) => ({ label: d, value: d }));
  aspectOptions = ASPECTS.map((a) => ({ label: a, value: a }));

  get filteredTasks(): Task[] {
    return this.tasks.filter((t) => t.day === this.selectedDay);
  }

  addDialogVisible = false;
  editDialogVisible = false;
  editingTask: Task | null = null;

  addForm = this.fb.group({
    aspect: ['English' as Aspect, Validators.required],
    description: ['', Validators.required],
    plannedHours: [0, [Validators.required, Validators.min(0)]],
    day: ['Monday' as Day, Validators.required],
  });

  editForm = this.fb.group({
    aspect: ['English' as Aspect, Validators.required],
    description: ['', Validators.required],
    plannedHours: [0, [Validators.required, Validators.min(0)]],
    day: ['Monday' as Day, Validators.required],
  });

  ngOnInit() {
    const storedDay = localStorage.getItem(SELECTED_DAY_KEY);
    if (storedDay && DAYS.includes(storedDay as Day))
      this.selectedDay = storedDay as Day;
    if (this.auth.isLoggedIn()) {
      this.taskService.loadTasks().subscribe();
    }
    this.taskService.tasks.subscribe((t) => {
      this.tasks = t;
      this.rebuildTasksByDay(t);
    });
  }

  private requireLogin(): boolean {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  private rebuildTasksByDay(tasks: Task[]) {
    for (const day of DAYS) {
      this.tasksByDay[day] = tasks.filter((t) => t.day === day);
    }
  }

  getTasksForDay(day: Day): Task[] {
    return this.tasksByDay[day] || [];
  }

  getProgressPercent(task: Task): number {
    if (task.plannedHours <= 0) return 0;
    return (task.studiedHours / task.plannedHours) * 100;
  }

  saveSelectedDay() {
    localStorage.setItem(SELECTED_DAY_KEY, this.selectedDay);
  }

  confirmDayChange(task: Task, newDay: Day) {
    if (!this.requireLogin()) return;
    const oldDay = task.day;
    if (newDay === oldDay) return;
    this.confirmationService.confirm({
      message: `Move "${task.description}" from ${oldDay} to ${newDay}?`,
      header: 'Move Task',
      icon: 'pi pi-calendar',
      accept: () => {
        this.taskService.updateTask(task.id, { day: newDay }).subscribe({
          next: () => {
            task.day = newDay;
          },
          error: () => this.taskService.loadTasks().subscribe(),
        });
      },
      reject: () => {
        // task.day stays oldDay, dropdown reverts via [ngModel]
      },
    });
  }

  openAddDialog() {
    if (!this.requireLogin()) return;
    this.addForm.reset({
      aspect: 'English',
      description: '',
      plannedHours: 0,
      day: 'Monday',
    });
    this.addDialogVisible = true;
  }

  submitAdd() {
    if (this.addForm.invalid) return;
    this.adding = true;
    const v = this.addForm.value;
    const payload: CreateTaskPayload = {
      aspect: v.aspect!,
      description: v.description!,
      plannedHours: v.plannedHours ?? 0,
      day: v.day!,
    };
    this.taskService.createTask(payload).subscribe({
      next: () => {
        this.addDialogVisible = false;
      },
      complete: () => {
        this.adding = false;
      },
    });
  }

  openEditDialog(task: Task) {
    if (!this.requireLogin()) return;
    this.editingTask = task;
    this.editForm.patchValue({
      aspect: task.aspect,
      description: task.description,
      plannedHours: task.plannedHours,
      day: task.day,
    });
    this.editDialogVisible = true;
  }

  submitEdit() {
    if (!this.editingTask || this.editForm.invalid) return;
    this.saving = true;
    const v = this.editForm.value;
    this.taskService
      .updateTask(this.editingTask.id, {
        aspect: v.aspect!,
        description: v.description!,
        plannedHours: v.plannedHours ?? 0,
        day: v.day!,
      })
      .subscribe({
        next: () => {
          this.editDialogVisible = false;
          this.editingTask = null;
        },
        complete: () => {
          this.saving = false;
        },
      });
  }

  confirmDelete(task: Task) {
    if (!this.requireLogin()) return;
    this.confirmationService.confirm({
      message: `Delete "${task.description}"?`,
      header: 'Delete Task',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.taskService.deleteTask(task.id).subscribe();
      },
    });
  }

  logProgress(task: Task) {
    if (!this.requireLogin()) return;
    const hours = this.logHours[task.id];
    if (!hours || hours <= 0) return;
    this.logging[task.id] = true;
    this.taskService.logProgress(task.id, hours).subscribe({
      next: () => {
        this.logHours[task.id] = 0;
      },
      complete: () => {
        this.logging[task.id] = false;
      },
    });
  }

  resetWeek() {
    if (!this.requireLogin()) return;
    this.resetting = true;
    this.taskService.weeklyReset().subscribe({
      next: () => {},
      error: () => {},
      complete: () => {
        this.resetting = false;
      },
    });
  }
}
