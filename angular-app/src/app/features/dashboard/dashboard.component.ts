import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TaskService } from '../../shared/services/task.service';
import { Task, Aspect } from '../../shared/models/task.model';

Chart.register(...registerables);

const ASPECT_PLANNED: Record<Aspect, number> = {
  English: 6,
  FE: 7,
  BE: 7,
  AI: 5,
  Soft_skills: 5,
  Reading: 4,
};

const ASPECTS: Aspect[] = ['English', 'FE', 'BE', 'AI', 'Soft_skills', 'Reading'];

const ASPECT_COLORS: Record<Aspect, string> = {
  English: '#1976d2',
  FE: '#7b1fa2',
  BE: '#388e3c',
  AI: '#f57c00',
  Soft_skills: '#c2185b',
  Reading: '#0097a7',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressBarModule],
  template: `
    <div class="dashboard">
      <h2>Weekly Summary</h2>

      <div class="stats-strip">
        <div class="stat-item">
          <span class="stat-value">{{ totalStudiedHours | number:'1.1-1' }}h</span>
          <span class="stat-label">Studied this week</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ tasksCompleted }}</span>
          <span class="stat-label">Tasks completed</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalPlannedHours | number:'1.0-0' }}h</span>
          <span class="stat-label">Planned total</span>
        </div>
      </div>

      @if (tasks.length === 0) {
        <div class="empty-state">
          <i class="pi pi-chart-line empty-state-icon"></i>
          <p>No tasks yet. Add tasks on the Board to see your progress.</p>
        </div>
      } @else {
        <div class="summary-cards">
          @for (aspect of ASPECTS; track aspect) {
            <p-card class="summary-card" [ngClass]="'aspect-' + aspect">
              <ng-template pTemplate="header">
                <div class="card-header">
                  <h3>{{ aspect }}</h3>
                  <p class="subtitle">{{ getStudied(aspect) }}/{{ ASPECT_PLANNED[aspect] }}h</p>
                </div>
              </ng-template>
              <p-progressBar [value]="getProgress(aspect)" [showValue]="false"></p-progressBar>
            </p-card>
          }
        </div>
        <p-card class="chart-card">
          <ng-template pTemplate="header">
            <h3>Progress by Aspect</h3>
          </ng-template>
          <div class="chart-container">
            <canvas #chartCanvas></canvas>
          </div>
        </p-card>
      }
    </div>
  `,
  styles: [
    `
      .dashboard {
        max-width: 900px;
      }
      .dashboard h2 {
        margin-bottom: 1.5rem;
        font-weight: 600;
        font-size: 1.5rem;
        color: var(--app-text);
      }
      .stats-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        margin-bottom: 2rem;
        padding: 1.5rem 1.75rem;
        background: var(--app-surface);
        border-radius: var(--app-card-radius);
        border: var(--app-card-border);
        box-shadow: var(--app-card-shadow);
      }
      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--app-accent);
      }
      .stat-label {
        font-size: 0.85rem;
        color: var(--app-text-secondary);
      }
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.25rem;
        margin-bottom: 2rem;
      }
      .summary-card {
        border-radius: var(--app-card-radius);
        border: var(--app-card-border);
        box-shadow: var(--app-card-shadow);
        transition: box-shadow 0.25s ease, transform 0.2s ease;
        overflow: hidden;
      }
      .summary-card:hover {
        box-shadow: var(--app-card-shadow-hover);
        transform: translateY(-2px);
      }
      .summary-card ::ng-deep .p-card-header {
        padding: 1.25rem 1.5rem !important;
        border-left: 4px solid transparent;
      }
      .summary-card ::ng-deep .p-card-body {
        padding: 1.25rem 1.5rem !important;
      }
      .summary-card.aspect-English ::ng-deep .p-card-header { border-left-color: #1976d2; }
      .summary-card.aspect-FE ::ng-deep .p-card-header { border-left-color: #7b1fa2; }
      .summary-card.aspect-BE ::ng-deep .p-card-header { border-left-color: #388e3c; }
      .summary-card.aspect-AI ::ng-deep .p-card-header { border-left-color: #f57c00; }
      .summary-card.aspect-Soft_skills ::ng-deep .p-card-header { border-left-color: #c2185b; }
      .summary-card.aspect-Reading ::ng-deep .p-card-header { border-left-color: #0097a7; }
      .summary-card ::ng-deep .p-progressbar {
        height: 10px;
        margin-top: 0.75rem;
        border-radius: 5px;
      }
      .summary-card ::ng-deep .p-progressbar .p-progressbar-value {
        border-radius: 5px;
      }
      .card-header h3, .chart-card h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
      }
      .card-header .subtitle {
        margin: 0;
        font-size: 0.85rem;
        color: var(--app-text-secondary);
      }
      .chart-card ::ng-deep .p-card-header {
        padding: 1.25rem 1.5rem !important;
      }
      .chart-card ::ng-deep .p-card-body {
        padding: 1.25rem 1.5rem !important;
      }
      .chart-card {
        border-radius: var(--app-card-radius);
        border: var(--app-card-border);
        box-shadow: var(--app-card-shadow);
        transition: box-shadow 0.25s ease;
      }
      .chart-card:hover {
        box-shadow: var(--app-card-shadow-hover);
      }
      .chart-container {
        position: relative;
        height: 280px;
      }
      .chart-container canvas {
        max-height: 280px;
      }
      @media (max-width: 768px) {
        .dashboard h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }
        .stats-strip {
          flex-direction: column;
          gap: 1rem;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
        }
        .stat-item {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--app-border);
        }
        .stat-item:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }
        .summary-cards {
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .chart-container {
          height: 220px;
        }
        .chart-container canvas {
          max-height: 220px;
        }
      }
      @media (max-width: 480px) {
        .stats-strip {
          padding: 0.75rem 1rem;
        }
        .stat-value {
          font-size: 1.25rem;
        }
        .chart-container {
          height: 200px;
        }
        .chart-container canvas {
          max-height: 200px;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  readonly ASPECTS = ASPECTS;
  readonly ASPECT_PLANNED = ASPECT_PLANNED;
  private taskService = inject(TaskService);
  tasks: Task[] = [];
  private chart: Chart | null = null;

  get totalStudiedHours(): number {
    return this.tasks.reduce((sum, t) => sum + t.studiedHours, 0);
  }

  get totalPlannedHours(): number {
    return this.tasks.reduce((sum, t) => sum + t.plannedHours, 0);
  }

  get tasksCompleted(): number {
    return this.tasks.filter((t) => t.plannedHours > 0 && t.studiedHours >= t.plannedHours).length;
  }

  ngOnInit() {
    this.taskService.loadTasks().subscribe();
    this.taskService.tasks.subscribe((t) => {
      this.tasks = t;
      this.updateChart();
    });
  }

  ngAfterViewInit() {
    this.updateChart();
  }

  getStudied(aspect: Aspect): number {
    return this.tasks
      .filter((t) => t.aspect === aspect)
      .reduce((sum, t) => sum + t.studiedHours, 0);
  }

  getProgress(aspect: Aspect): number {
    const planned = ASPECT_PLANNED[aspect];
    if (planned <= 0) return 0;
    return (this.getStudied(aspect) / planned) * 100;
  }

  private updateChart() {
    if (!this.chartCanvas?.nativeElement || this.tasks.length === 0) {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      return;
    }
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const studied = ASPECTS.map((a) => this.getStudied(a));
    const textColor = '#94a3b8';
    const gridColor = 'rgba(148, 163, 184, 0.2)';

    const aspectColors = ASPECTS.map((a) => ASPECT_COLORS[a]);

    if (this.chart) this.chart.destroy();
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ASPECTS,
        datasets: [
          {
            label: 'Studied (h)',
            data: studied,
            backgroundColor: aspectColors.map((c) => c + 'cc'),
            borderColor: aspectColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: textColor,
              font: { size: 12 },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: textColor, font: { size: 11 } },
            grid: { color: gridColor },
          },
          y: {
            beginAtZero: true,
            ticks: { color: textColor, font: { size: 11 } },
            grid: { color: gridColor },
          },
        },
      },
    };
    this.chart = new Chart(ctx, config);
  }
}
