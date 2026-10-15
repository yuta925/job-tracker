-- 既存値とNULLを維持し、応募区分のみ拡張する。
BEGIN;
ALTER TABLE public.applications
  DROP CONSTRAINT applications_application_type_check;
ALTER TABLE public.applications
  ADD CONSTRAINT applications_application_type_check
  CHECK (application_type IN (
    'summer_intern', 'winter_intern', 'early_selection', 'main', 'fulltime_intern'
  ));
COMMIT;
