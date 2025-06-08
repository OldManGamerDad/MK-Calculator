import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Clock, Globe } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface DayInfo {
  nameKey: string;
  color: string;
}

export default function DayCountdown() {
  const { t } = useTranslation();
  const [currentDay, setCurrentDay] = useState<DayInfo | null>(null);
  const [localTimeRemaining, setLocalTimeRemaining] = useState<string>('');
  const [utcTimeRemaining, setUtcTimeRemaining] = useState<string>('');
  const [isSunday, setIsSunday] = useState<boolean>(false);

  useEffect(() => {
    // Days array with translation keys
    const Days: DayInfo[] = [
      { nameKey: 'days.unit', color: '#ff4d4d' },
      { nameKey: 'days.summon', color: '#4d94ff' },
      { nameKey: 'days.witch', color: '#9933ff' },
      { nameKey: 'days.gear', color: '#ffcc00' },
      { nameKey: 'days.dragon', color: '#00cc66' },
      { nameKey: 'days.hero', color: '#ff6600' },
    ];

    const getCurrentDayIndex = (utcDate: Date, localDate: Date) => {
      const utcDay = utcDate.getUTCDay();
      const utcHour = utcDate.getUTCHours();
      const localDay = localDate.getDay();
      const localHour = localDate.getHours();
      
      // Check if we're in the "HOLD YOUR CASTLES" period (Sunday in UTC but before event start locally)
      if (utcDay === 0 && localHour < 20) {
        return -2; // Show "HOLD YOUR CASTLES"
      }
      
      // Check local time for event changes (events change at 8 PM local time)
      if (localHour >= 20) {
        const nextDay = (localDay + 1) % 7;
        if (nextDay === 0) {
          return -2; // Show "HOLD YOUR CASTLES" if next day is Sunday
        }
        return nextDay - 1;
      }
      
      // During the day (before 8 PM local)
      if (localDay === 0) {
        return -2; // Sunday before 8 PM = "HOLD YOUR CASTLES"
      }
      
      return localDay - 1;
    };

    const formatTime = (diff: number): string => {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatLocalTime = (date: Date): string => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12; // Convert to 12-hour format
      
      return `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
    };

    const updateTime = () => {
      const now = new Date();
      const utcNow = new Date(now.getTime());
      
      // Get current day based on both UTC and local time
      const dayIndex = getCurrentDayIndex(utcNow, now);
      
      if (dayIndex === -1) {
        setCurrentDay(null);
        setLocalTimeRemaining(t('countdown.noActiveDay'));
        setUtcTimeRemaining('');
        return;
      }
      
      if (dayIndex === -2) {
        setIsSunday(true);
        setCurrentDay({ 
          nameKey: 'countdown.holdYourCastles', 
          color: '#ffcc00'
        });
      } else {
        setIsSunday(false);
        setCurrentDay(Days[dayIndex]);
      }

      // Calculate next event time in LOCAL time (next 8:00 PM local)
      const nextEventLocal = new Date(now);
      nextEventLocal.setHours(20, 0, 0, 0);
      
      // If we're past 8:00 PM today, move to tomorrow
      if (now >= nextEventLocal) {
        nextEventLocal.setDate(nextEventLocal.getDate() + 1);
      }

      // Calculate LOCAL countdown to next event
      const localDiff = nextEventLocal.getTime() - now.getTime();
      const localCountdown = formatTime(localDiff);
      setLocalTimeRemaining(localCountdown);
      
      // Set CURRENT UTC time (not countdown)
      const utcHours = utcNow.getUTCHours().toString().padStart(2, '0');
      const utcMinutes = utcNow.getUTCMinutes().toString().padStart(2, '0');
      const utcSeconds = utcNow.getUTCSeconds().toString().padStart(2, '0');
      setUtcTimeRemaining(`${utcHours}:${utcMinutes}:${utcSeconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [t]);

  if (!currentDay) return null;

  return (
    <View style={[styles.container, { borderColor: `${currentDay.color}50` }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.dayName, { color: currentDay.color }]}>
          {t(currentDay.nameKey)}
        </Text>
        {isSunday && (
          <Text style={[styles.dayName, { color: '#ffffff', marginTop: 4 }]}>
            {t('countdown.newMkSoon')}
          </Text>
        )}
      </View>
      
      <View style={styles.timeSection}>
        {/* Local Time */}
        <View style={styles.timeColumn}>
          <View style={[styles.timeContainer, { borderColor: `${currentDay.color}40` }]}>
            <Clock size={14} color={currentDay.color} />
            <Text style={[styles.timeRemaining, { color: currentDay.color }]}>
              {localTimeRemaining}
            </Text>
          </View>
          <Text style={[styles.timeLabel, { color: currentDay.color }]}>COUNTDOWN</Text>
        </View>
        
        {/* UTC Time */}
        <View style={styles.timeColumn}>
          <View style={[styles.timeContainer, styles.utcContainer, { borderColor: `${currentDay.color}40` }]}>
            <Globe size={14} color={currentDay.color} />
            <Text style={[styles.timeRemaining, styles.utcText, { color: currentDay.color }]}>
              {utcTimeRemaining}
            </Text>
          </View>
          <Text style={[styles.timeLabel, { color: currentDay.color }]}>UTC</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(42, 42, 42, 0.3)',
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
  },
  dayName: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeColumn: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.OS === 'web' ? 4 : undefined,
    paddingLeft: Platform.OS !== 'web' ? 4 : undefined,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    minWidth: 85,
  },
  utcContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  timeRemaining: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    marginLeft: Platform.OS !== 'web' ? 4 : undefined,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  utcText: {
    fontSize: 14,
    opacity: 0.9,
  },
  timeLabel: {
    fontFamily: 'MedievalSharp',
    fontSize: 10,
    marginTop: 2,
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});