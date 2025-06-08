/*
  # Fix scores table schema

  1. Changes
    - Modify all score columns to properly handle NULL values
    - Remove default values to ensure proper NULL handling
    - Update existing records to use NULL instead of 0
*/

-- Remove default values and ensure columns can be NULL
ALTER TABLE scores 
  ALTER COLUMN unit_day_score DROP DEFAULT,
  ALTER COLUMN summon_day_score DROP DEFAULT,
  ALTER COLUMN witch_day_score DROP DEFAULT,
  ALTER COLUMN gear_day_score DROP DEFAULT,
  ALTER COLUMN dragon_day_score DROP DEFAULT,
  ALTER COLUMN Hero_day_score DROP DEFAULT,
  ALTER COLUMN overall_score DROP DEFAULT;

-- Update existing records to use NULL instead of 0
UPDATE scores 
SET 
  unit_day_score = NULLIF(unit_day_score, 0),
  summon_day_score = NULLIF(summon_day_score, 0),
  witch_day_score = NULLIF(witch_day_score, 0),
  gear_day_score = NULLIF(gear_day_score, 0),
  dragon_day_score = NULLIF(dragon_day_score, 0),
  Hero_day_score = NULLIF(Hero_day_score, 0),
  overall_score = NULLIF(overall_score, 0);

-- Update the total_score calculation to handle NULL values
ALTER TABLE scores DROP COLUMN total_score;
ALTER TABLE scores ADD COLUMN total_score integer GENERATED ALWAYS AS (
  COALESCE(unit_day_score, 0) + 
  COALESCE(summon_day_score, 0) + 
  COALESCE(witch_day_score, 0) + 
  COALESCE(gear_day_score, 0) + 
  COALESCE(dragon_day_score, 0) + 
  COALESCE(Hero_day_score, 0)
) STORED;