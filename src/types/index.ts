export type Priority = 'low' | 'medium' | 'high';
export type Frequency = 'daily' | 'weekly';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  projectId: string;
  completed: boolean;
  order: number;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  frequency: Frequency;
  streak: number;
  completions: string[]; // ISO dates
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  milestones: Milestone[];
  progress: number;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}
