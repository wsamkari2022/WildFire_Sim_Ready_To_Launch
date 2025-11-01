/*
  # Add New APA Feedback Columns

  1. Changes
    - Add new APA feedback columns to session_feedback table
    - Add columns for comprehensive APA understanding, usability, and impact assessment

  2. New Columns
    - apa_purpose_clarity: How clear the purpose of APA was (1-7)
    - apa_ease_of_use: How easy it was to rank/reorder priorities (1-7)
    - apa_control_understanding: How much control user felt in shaping decisions (1-7)
    - apa_decision_reflection: Did APA cause rethinking of priorities (boolean)
    - apa_scenario_alignment: Did APA help see more aligned options (boolean)
    - apa_confidence_after_reordering: Confidence in decisions after adjusting rankings (1-7)
    - apa_perceived_value: Overall value of APA feature (1-7)
    - apa_tradeoff_challenge: How challenging it was to decide priorities (1-7)
    - apa_reflection_depth: Extent of reflection on trade-offs (1-7)

  3. Security
    - No RLS changes needed (inherits from table)
*/

-- Add new APA feedback columns
ALTER TABLE session_feedback
ADD COLUMN IF NOT EXISTS apa_purpose_clarity integer CHECK (apa_purpose_clarity BETWEEN 1 AND 7),
ADD COLUMN IF NOT EXISTS apa_ease_of_use integer CHECK (apa_ease_of_use BETWEEN 1 AND 7),
ADD COLUMN IF NOT EXISTS apa_control_understanding integer CHECK (apa_control_understanding BETWEEN 1 AND 7),
ADD COLUMN IF NOT EXISTS apa_decision_reflection boolean,
ADD COLUMN IF NOT EXISTS apa_scenario_alignment boolean,
ADD COLUMN IF NOT EXISTS apa_confidence_after_reordering integer CHECK (apa_confidence_after_reordering BETWEEN 1 AND 7),
ADD COLUMN IF NOT EXISTS apa_perceived_value integer CHECK (apa_perceived_value BETWEEN 1 AND 7),
ADD COLUMN IF NOT EXISTS apa_tradeoff_challenge integer CHECK (apa_tradeoff_challenge BETWEEN 1 AND 7),
ADD COLUMN IF NOT EXISTS apa_reflection_depth integer CHECK (apa_reflection_depth BETWEEN 1 AND 7);

-- Add comments for documentation
COMMENT ON COLUMN session_feedback.apa_purpose_clarity IS 'Rating 1-7: How clear was the purpose of APA in helping balance metrics and values';
COMMENT ON COLUMN session_feedback.apa_ease_of_use IS 'Rating 1-7: How easy was it to rank or re-order priorities during APA';
COMMENT ON COLUMN session_feedback.apa_control_understanding IS 'Rating 1-7: How much control user felt in shaping decisions';
COMMENT ON COLUMN session_feedback.apa_decision_reflection IS 'Boolean: Did APA cause user to rethink what mattered most';
COMMENT ON COLUMN session_feedback.apa_scenario_alignment IS 'Boolean: Did APA help see more aligned and relevant initial options';
COMMENT ON COLUMN session_feedback.apa_confidence_after_reordering IS 'Rating 1-7: Confidence in decisions after adjusting rankings';
COMMENT ON COLUMN session_feedback.apa_perceived_value IS 'Rating 1-7: Overall value of APA feature in reflecting values and priorities';
COMMENT ON COLUMN session_feedback.apa_tradeoff_challenge IS 'Rating 1-7: How challenging it was to decide which values/metrics should take priority';
COMMENT ON COLUMN session_feedback.apa_reflection_depth IS 'Rating 1-7: Extent of reflection on trade-offs between moral/operational values';
