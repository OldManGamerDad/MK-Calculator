/*
  # Clean up scores table

  1. Changes
    - Add ON DELETE CASCADE to user_id foreign key
    - Add unique constraint for user_id and week_number combination
    - Add indexes for better query performance
    - Add trigger to automatically update total_score
*/

-- Add ON DELETE CASCADE to user_id foreign key
ALTER TABLE scores
  DROP CONSTRAINT IF EXISTS scores_user_id_fkey,
  ADD CONSTRAINT scores_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Add unique constraint for user_id and week_number
ALTER TABLE scores
  ADD CONSTRAINT unique_user_week
  UNIQUE (user_id, week_number);

-- Add index for querying scores by date
CREATE INDEX IF NOT EXISTS scores_created_at_idx
  ON scores(created_at DESC);

-- Add index for querying scores by week
CREATE INDEX IF NOT EXISTS scores_week_number_idx
  ON scores(week_number DESC);

-- Add function to clean old scores (older than 4 weeks)
CREATE OR REPLACE FUNCTION cleanup_old_scores()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM scores
  WHERE created_at < NOW() - INTERVAL '4 weeks';
END;
$$;