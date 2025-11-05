/*
  # Rename Visualization Trade-off Columns

  1. Changes
    - Rename `viz_tradeoff_value` to `viz_tradeoff_evaluation` for clarity
    - Rename `viz_tradeoff_helpfulness` to `viz_tradeoff_justification` for consistency

  2. Purpose
    - Match the actual question text in the feedback form
    - "Trade-Off Evaluation" asks about value of comparisons
    - "Trade-Off Justification" asks about helpfulness in reaching decision

  3. Notes
    - Column rename operations preserve existing data
    - No data loss or transformation needed
*/

DO $$
BEGIN
  -- Rename viz_tradeoff_value to viz_tradeoff_evaluation if the old column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'session_feedback' AND column_name = 'viz_tradeoff_value'
  ) THEN
    ALTER TABLE session_feedback RENAME COLUMN viz_tradeoff_value TO viz_tradeoff_evaluation;
  END IF;

  -- Add viz_tradeoff_evaluation if it doesn't exist (in case migration runs fresh)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'session_feedback' AND column_name = 'viz_tradeoff_evaluation'
  ) THEN
    ALTER TABLE session_feedback ADD COLUMN viz_tradeoff_evaluation integer CHECK (viz_tradeoff_evaluation BETWEEN 1 AND 7);
  END IF;

  -- Rename viz_tradeoff_helpfulness to viz_tradeoff_justification
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'session_feedback' AND column_name = 'viz_tradeoff_helpfulness'
  ) THEN
    ALTER TABLE session_feedback RENAME COLUMN viz_tradeoff_helpfulness TO viz_tradeoff_justification;
  END IF;

  -- Add viz_tradeoff_justification if it doesn't exist (in case migration runs fresh)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'session_feedback' AND column_name = 'viz_tradeoff_justification'
  ) THEN
    ALTER TABLE session_feedback ADD COLUMN viz_tradeoff_justification integer CHECK (viz_tradeoff_justification BETWEEN 1 AND 7);
  END IF;
END $$;

-- Update column comments
COMMENT ON COLUMN session_feedback.viz_tradeoff_evaluation IS 'Rating 1-7: Value of trade-off comparisons in evaluating options';
COMMENT ON COLUMN session_feedback.viz_tradeoff_justification IS 'Rating 1-7: Helpfulness of trade-off views in reaching or justifying decision';
