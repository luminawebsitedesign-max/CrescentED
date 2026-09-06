CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, window_start)
);

GRANT ALL ON public.ai_rate_limits TO service_role;

ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages rate limits"
ON public.ai_rate_limits FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.consume_ai_quota(_user_id UUID, _limit INTEGER)
RETURNS TABLE (allowed BOOLEAN, used INTEGER, retry_after INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _window TIMESTAMPTZ := date_trunc('hour', now());
  _count INTEGER;
BEGIN
  INSERT INTO public.ai_rate_limits (user_id, window_start, request_count)
  VALUES (_user_id, _window, 1)
  ON CONFLICT (user_id, window_start)
  DO UPDATE SET request_count = public.ai_rate_limits.request_count + 1
  RETURNING request_count INTO _count;

  DELETE FROM public.ai_rate_limits
  WHERE window_start < now() - interval '24 hours';

  RETURN QUERY SELECT
    _count <= _limit,
    _count,
    GREATEST(1, CEIL(EXTRACT(EPOCH FROM (_window + interval '1 hour' - now())))::INTEGER);
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_quota(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_ai_quota(UUID, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(UUID, INTEGER) TO service_role;