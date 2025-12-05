// CrescentEd Type Definitions

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  experience_level: string;
  learning_style: string;
  time_commitment: string;
  created_at: string;
}

export interface IntakeForm {
  id: string;
  user_id: string;
  idea: string;
  goals: string;
  background: string | null;
  experience_level: string;
  interests: string | null;
  constraints: string | null;
  learning_style: string;
  commitment_level: string;
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
  summary: string;
  content: {
    sections: ModuleSection[];
    action_steps: string[];
  };
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

export interface InfobankEntry {
  id: string;
  title: string;
  content: Record<string, unknown>;
  tags: string[];
}
