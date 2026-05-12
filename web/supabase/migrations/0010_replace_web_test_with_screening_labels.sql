ALTER TABLE public.applications
  ADD COLUMN screening_labels TEXT[] DEFAULT NULL;

ALTER TABLE public.applications
  DROP COLUMN web_test_status;
