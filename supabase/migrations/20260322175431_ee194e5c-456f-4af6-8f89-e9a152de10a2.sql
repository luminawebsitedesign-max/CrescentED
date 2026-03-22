
-- DELETE policy for intake_forms
CREATE POLICY "Users can delete their own intake forms"
  ON public.intake_forms FOR DELETE
  USING (auth.uid() = user_id);

-- DELETE policy for ai_logs
CREATE POLICY "Users can delete their own ai logs"
  ON public.ai_logs FOR DELETE
  USING (auth.uid() = user_id);

-- DELETE policy for pdf_exports
CREATE POLICY "Users can delete their own pdf exports"
  ON public.pdf_exports FOR DELETE
  USING (auth.uid() = user_id);
