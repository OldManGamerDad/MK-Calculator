import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from './translations';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const, // Fixed: Added 'as const' for proper typing
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try web environment first
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const savedLanguage = window.localStorage.getItem('user-language');
        if (savedLanguage) {
          return callback(savedLanguage);
        }
      }
      
      // Try React Native environment
      if (typeof window === 'undefined' && typeof AsyncStorage !== 'undefined') {
        const savedLanguage = await AsyncStorage.getItem('user-language');
        if (savedLanguage) {
          return callback(savedLanguage);
        }
      }
    } catch (error) {
      // Silent fallback - just use default language
    }
    
    // Always fall back to English
    callback('en');
  },
  init: () => {},
  cacheUserLanguage: (language: string) => {
    try {
      // Only try to save if localStorage is definitely available
      if (typeof window !== 'undefined' && 
          typeof window.localStorage !== 'undefined' && 
          window.localStorage) {
        window.localStorage.setItem('user-language', language);
        return;
      }
      
      // For React Native - but don't await, make it sync
      if (typeof window === 'undefined' && 
          typeof AsyncStorage !== 'undefined' && 
          AsyncStorage) {
        AsyncStorage.setItem('user-language', language).catch(() => {
          // Silent fail
        });
        return;
      }
    } catch (error) {
      // Silent fail - language changes will still work for the session
    }
  }
};

i18n
  .use(LANGUAGE_DETECTOR as any) // Fixed: Added type assertion to bypass strict typing
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: translations,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;