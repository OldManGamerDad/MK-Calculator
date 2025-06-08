import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, I18nManager, Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react-native';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', isRTL: false },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', isRTL: true },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', isRTL: false },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', isRTL: false },
  { code: 'es', name: 'Español', flag: '🇪🇸', isRTL: false },
  { code: 'fr', name: 'Français', flag: '🇫🇷', isRTL: false },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', isRTL: false },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', isRTL: false }, // Added Dutch
];

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = async (langCode: string) => {
    const selectedLang = languages.find(lang => lang.code === langCode);
    const isRTL = selectedLang?.isRTL || false;
    
    try {
      // Change the language
      await i18n.changeLanguage(langCode);
      
      // Handle RTL changes
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
      }
      
      setDropdownVisible(false);
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert('Error', 'Failed to change language');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('common.language')}</Text>
      
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setDropdownVisible(true)}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.flag}>{currentLanguage.flag}</Text>
          <Text style={[
            styles.dropdownButtonText,
            // Remove RTL styling from button text too
          ]}>
            {currentLanguage.name}
          </Text>
        </View>
        <ChevronDown size={16} color="#000000" />
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdown}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.dropdownItem,
                    i18n.language === lang.code && styles.activeItem,
                    lang.isRTL && styles.rtlItem,
                  ]}
                  onPress={() => changeLanguage(lang.code)}
                >
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <Text 
                    style={[
                      styles.dropdownItemText,
                      i18n.language === lang.code && styles.activeItemText,
                      // Remove RTL styling - make all languages consistent
                    ]}
                  >
                    {lang.name}
                  </Text>
                  {i18n.language === lang.code && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 20,    // Increased from 18
    marginRight: 12, // Increased margin for better spacing
    minWidth: 30,    // Ensure flags have consistent width
    textAlign: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
    textAlign: 'center', // Center by default
  },
  rtlText: {
    textAlign: 'right', // Right align for RTL languages
    writingDirection: 'rtl',
  },
  rtlItem: {
    // Fixed: Added missing rtlItem style
    flexDirection: 'row-reverse',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    maxWidth: 300,
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Light background instead of dark
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.8)',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Better spacing
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)', // Dark border on light background
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeItem: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#000000', // Dark text on light background
    fontFamily: 'MedievalSharp',
    flex: 1,
    textAlign: 'center', // Center all text
    paddingHorizontal: 10, // Add padding instead of margin
  },
  activeItemText: {
    color: '#ff0000',
    fontWeight: 'bold',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default LanguageSelector;