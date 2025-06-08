/*
  # Add overall_score column to scores table

  1. Changes
    - Add overall_score column to scores table with default value of 0
    - Make it nullable to maintain compatibility with existing records
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scores' AND column_name = 'overall_score'
  ) THEN
    ALTER TABLE scores ADD COLUMN overall_score integer DEFAULT 0;
  END IF;
END $$;