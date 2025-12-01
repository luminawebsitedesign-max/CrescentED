import { Task, Habit, Goal, Project } from '@/types';

const STORAGE_KEYS = {
  TASKS: 'nexus_tasks',
  HABITS: 'nexus_habits',
  GOALS: 'nexus_goals',
  PROJECTS: 'nexus_projects',
} as const;

export const storage = {
  // Tasks
  getTasks: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },
  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  // Habits
  getHabits: (): Habit[] => {
    const data = localStorage.getItem(STORAGE_KEYS.HABITS);
    return data ? JSON.parse(data) : [];
  },
  saveHabits: (habits: Habit[]) => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  // Goals
  getGoals: (): Goal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  },
  saveGoals: (goals: Goal[]) => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  // Projects
  getProjects: (): Project[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  },
  saveProjects: (projects: Project[]) => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  // Export all data
  exportData: () => {
    return {
      tasks: storage.getTasks(),
      habits: storage.getHabits(),
      goals: storage.getGoals(),
      projects: storage.getProjects(),
      exportedAt: new Date().toISOString(),
    };
  },

  // Import data
  importData: (data: any) => {
    if (data.tasks) storage.saveTasks(data.tasks);
    if (data.habits) storage.saveHabits(data.habits);
    if (data.goals) storage.saveGoals(data.goals);
    if (data.projects) storage.saveProjects(data.projects);
  },
};
