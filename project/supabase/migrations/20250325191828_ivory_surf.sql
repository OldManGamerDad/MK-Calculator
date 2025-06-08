/*
  # Create scores table for Kingdom Guard

  1. New Tables
    - `scores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `unit_day_score` (integer)
      - `summon_day_score` (integer)
      - `witch_day_score` (integer)
      - `gear_day_score` (integer)
      - `dragon_day_score` (integer)
      - `Hero_day_score` (integer)
      - `total_score` (integer, computed)
      - `created_at` (timestamp)
      - `week_number` (integer)

  2. Security
    - Enable RLS on `scores` table
    - Add policies for users to manage their own scores
    - Add function to clean up old scores

  Note: Auto-deletion will be handled by Edge Functions instead of cron
*/

CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  unit_day_score integer DEFAULT 0,
  summon_day_score integer DEFAULT 0,
  witch_day_score integer DEFAULT 0,
  gear_day_score integer DEFAULT 0,
  dragon_day_score integer DEFAULT 0,
  Hero_day_score integer DEFAULT 0,
  total_score integer GENERATED ALWAYS AS (
    unit_day_score + summon_day_score + witch_day_score + 
    gear_day_score + dragon_day_score + Hero_day_score
  ) STORED,
  created_at timestamptz DEFAULT now(),
  week_number integer NOT NULL
);

-- Enable Row Level Security
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own scores
CREATE POLICY "Users can read own scores"
  ON scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own scores
CREATE POLICY "Users can insert own scores"
  ON scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own scores
CREATE POLICY "Users can update own scores"
  ON scores
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for system to delete old scores
CREATE POLICY "System can delete old scores"
  ON scores
  FOR DELETE
  TO authenticated
  USING (created_at < NOW() - INTERVAL '1 week');

-- Create index for faster queries
CREATE INDEX scores_user_id_week_number_idx ON scores(user_id, week_number);

-- Function to delete old scores
CREATE OR REPLACE FUNCTION delete_old_scores()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM scores
  WHERE created_at < NOW() - INTERVAL '1 week';
END;
$$;