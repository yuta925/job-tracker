ALTER TABLE self_analysis_items
  DROP CONSTRAINT self_analysis_items_item_type_check;

ALTER TABLE self_analysis_items
  ADD CONSTRAINT self_analysis_items_item_type_check
  CHECK (item_type IN (
    'strength',
    'weakness',
    'episode',
    'career_axis',
    'values',
    'interests',
    'skills',
    'challenges',
    'roles',
    'learnings',
    'setbacks',
    'future_vision',
    'external_feedback',
    'company_criteria'
  ));
