import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const webStorage = {
  getItem: (key: string) => {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch (e) {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (e) {
      return Promise.resolve();
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (e) {
      return Promise.resolve();
    }
  },
};

const secureStorage = Platform.OS === 'web' ? undefined : {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

// Get environment variables from Constants.expoConfig.extra
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file and app.config.ts');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});