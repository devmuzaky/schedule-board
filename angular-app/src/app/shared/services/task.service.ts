import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, Aspect, Day } from '../models/task.model';

export interface CreateTaskPayload {
  aspect: Aspect;
  description: string;
  plannedHours: number;
  day: Day;
}

export interface UpdateTaskPayload {
  day?: Day;
  studiedHours?: number;
  description?: string;
  aspect?: Aspect;
  plannedHours?: number;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiUrl = environment.apiUrl;
  private tasks$ = new BehaviorSubject<Task[]>([]);

  constructor(private http: HttpClient) {}

  get tasks() {
    return this.tasks$.asObservable();
  }

  loadTasks() {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`).pipe(
      tap((tasks) => this.tasks$.next(tasks))
    );
  }

  createTask(payload: CreateTaskPayload) {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, payload).pipe(
      tap(() => this.loadTasks().subscribe())
    );
  }

  updateTask(id: string, updates: UpdateTaskPayload) {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${id}`, updates).pipe(
      tap(() => this.loadTasks().subscribe())
    );
  }

  deleteTask(id: string) {
    return this.http.delete(`${this.apiUrl}/tasks/${id}`).pipe(
      tap(() => this.loadTasks().subscribe())
    );
  }

  logProgress(taskId: string, loggedHours: number) {
    return this.http.post<Task>(`${this.apiUrl}/progress/${taskId}`, { loggedHours }).pipe(
      tap(() => this.loadTasks().subscribe())
    );
  }

  weeklyReset() {
    return this.http.post<Task[]>(`${this.apiUrl}/weekly-reset`, {}).pipe(
      tap((tasks) => this.tasks$.next(tasks))
    );
  }

  exportCsv() {
    return this.http.get(`${this.apiUrl}/progress/export`, {
      responseType: 'blob',
    });
  }

  getProgressLogs() {
    return this.http.get<ProgressLogResponse[]>(`${this.apiUrl}/progress/logs`);
  }

  deleteProgressLog(logId: string) {
    return this.http.delete(`${this.apiUrl}/progress/log/${logId}`).pipe(
      tap(() => this.loadTasks().subscribe())
    );
  }
}

export interface ProgressLogResponse {
  id: string;
  taskId: string;
  loggedHours: number;
  date: string;
  task: { aspect: string; description: string };
}
