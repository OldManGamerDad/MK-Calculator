/*
  # Remove gamertag functionality
  
  1. Changes
    - Drop profiles table and related triggers
    - Remove gamertag-related functionality
*/

-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop the profiles table
DROP TABLE IF EXISTS public.profiles;