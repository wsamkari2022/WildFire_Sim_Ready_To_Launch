/*
  # Add Tracking Lists for Value Decision and Alignment

  ## Summary
  This migration adds two new tracking lists to the session_feedback table:
  1. scenarios_final_decision_labels - stores the value label of the final decision for each scenario
  2. checking_alignment_list - tracks alignment status ("Aligned" or "Misaligned") for each scenario

  ## Changes Made
  - Add scenarios_final_decision_labels column (jsonb array) to session_feedback table
  - Add checking_alignment_list column (jsonb array) to session_feedback table

  ## Purpose
  These lists track:
  - All final decision value labels in order (one per scenario)
  - Whether each final decision was aligned with FinalTopTwoValues BEFORE the list was updated

  ## Security
  - No changes to RLS policies (existing policies apply)

  ## Notes
  - Both columns are nullable to support existing records
  - JSONB arrays allow flexible storage of string values
  - Lists maintain scenario order (index 0 = scenario 1, etc.)
*/

-- Add scenarios_final_decision_labels column to session_feedback
ALTER TABLE session_feedback
ADD COLUMN IF NOT EXISTS scenarios_final_decision_labels jsonb DEFAULT '[]';

-- Add checking_alignment_list column to session_feedback
ALTER TABLE session_feedback
ADD COLUMN IF NOT EXISTS checking_alignment_list jsonb DEFAULT '[]';

-- Add comments for documentation
COMMENT ON COLUMN session_feedback.scenarios_final_decision_labels IS
'Array of value labels for final decisions in each scenario, in order (e.g., ["safety", "efficiency", "fairness"])';

COMMENT ON COLUMN session_feedback.checking_alignment_list IS
'Array of alignment statuses ("Aligned" or "Misaligned") for each scenario final decision, checked BEFORE FinalTopTwoValues update';
