export type Aspect =
  | 'English'
  | 'FE'
  | 'BE'
  | 'AI'
  | 'Soft_skills'
  | 'Reading';

export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface ProgressLog {
  id: string;
  taskId: string;
  loggedHours: number;
  date: string;
}

export interface Task {
  id: string;
  userId: string;
  aspect: Aspect;
  description: string;
  plannedHours: number;
  studiedHours: number;
  day: Day;
  progressLogs?: ProgressLog[];
}
