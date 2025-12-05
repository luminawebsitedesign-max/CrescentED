-- CrescentEd Database Schema

-- Intake forms table
CREATE TABLE public.intake_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  idea TEXT NOT NULL,
  goals TEXT NOT NULL,
  background TEXT,
  experience_level TEXT NOT NULL DEFAULT 'beginner',
  interests TEXT,
  constraints TEXT,
  learning_style TEXT NOT NULL DEFAULT 'mixed',
  commitment_level TEXT NOT NULL DEFAULT 'moderate',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  summary TEXT,
  progress JSONB NOT NULL DEFAULT '{"sectionsCompleted": [], "plugAndPlayCompleted": []}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Infobank table
CREATE TABLE public.infobank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PDF exports table
CREATE TABLE public.pdf_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infobank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_exports ENABLE ROW LEVEL SECURITY;

-- Intake forms policies
CREATE POLICY "Users can view their own intake forms"
ON public.intake_forms FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own intake forms"
ON public.intake_forms FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intake forms"
ON public.intake_forms FOR UPDATE
USING (auth.uid() = user_id);

-- Modules policies
CREATE POLICY "Users can view their own modules"
ON public.modules FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own modules"
ON public.modules FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own modules"
ON public.modules FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own modules"
ON public.modules FOR DELETE
USING (auth.uid() = user_id);

-- Infobank is public read
CREATE POLICY "Anyone can read infobank"
ON public.infobank FOR SELECT
USING (true);

-- PDF exports policies
CREATE POLICY "Users can view their own pdf exports"
ON public.pdf_exports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pdf exports"
ON public.pdf_exports FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for modules
CREATE TRIGGER update_modules_updated_at
BEFORE UPDATE ON public.modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();