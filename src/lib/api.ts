/**
 * Single data-access layer for CrescentEd.
 *
 * When DEMO_MODE is ON  -> every function below is served from local browser
 *                          storage / bundled sample content. No Supabase call,
 *                          no AI call, no network request at all.
 * When DEMO_MODE is OFF -> the original Supabase + edge-function path runs,
 *                          unchanged.
 */
import { supabase } from '@/integrations/supabase/client';
import { DEMO_MODE, DEMO_USER_ID, DEMO_USER_EMAIL } from './demo';
import { demoStorage } from './demoStorage';
import { buildSampleModules, SAMPLE_TUTOR_ANSWER, SAMPLE_MODULE_COUNT } from '@/data/sampleCourse';
import type { IntakeForm, Module, PDFExport, Profile } from '@/types/crescented';

export interface AppSession {
  user: { id: string; email?: string };
}

const demoSession: AppSession = {
  user: { id: DEMO_USER_ID, email: DEMO_USER_EMAIL },
};

/* ---------------------------------------------------------------- auth ---- */

export async function getSession(): Promise<AppSession | null> {
  if (DEMO_MODE) return demoSession;
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { user: { id: session.user.id, email: session.user.email ?? undefined } } : null;
}

export async function signOut(): Promise<void> {
  if (DEMO_MODE) return;
  await supabase.auth.signOut();
}

/* -------------------------------------------------------------- intake ---- */

export async function getIntake(userId: string): Promise<IntakeForm | null> {
  if (DEMO_MODE) return demoStorage.getIntake();
  const { data } = await supabase
    .from('intake_forms')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as unknown as IntakeForm) ?? null;
}

export async function createIntake(userId: string, form: Record<string, string>): Promise<void> {
  if (DEMO_MODE) {
    demoStorage.saveIntake(form as unknown as Partial<IntakeForm>);
    return;
  }
  const { error } = await supabase.from('intake_forms').insert({ user_id: userId, ...form } as never);
  if (error) throw error;
}

export async function updateIntake(intakeId: string, form: Record<string, string>): Promise<void> {
  if (DEMO_MODE) {
    demoStorage.saveIntake(form as unknown as Partial<IntakeForm>);
    return;
  }
  const { error } = await supabase.from('intake_forms').update(form as never).eq('id', intakeId);
  if (error) throw error;
}

/* ------------------------------------------------------------- modules ---- */

export async function getModules(userId: string): Promise<Module[]> {
  if (DEMO_MODE) return demoStorage.getModules();
  const { data } = await supabase
    .from('modules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return (data as unknown as Module[]) ?? [];
}

export async function getModule(moduleId: string, userId: string): Promise<Module | null> {
  if (DEMO_MODE) {
    return demoStorage.getModules().find((m) => m.id === moduleId) ?? null;
  }
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('id', moduleId)
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return data as unknown as Module;
}

export async function updateModuleProgress(
  moduleId: string,
  progress: Module['progress']
): Promise<boolean> {
  if (DEMO_MODE) {
    demoStorage.updateModuleProgress(moduleId, progress);
    return true;
  }
  const { error } = await supabase
    .from('modules')
    .update({ progress: progress as never })
    .eq('id', moduleId);
  return !error;
}

export async function deleteModules(userId: string): Promise<void> {
  if (DEMO_MODE) {
    demoStorage.saveModules([]);
    return;
  }
  await supabase.from('modules').delete().eq('user_id', userId);
}

/* ------------------------------------------------------------------ AI ---- */

export interface GenerateCourseResult {
  modulesCount: number;
  modules: Module[];
  sample: boolean;
}

export async function generateCourse(
  intake: unknown,
  userId: string
): Promise<GenerateCourseResult> {
  if (DEMO_MODE) {
    const modules = buildSampleModules(userId);
    demoStorage.saveModules(modules);
    return { modulesCount: SAMPLE_MODULE_COUNT, modules, sample: true };
  }

  const response = await supabase.functions.invoke('crescented-ai', {
    body: { type: 'generate_course', intake, userId },
  });
  if (response.error) throw new Error(response.error.message || 'Failed to generate course');
  if (response.data?.error) throw new Error(response.data.error);

  const modules = await getModules(userId);
  return {
    modulesCount: response.data?.modulesCount ?? modules.length,
    modules,
    sample: false,
  };
}

export interface TutorRequest {
  message: string;
  context?: Record<string, unknown>;
  history?: { role: string; content: string }[];
  userId?: string;
}

export async function askTutor(req: TutorRequest): Promise<{ response: string; sample: boolean }> {
  if (DEMO_MODE) {
    // Small delay so the typing indicator reads naturally. No network call.
    await new Promise((r) => setTimeout(r, 450));
    return { response: SAMPLE_TUTOR_ANSWER, sample: true };
  }

  const response = await supabase.functions.invoke('crescented-ai', {
    body: {
      type: 'tutor',
      message: req.message,
      context: req.context,
      userId: req.userId,
      history: req.history ?? [],
    },
  });
  if (response.error) throw response.error;
  if (response.data?.error) throw new Error(response.data.error);
  return { response: response.data.response, sample: false };
}

/* ------------------------------------------------------------- profile ---- */

export async function getProfile(userId: string): Promise<Partial<Profile> | null> {
  if (DEMO_MODE) return demoStorage.getProfile();
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return (data as unknown as Partial<Profile>) ?? null;
}

export async function saveProfile(
  userId: string,
  profile: Partial<Profile>
): Promise<void> {
  if (DEMO_MODE) {
    demoStorage.saveProfile(profile);
    return;
  }
  const { error } = await supabase.from('profiles').update(profile as never).eq('id', userId);
  if (error) throw error;
}

/* ---------------------------------------------------------------- PDFs ---- */

export async function listPdfExports(userId: string): Promise<PDFExport[]> {
  if (DEMO_MODE) return [];
  const { data } = await supabase
    .from('pdf_exports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data as unknown as PDFExport[]) ?? [];
}

export async function downloadPdfFile(filePath: string): Promise<Blob> {
  if (DEMO_MODE) throw new Error('Stored PDFs are unavailable in demo mode');
  const { data, error } = await supabase.storage.from('pdfs').download(filePath);
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------- reset data ---- */

export async function deleteCourseData(userId: string): Promise<void> {
  if (DEMO_MODE) {
    demoStorage.saveModules([]);
    return;
  }
  await supabase.from('modules').delete().eq('user_id', userId);
  await supabase.from('pdf_exports').delete().eq('user_id', userId);
}

export async function deleteAllUserData(userId: string): Promise<void> {
  if (DEMO_MODE) {
    demoStorage.clearAll();
    return;
  }
  await supabase.from('modules').delete().eq('user_id', userId);
  await supabase.from('pdf_exports').delete().eq('user_id', userId);
  await supabase.from('intake_forms').delete().eq('user_id', userId);
  await supabase.from('ai_logs').delete().eq('user_id', userId);
  await supabase.from('courses').delete().eq('user_id', userId);
}
