/**
 * Local (browser-only) persistence used when DEMO_MODE is on.
 * Nothing here touches the network.
 */
import type { IntakeForm, Module, Profile } from '@/types/crescented';
import { DEMO_USER_ID } from './demo';

const KEYS = {
  intake: 'crescented-demo-intake',
  modules: 'crescented-demo-modules',
  profile: 'crescented-demo-profile',
  bannerDismissed: 'crescented-demo-banner-dismissed',
} as const;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / disabled — demo simply won't persist
  }
}

export const demoStorage = {
  getIntake: (): IntakeForm | null => read<IntakeForm>(KEYS.intake),

  saveIntake: (form: Partial<IntakeForm>): IntakeForm => {
    const existing = demoStorage.getIntake();
    const next = {
      id: existing?.id ?? 'demo-intake',
      user_id: DEMO_USER_ID,
      created_at: existing?.created_at ?? new Date().toISOString(),
      idea: '',
      goals: '',
      background: '',
      experience_level: 'beginner',
      interests: '',
      constraints: '',
      learning_style: 'mixed',
      commitment_level: 'moderate',
      ...existing,
      ...form,
    } as IntakeForm;
    write(KEYS.intake, next);
    return next;
  },

  getModules: (): Module[] => read<Module[]>(KEYS.modules) ?? [],

  saveModules: (modules: Module[]) => write(KEYS.modules, modules),

  updateModuleProgress: (moduleId: string, progress: Module['progress']) => {
    const modules = demoStorage.getModules().map((m) =>
      m.id === moduleId ? { ...m, progress } : m
    );
    write(KEYS.modules, modules);
    return modules;
  },

  getProfile: (): Partial<Profile> =>
    read<Partial<Profile>>(KEYS.profile) ?? {
      full_name: '',
      experience_level: 'beginner',
      learning_style: 'mixed',
      time_commitment: 'moderate',
    },

  saveProfile: (profile: Partial<Profile>) => write(KEYS.profile, profile),

  isBannerDismissed: (): boolean => localStorage.getItem(KEYS.bannerDismissed) === 'true',
  dismissBanner: () => localStorage.setItem(KEYS.bannerDismissed, 'true'),

  clearAll: () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
