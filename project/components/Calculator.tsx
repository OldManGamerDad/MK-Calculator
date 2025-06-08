import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, Platform, ImageBackground } from 'react-native';
import { X, Copy, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CALCULATOR_WIDTH = Math.min(400, SCREEN_WIDTH - 40);

export default function Calculator() {
  const { t } = useTranslation();
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);
  const router = useRouter();

  const handleNumber = (num: string) => {
    if (display === '0' || shouldResetDisplay) {
      setDisplay(num);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (operator: string) => {
    setEquation(display + ' ' + operator + ' ');
    setShouldResetDisplay(true);
  };

  const handleEqual = () => {
    try {
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation('');
    } catch (error) {
      setDisplay(t('calculator.error'));
    }
    setShouldResetDisplay(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setShouldResetDisplay(false);
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleCopy = async () => {
    try {
      if (Platform.OS === 'web') {
        await window.navigator.clipboard.writeText(display);
      } else {
        await Clipboard.setStringAsync(display);
      }
      Alert.alert(t('calculator.copied'), t('calculator.copiedMessage'));
    } catch (err) {
      Alert.alert(t('calculator.error'), t('calculator.copyError'));
    }
  };

  const renderButton = (text: string, handler: () => void, isOperator = false, style = {}) => (
    <TouchableOpacity
      style={[styles.button, isOperator && styles.operatorButton, style]}
      onPress={handler}
    >
      <Text style={[styles.buttonText, isOperator && styles.operatorText]}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={{ uri: 'https://iili.io/3NjdOYv.png' }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2.5} />
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        
        <View style={styles.calculatorContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('calculator.title')}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => router.back()}
              accessibilityLabel={t('common.close')}
            >
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.displayContainer}>
            <Text style={styles.equation}>{equation}</Text>
            <View style={styles.displayRow}>
              <Text style={styles.display}>{display}</Text>
              <TouchableOpacity 
                onPress={handleCopy} 
                style={styles.copyButton}
                accessibilityLabel={t('calculator.copyValue')}
              >
                <Copy size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonGrid}>
            <View style={styles.row}>
              {renderButton('7', () => handleNumber('7'))}
              {renderButton('8', () => handleNumber('8'))}
              {renderButton('9', () => handleNumber('9'))}
              {renderButton('÷', () => handleOperator('/'), true)}
            </View>
            <View style={styles.row}>
              {renderButton('4', () => handleNumber('4'))}
              {renderButton('5', () => handleNumber('5'))}
              {renderButton('6', () => handleNumber('6'))}
              {renderButton('×', () => handleOperator('*'), true)}
            </View>
            <View style={styles.row}>
              {renderButton('1', () => handleNumber('1'))}
              {renderButton('2', () => handleNumber('2'))}
              {renderButton('3', () => handleNumber('3'))}
              {renderButton('-', () => handleOperator('-'), true)}
            </View>
            <View style={styles.row}>
              {renderButton('0', () => handleNumber('0'))}
              {renderButton('.', handleDecimal)}
              {renderButton('=', handleEqual, true)}
              {renderButton('+', () => handleOperator('+'), true)}
            </View>
            <View style={styles.row}>
              {renderButton(t('calculator.clear'), handleClear, true, { flex: 0.5, aspectRatio: undefined })}
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  calculatorContainer: {
    width: CALCULATOR_WIDTH,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.8)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  displayContainer: {
    backgroundColor: 'rgba(42, 42, 42, 0.7)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.7)',
  },
  displayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equation: {
    color: '#aaaaaa',
    fontSize: 18,
    textAlign: 'right',
    fontFamily: 'MedievalSharp',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  display: {
    color: '#ffffff',
    fontSize: 32,
    textAlign: 'right',
    fontFamily: 'MedievalSharp',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  copyButton: {
    padding: 6,
    marginLeft: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  buttonGrid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: 'rgba(42, 42, 42, 0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(51, 51, 51, 0.7)',
    height: 60,
  },
  operatorButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
    borderColor: 'rgba(255, 51, 51, 0.7)',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  operatorText: {
    color: '#ffffff',
  },
});