-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  experience_level TEXT DEFAULT 'beginner',
  learning_style TEXT DEFAULT 'mixed',
  time_commitment TEXT DEFAULT 'moderate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create courses table (replacing modules for course-level storage)
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Courses RLS policies
CREATE POLICY "Users can view their own courses"
  ON public.courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own courses"
  ON public.courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses"
  ON public.courses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses"
  ON public.courses FOR DELETE
  USING (auth.uid() = user_id);

-- Create ai_logs table
CREATE TABLE public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on ai_logs
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- AI logs RLS policies
CREATE POLICY "Users can view their own ai logs"
  ON public.ai_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ai logs"
  ON public.ai_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();