/*
  # Add MoralValuesReorderList Snapshot to Final Decisions

  ## Purpose
  This migration adds a column to store the MoralValuesReorderList snapshot at the moment
  of decision confirmation for each scenario. This enables tracking how value priorities
  evolved across scenarios.

  ## Changes
  - Add `moral_values_snapshot` JSONB column to `final_decisions` table
  - This column stores the exact state of the MoralValuesReorderList at confirmation time
  - Allows scenario-specific value tracking rather than global state

  ## Important Notes
  - Uses JSONB for efficient storage and querying
  - Nullable to support scenarios where MoralValuesReorderList wasn't set
  - Backward compatible with existing data
*/

-- Add moral_values_snapshot column to final_decisions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'final_decisions' AND column_name = 'moral_values_snapshot'
  ) THEN
    ALTER TABLE final_decisions ADD COLUMN moral_values_snapshot jsonb DEFAULT NULL;
  END IF;
END $$;

-- Create index for querying moral_values_snapshot
CREATE INDEX IF NOT EXISTS idx_final_decisions_moral_values ON final_decisions USING gin(moral_values_snapshot);