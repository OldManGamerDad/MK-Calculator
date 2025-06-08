/*
  # Remove auto-deletion policy

  1. Changes
    - Remove the "System can delete old scores" policy from the scores table
    - This will prevent automatic deletion of scores after 7 days

  2. Security
    - Maintains existing RLS policies for user data access
    - Users can still manually delete their own scores
*/

-- Remove the auto-deletion policy
DROP POLICY IF EXISTS "System can delete old scores" ON public.scores;