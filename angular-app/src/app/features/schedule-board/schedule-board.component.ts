import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
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

const DAYS: Day[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
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
const VIEW_MODE_KEY = 'schedule-board-view-mode';
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
    SelectButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    FloatLabelModule,
    RippleModule,
    TooltipModule,
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
        <p-selectButton
          [options]="viewOptions"
          [(ngModel)]="viewMode"
          (onChange)="onViewModeChange()"
          optionLabel="label"
          optionValue="value"
        ></p-selectButton>
        <button
          pButton
          (click)="resetWeek()"
          [disabled]="resetting"
          [label]="resetting ? 'Resetting...' : 'Weekly Reset'"
        ></button>
      </div>
    </div>

    @if (viewMode === 'all') {
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
    }

    <section class="task-list-section">
      @if (filteredTasks.length === 0) {
        <div class="empty-state">
          <i class="pi pi-inbox empty-state-icon"></i>
          <p>No tasks yet. Click "Add Task" to create one.</p>
        </div>
      } @else {
        <div class="task-list">
          @for (task of filteredTasks; track task.id) {
            <div class="task-card">
              <div class="task-card-header">
                <p-tag
                  [value]="task.aspect"
                  [ngClass]="'aspect-' + task.aspect"
                ></p-tag>
                <span class="task-day-badge">{{ task.day }}</span>
                <div class="task-card-actions">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    pRipple
                    (click)="openEditDialog(task)"
                    class="p-button-text p-button-rounded p-button-sm"
                    pTooltip="Edit"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    pRipple
                    (click)="confirmDelete(task)"
                    class="p-button-text p-button-danger p-button-rounded p-button-sm"
                    pTooltip="Delete"
                  ></button>
                </div>
              </div>
              <p class="task-description">{{ task.description }}</p>
              <div class="task-meta">
                <span class="task-hours"
                  >{{ task.studiedHours }}/{{ task.plannedHours }}h</span
                >
                <p-dropdown
                  [options]="dayOptions"
                  [(ngModel)]="task.day"
                  (onChange)="onDayChange(task)"
                  optionLabel="label"
                  optionValue="value"
                  styleClass="p-inputtext-sm"
                ></p-dropdown>
              </div>
              <p-progressBar
                [value]="getProgressPercent(task)"
                [showValue]="false"
                styleClass="task-progress"
              ></p-progressBar>
              <div class="log-form">
                <p-inputNumber
                  [(ngModel)]="logHours[task.id]"
                  [minFractionDigits]="2"
                  [maxFractionDigits]="2"
                  [min]="0"
                  [step]="0.25"
                  placeholder="Log hours"
                  styleClass="log-input"
                ></p-inputNumber>
                <button
                  pButton
                  icon="pi pi-plus"
                  (click)="logProgress(task)"
                  [disabled]="!logHours[task.id] || logging[task.id]"
                  class="p-button-rounded p-button-sm"
                  pTooltip="Log progress"
                ></button>
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
      (onHide)="addForm.reset()"
    >
      <form [formGroup]="addForm" (ngSubmit)="submitAdd()">
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
          ></p-dropdown>
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
          ></p-dropdown>
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
      (onHide)="editingTask = null"
    >
      @if (editingTask) {
        <form [formGroup]="editForm" (ngSubmit)="submitEdit()">
          <div class="field">
            <label for="edit-aspect">Aspect</label>
            <p-dropdown
              id="edit-aspect"
              formControlName="aspect"
              [options]="aspectOptions"
              optionLabel="label"
              optionValue="value"
              [style]="{ width: '100%' }"
            ></p-dropdown>
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
          <div class="field">
            <label for="edit-day">Day</label>
            <p-dropdown
              id="edit-day"
              formControlName="day"
              [options]="dayOptions"
              optionLabel="label"
              optionValue="value"
              [style]="{ width: '100%' }"
            ></p-dropdown>
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
        background: var(--app-accent);
        border-color: var(--app-accent);
        color: white;
      }
      .task-list-section {
        min-height: 200px;
      }
      .task-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .task-card {
        background: var(--app-surface);
        border-radius: var(--app-card-radius);
        border: var(--app-card-border);
        padding: 1.25rem 1.5rem;
        box-shadow: var(--app-card-shadow);
        transition: box-shadow 0.25s ease;
      }
      .task-card:hover {
        box-shadow: var(--app-card-shadow-hover);
      }
      .task-card-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        flex-wrap: wrap;
      }
      .task-day-badge {
        font-size: 0.75rem;
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
        background: var(--app-column-bg);
        color: var(--app-text-secondary);
        font-weight: 500;
      }
      .task-card-actions {
        margin-left: auto;
        display: flex;
        gap: 0.25rem;
      }
      .task-description {
        font-size: 1rem;
        font-weight: 500;
        margin: 0 0 0.75rem 0;
        color: var(--app-text);
        line-height: 1.4;
      }
      .task-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.75rem;
        flex-wrap: wrap;
      }
      .task-meta .task-hours {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--app-text);
      }
      .task-progress {
        margin: 0 0 0.75rem 0;
      }
      .task-progress ::ng-deep .p-progressbar {
        height: 8px;
        border-radius: 6px;
        background: var(--app-column-bg) !important;
        overflow: hidden;
      }
      .task-progress ::ng-deep .p-progressbar .p-progressbar-value {
        border-radius: 6px;
        background: var(--app-accent) !important;
      }
      .log-form {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
      .log-form p-inputnumber {
        flex: 1;
        max-width: 130px;
      }
      .log-form ::ng-deep .p-inputnumber {
        width: 100%;
      }
      .log-form ::ng-deep .p-inputnumber-input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
        background: var(--app-surface) !important;
        border: 1px solid var(--app-border) !important;
        color: var(--app-text) !important;
        border-radius: 8px;
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
    `,
  ],
})
export class ScheduleBoardComponent implements OnInit {
  readonly DAYS = DAYS;
  private taskService = inject(TaskService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

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

  viewMode: 'all' | 'today' = 'all';
  viewOptions = [
    { label: 'All days', value: 'all' },
    { label: 'Today only', value: 'today' },
  ];
  selectedDay: Day | 'All' = 'All';
  dayTabOptions = [
    { label: 'All', value: 'All' as const },
    ...DAYS.map((d) => ({ label: d.slice(0, 3), value: d })),
  ];
  dayOptions = DAYS.map((d) => ({ label: d, value: d }));
  aspectOptions = ASPECTS.map((a) => ({ label: a, value: a }));

  get filteredTasks(): Task[] {
    if (this.viewMode === 'today') {
      return this.tasks.filter((t) => t.day === getTodayDay());
    }
    if (this.selectedDay === 'All') {
      return this.tasks;
    }
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
    const storedView = localStorage.getItem(VIEW_MODE_KEY) as
      | 'all'
      | 'today'
      | null;
    if (storedView === 'all' || storedView === 'today')
      this.viewMode = storedView;
    const storedDay = localStorage.getItem(SELECTED_DAY_KEY);
    if (storedDay === 'All' || DAYS.includes(storedDay as Day))
      this.selectedDay = storedDay as Day | 'All';
    this.taskService.loadTasks().subscribe();
    this.taskService.tasks.subscribe((t) => {
      this.tasks = t;
      this.rebuildTasksByDay(t);
    });
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

  onViewModeChange() {
    localStorage.setItem(VIEW_MODE_KEY, this.viewMode);
  }

  saveSelectedDay() {
    localStorage.setItem(SELECTED_DAY_KEY, this.selectedDay);
  }

  onDayChange(task: Task) {
    this.taskService.updateTask(task.id, { day: task.day }).subscribe({
      error: () => this.taskService.loadTasks().subscribe(),
    });
  }

  openAddDialog() {
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
