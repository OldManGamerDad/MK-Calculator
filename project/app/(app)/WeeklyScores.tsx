import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ImageBackground } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WeeklyScores {
  unit_day_score: number | null;
  summon_day_score: number | null;
  witch_day_score: number | null;
  gear_day_score: number | null;
  dragon_day_score: number | null;
  heroes_day_score: number | null;
  last_updated?: string;
}

interface DayScore {
  name: string;
  score: number | null;
  color: string;
  completed: boolean;
}

export default function WeeklyScoresScreen() {
  const router = useRouter();
  const [weeklyScores, setWeeklyScores] = useState<WeeklyScores>({
    unit_day_score: null,
    summon_day_score: null,
    witch_day_score: null,
    gear_day_score: null,
    dragon_day_score: null,
    heroes_day_score: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get current week number
  const getWeekNumber = () => {
    const now = new Date();
    return Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7));
  };

  const fetchWeeklyScores = async () => {
    try {
      const currentWeek = getWeekNumber();
      const storageKey = `scores_week_${currentWeek}`;
      
      const savedScoresString = await AsyncStorage.getItem(storageKey);
      if (savedScoresString) {
        const savedScores = JSON.parse(savedScoresString);
        setWeeklyScores(savedScores);
      } else {
        // No scores saved yet
        setWeeklyScores({
          unit_day_score: null,
          summon_day_score: null,
          witch_day_score: null,
          gear_day_score: null,
          dragon_day_score: null,
          heroes_day_score: null,
        });
      }
    } catch (error) {
      console.error('Error fetching weekly scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeeklyScores();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWeeklyScores();
  }, []);

  const getDayScores = (): DayScore[] => {
    return [
      {
        name: 'Unit Day',
        score: weeklyScores.unit_day_score,
        color: '#ff4d4d',
        completed: weeklyScores.unit_day_score !== null && weeklyScores.unit_day_score > 0
      },
      {
        name: 'Summon Day',
        score: weeklyScores.summon_day_score,
        color: '#4d94ff',
        completed: weeklyScores.summon_day_score !== null && weeklyScores.summon_day_score > 0
      },
      {
        name: 'Witch Day',
        score: weeklyScores.witch_day_score,
        color: '#9933ff',
        completed: weeklyScores.witch_day_score !== null && weeklyScores.witch_day_score > 0
      },
      {
        name: 'Gear Day',
        score: weeklyScores.gear_day_score,
        color: '#ffcc00',
        completed: weeklyScores.gear_day_score !== null && weeklyScores.gear_day_score > 0
      },
      {
        name: 'Dragon Day',
        score: weeklyScores.dragon_day_score,
        color: '#00cc66',
        completed: weeklyScores.dragon_day_score !== null && weeklyScores.dragon_day_score > 0
      },
      {
        name: 'Heroes Day',
        score: weeklyScores.heroes_day_score,
        color: '#ff6600',
        completed: weeklyScores.heroes_day_score !== null && weeklyScores.heroes_day_score > 0
      }
    ];
  };

  const calculateTotalScore = () => {
    const dayScores = getDayScores();
    return dayScores.reduce((total, day) => total + (day.score || 0), 0);
  };

  const getCompletedDaysCount = () => {
    return getDayScores().filter(day => day.completed).length;
  };

  const formatNumber = (num: number | null) => {
    return num?.toLocaleString() || '0';
  };

  const getWeekDateRange = () => {
    const now = new Date();
    const currentWeek = getWeekNumber();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const weekStart = new Date(startOfYear.getTime() + (currentWeek - 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  if (loading) {
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
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading scores...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

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
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📊 Weekly Scores</Text>
            <Text style={styles.weekText}>Week {getWeekNumber()}</Text>
            <Text style={styles.dateRangeText}>{getWeekDateRange()}</Text>
            <Text style={styles.progressText}>
              {getCompletedDaysCount()} of 6 days completed
            </Text>
          </View>

          <View style={styles.scoresContainer}>
            {getDayScores().map((day, index) => (
              <View key={index} style={[
                styles.dayCard,
                { borderColor: `${day.color}80` },
                day.completed && { borderColor: day.color, backgroundColor: `${day.color}15` }
              ]}>
                <View style={styles.dayHeader}>
                  <View style={[
                    styles.dayIndicator,
                    { backgroundColor: day.color },
                    !day.completed && { backgroundColor: `${day.color}40` }
                  ]} />
                  <Text style={[
                    styles.dayName,
                    day.completed && { color: day.color }
                  ]}>
                    {day.name}
                  </Text>
                  <Text style={styles.statusText}>
                    {day.completed ? '✅' : '⏳'}
                  </Text>
                </View>
                <Text style={[
                  styles.dayScore,
                  { color: day.completed ? day.color : '#888888' }
                ]}>
                  {formatNumber(day.score)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalContainer}>
            <View style={styles.totalHeader}>
              <Text style={styles.totalLabel}>🏆 Total Week Score</Text>
            </View>
            <Text style={styles.totalValue}>
              {formatNumber(calculateTotalScore())}
            </Text>
            {weeklyScores.last_updated && (
              <Text style={styles.lastUpdatedText}>
                Last updated: {new Date(weeklyScores.last_updated).toLocaleString()}
              </Text>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💾 Scores are saved locally on your device
            </Text>
            <Text style={styles.infoText}>
              🔄 Pull down to refresh • Data resets weekly
            </Text>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  // Updated back button styles - replace your existing backButton and backButtonText styles

backButton: {
  position: 'absolute',
  top: 20,  // ← RAISED from 50 to 35
  left: 15, // ← MOVED closer to edge (was 20)
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  paddingHorizontal: 8,  // ← SMALLER padding (was 12)
  paddingVertical: 6,    // ← SMALLER padding (was 8)
  borderRadius: 15,      // ← SMALLER radius (was 20)
  zIndex: 10,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.3)',
},
backButtonText: {
  color: '#ffffff',
  fontSize: 14,          // ← SMALLER text (was 16)
  fontFamily: 'MedievalSharp',
  marginLeft: 4,         // ← SMALLER margin (was 5)
  textShadowColor: 'rgba(0, 0, 0, 0.8)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
},
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 90,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  weekText: {
    fontSize: 20,
    fontFamily: 'MedievalSharp',
    color: '#ffcc00',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dateRangeText: {
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  scoresContainer: {
    gap: 12,
    marginBottom: 20,
  },
  dayCard: {
    backgroundColor: 'rgba(42, 42, 42, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  dayName: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusText: {
    fontSize: 16,
  },
  dayScore: {
    fontSize: 24,
    fontFamily: 'MedievalSharp',
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  totalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#ffcc00',
    alignItems: 'center',
  },
  totalHeader: {
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 20,
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  totalValue: {
    fontSize: 36,
    fontFamily: 'MedievalSharp',
    color: '#ffcc00',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
    fontFamily: 'MedievalSharp',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    textAlign: 'center',
    marginBottom: 4,
  },
});