import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Swords, ScrollText, CookingPot, Hammer, Castle, Sword, ShieldPlus, ArrowDown as BowArrow } from 'lucide-react-native';
import Animated, { 
  withRepeat, 
  withSequence, 
  withTiming, 
  useAnimatedStyle, 
  useSharedValue,
  Easing
} from 'react-native-reanimated';
import DayCountdown from '@/components/DayCountdown';
import InfoTabs from '@/components/InfoTabs';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const currentDayScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  
  // Shared values for the ultimate buttons glow effects
  const powerGlowScale = useSharedValue(1);
  const huntingGlowScale = useSharedValue(1);

  useEffect(() => {
    // Animation for day buttons
    currentDayScale.value = withRepeat(
      withSequence(
        withTiming(1.15, {
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        withTiming(1, {
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, {
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        withTiming(0.2, {
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        })
      ),
      -1,
      true
    );

    // Animation for Ultimate Power button glow pulsing
    powerGlowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, {
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        withTiming(1, {
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        })
      ),
      -1,
      true
    );

    // Animation for Ultimate Hunting button glow pulsing
    huntingGlowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, {
          duration: 1800, // Slightly different timing for visual variety
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        withTiming(1, {
          duration: 1800,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        })
      ),
      -1,
      true
    );
  }, []);

  const Days = [
    { name: t('days.unit'), icon: Swords, route: '/(app)/Unit-Day', color: '#ff4d4d' },
    { name: t('days.summon'), icon: ScrollText, route: '/(app)/Summon-Day', color: '#4d94ff' },
    { name: t('days.witch'), icon: CookingPot, route: '/(app)/Witch-Day', color: '#9933ff' },
    { name: t('days.gear'), icon: Hammer, route: '/(app)/Gear-Day', color: '#ffcc00' },
    { name: t('days.dragon'), icon: Castle, route: '/(app)/Dragon-Day', color: '#00cc66' },
    { name: t('days.hero'), icon: Sword, route: '/(app)/Hero-Day', color: '#ff6600' },
  ];

  const getCurrentDayIndex = () => {
    const now = new Date();
    const Day = now.getDay();
    const hour = now.getHours();
    
    if (Day === 0 && hour >= 20) {
      return 0;
    }
    
    if (hour >= 20) {
      now.setDate(now.getDate() + 1);
      const nextDay = now.getDay();
      return nextDay === 0 ? -1 : nextDay - 1;
    }
    
    if (Day === 0) {
      return -1;
    }
    
    return Day - 1;
  };

  const currentDayIndex = getCurrentDayIndex();

  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

  // Animated styles for the Ultimate buttons
  const powerGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: powerGlowScale.value }],
    opacity: 0.5 - ((powerGlowScale.value - 1) * 0.3), // Fade out as it expands
  }));

  const huntingGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: huntingGlowScale.value }],
    opacity: 0.5 - ((huntingGlowScale.value - 1) * 0.3), // Fade out as it expands
  }));

  return (
    <ImageBackground
      source={{ uri: 'https://iili.io/3NjdOYv.png' }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <View style={styles.titleContainer}>
              <Image 
                source={{ uri: 'https://i.ibb.co/dZD0rd2/fafo.png' }}
                style={styles.titleImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.divider} />
            <Text style={styles.weekText}>{t('home.MKcalculator')}</Text>
          </View>

          <DayCountdown />

          <View style={styles.grid}>
            {Days.map((Day, index) => {
              const isCurrentDay = index === currentDayIndex;
              
              const buttonAnimatedStyle = useAnimatedStyle(() => ({
                transform: [
                  { scale: isCurrentDay ? currentDayScale.value : 1 }
                ],
              }));

              const glowAnimatedStyle = useAnimatedStyle(() => ({
                opacity: isCurrentDay ? glowOpacity.value : 0,
              }));

              return (
                <AnimatedTouchableOpacity
                  key={index}
                  style={[styles.buttonContainer, buttonAnimatedStyle]}
                  onPress={() => router.push(Day.route as any)}
                >
                  <View style={[styles.button, { backgroundColor: `${Day.color}20` }]}>
                    <View style={styles.iconContainer}>
                      <Day.icon size={23} color="#ffffff" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.buttonText}>{Day.name}</Text>
                    {isCurrentDay && (
                      <Animated.View 
                        style={[
                          styles.glow,
                          { backgroundColor: Day.color },
                          glowAnimatedStyle
                        ]} 
                      />
                    )}
                  </View>
                </AnimatedTouchableOpacity>
              );
            })}
          </View>

          <View style={styles.ultimateButtonsContainer}>
            {/* Ultimate Power Button with Glow */}
            <View style={styles.ultimateButtonWrapper}>
              <TouchableOpacity
                style={styles.ultimatePowerButton}
                onPress={() => router.push('/(app)/Ultimate-Power' as any)}
              >
                <ShieldPlus size={19} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.ultimatePowerText}>{t('specialEvents.ultimatePower')}</Text>
              </TouchableOpacity>
              <Animated.View 
                style={[
                  styles.ultimateGlow,
                  { backgroundColor: '#8b0000' },
                  powerGlowStyle
                ]} 
              />
            </View>

            {/* Ultimate Hunting Button with Glow */}
            <View style={styles.ultimateButtonWrapper}>
              <TouchableOpacity
                style={styles.huntingButton}
                onPress={() => router.push('/(app)/Ultimate-Hunting' as any)}
              >
                <BowArrow size={19} color="#ffffff" strokeWidth={2.5} />
                <Text style={styles.huntingButtonText}>{t('specialEvents.ultimateHunting')}</Text>
              </TouchableOpacity>
              <Animated.View 
                style={[
                  styles.ultimateGlow,
                  { backgroundColor: '#2d5a27' },
                  huntingGlowStyle
                ]} 
              />
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // More transparent overlay to match other screens
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 80,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  titleContainer: {
    alignItems: 'center',
    position: 'relative',
    width: 300, // Much larger width
    height: 120, // Much larger height
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // More transparent since image has its own effects
    borderRadius: 8,
    padding: 8,
  },
  titleImage: {
    width: '100%',
    height: '100%',
  },
  divider: {
    width: 100,
    height: 2,
    backgroundColor: '#ff0000',
    marginVertical: 10,
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  weekText: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    width: '29%', // Increased from 28% (original was 30%)
    aspectRatio: 0.87, // Between 0.85 and 0.9
    marginBottom: 7, // Between 6 and 8
  },
  button: {
    flex: 1,
    borderRadius: 9, // Between 8 and 10
    padding: 7, // Between 6 and 8
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)', // More transparent border
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, // Reduced shadow opacity
    shadowRadius: 5,
    elevation: 6,
    overflow: 'visible',
    position: 'relative',
    // Background is now set dynamically with each Day color + transparency
  },
  iconContainer: {
    width: 38, // Between 36 and 40
    height: 38, // Between 36 and 40
    borderRadius: 19, // Adjusted accordingly
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // More transparent background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5, // Between 4 and 6
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)', // More transparent border
  },
  buttonText: {
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    fontSize: 11.5, // Between 11 and 12
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  glow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 11, // Between 10 and 12
    zIndex: -1,
    opacity: 0.4,
  },
  ultimateButtonsContainer: {
    marginTop: 20,
    gap: 12,
  },
  ultimateButtonWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ultimatePowerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 0, 0, 0.2)', // Much more transparent
    padding: 11, // Between 10 and 12
    borderRadius: 9, // Between 8 and 10
    gap: 7, // Between 6 and 8
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)', // More transparent border
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, // Reduced shadow opacity
    shadowRadius: 5,
    elevation: 6,
    zIndex: 2,
    width: '75%', // Between 70% and 80%
  },
  ultimatePowerText: {
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    fontSize: 15, // Between 14 and 16
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  huntingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45, 90, 39, 0.2)', // Much more transparent
    padding: 11, // Between 10 and 12
    borderRadius: 9, // Between 8 and 10
    gap: 7, // Between 6 and 8
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)', // More transparent border
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, // Reduced shadow opacity
    shadowRadius: 5,
    elevation: 6,
    zIndex: 2,
    width: '75%', // Between 70% and 80%
  },
  huntingButtonText: {
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    fontSize: 15, // Between 14 and 16
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ultimateGlow: {
    position: 'absolute',
    top: 0,
    // Match the button width
    width: '75%', // Between 70% and 80%
    height: '100%',
    borderRadius: 11, // Between 10 and 12
    opacity: 0.4,
    alignSelf: 'center', // Center the glow
  },
});