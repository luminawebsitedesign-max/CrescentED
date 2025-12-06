import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import type { IntakeForm, Module, CourseData } from '@/types/crescented';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Intake state
  intake: IntakeForm | null;
  setIntake: (intake: IntakeForm | null) => void;
  
  // Course state
  course: CourseData | null;
  setCourse: (course: CourseData | null) => void;
  
  // Modules state
  modules: Module[];
  setModules: (modules: Module[]) => void;
  
  // Current module being viewed
  currentModuleId: string | null;
  setCurrentModuleId: (id: string | null) => void;
  
  // Tutor sidebar state (kept for backwards compatibility)
  tutorOpen: boolean;
  setTutorOpen: (open: boolean) => void;
  
  // Master notes
  masterNotes: string;
  setMasterNotes: (notes: string) => void;
  
  // Sidebar collapsed state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Reset all state
  reset: () => void;
}

const initialState = {
  user: null,
  intake: null,
  course: null,
  modules: [],
  currentModuleId: null,
  tutorOpen: false,
  sidebarCollapsed: false,
  masterNotes: '',
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set({ user }),
      setIntake: (intake) => set({ intake }),
      setCourse: (course) => set({ course }),
      setModules: (modules) => set({ modules }),
      setCurrentModuleId: (currentModuleId) => set({ currentModuleId }),
      setTutorOpen: (tutorOpen) => set({ tutorOpen }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setMasterNotes: (masterNotes) => set({ masterNotes }),
      reset: () => set(initialState),
    }),
    {
      name: 'crescented-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        currentModuleId: state.currentModuleId,
      }),
    }
  )
);
