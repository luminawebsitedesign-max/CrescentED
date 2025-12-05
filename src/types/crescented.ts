// CrescentEd Type Definitions

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface IntakeForm {
  id: string;
  user_id: string;
  idea: string;
  goals: string;
  background: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  interests: string;
  constraints: string;
  learning_style: 'visual' | 'reading' | 'hands-on' | 'mixed';
  commitment_level: 'casual' | 'moderate' | 'intensive';
  created_at: string;
}

export interface PlugAndPlay {
  title: string;
  type: 'worksheet' | 'template' | 'checklist' | 'decision_tree' | 'script' | 'exercise' | 'calculator' | 'reflection';
  content: string;
  completed?: boolean;
}

export interface ModuleSection {
  title: string;
  content: string;
  plug_and_plays: PlugAndPlay[];
  completed?: boolean;
}

export interface ModuleProgress {
  sectionsCompleted: string[];
  plugAndPlayCompleted: string[];
}

export interface Module {
  id: string;
  user_id: string;
  title: string;
  domain: ModuleDomain;
  description: string;
  content: {
    sections: ModuleSection[];
    action_steps: string[];
  };
  summary: string;
  progress: ModuleProgress;
  created_at: string;
}

export type ModuleDomain = 
  | 'business_foundations'
  | 'running_a_business'
  | 'customer_success'
  | 'personal_development'
  | 'daily_life_optimization'
  | 'philosophy_worldview'
  | 'other_topics';

export const DOMAIN_LABELS: Record<ModuleDomain, string> = {
  business_foundations: 'Business Foundations',
  running_a_business: 'Running a Business',
  customer_success: 'Customer Success',
  personal_development: 'Personal Development',
  daily_life_optimization: 'Daily Life Optimization',
  philosophy_worldview: 'Philosophy & Worldview',
  other_topics: 'Other Topics'
};

export const DOMAIN_ICONS: Record<ModuleDomain, string> = {
  business_foundations: '🏗️',
  running_a_business: '⚙️',
  customer_success: '🎯',
  personal_development: '🌱',
  daily_life_optimization: '⏰',
  philosophy_worldview: '💭',
  other_topics: '✨'
};

export interface InfobankEntry {
  id: string;
  title: string;
  content: Record<string, unknown>;
  tags: string[];
}

export interface PDFExport {
  id: string;
  user_id: string;
  file_path: string;
  metadata: {
    title: string;
    type: 'worksheet' | 'template' | 'summary' | 'action_steps';
    module_id?: string;
  };
  created_at: string;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: {
    module_id?: string;
    section_title?: string;
  };
}

export interface CourseGenerationRequest {
  intake: IntakeForm;
  existingModules?: Module[];
}

export interface TutorRequest {
  message: string;
  context?: {
    module_id?: string;
    section_title?: string;
    user_progress?: ModuleProgress;
  };
  history: TutorMessage[];
}

export interface AIResponse {
  type: 'course_generation' | 'tutor_response' | 'plug_and_play';
  content: Module[] | string | PlugAndPlay;
}
