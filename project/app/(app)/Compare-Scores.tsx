import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import InfoTabs from '@/components/InfoTabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DayScore {
  currentScore: number;
  targetScore: string;
  difference: number;
  pointsNeeded: number;
}

interface WeeklyScore {
  currentTotal: number;
  targetScore: string;
  difference: number;
  pointsNeeded: number;
}

export default function CompareScoresScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Individual day scores
  const [scores, setScores] = useState<Record<string, DayScore>>({
    unitDay: { currentScore: 0, targetScore: '', difference: 0, pointsNeeded: 0 },
    summonDay: { currentScore: 0, targetScore: '', difference: 0, pointsNeeded: 0 },
    witchDay: { currentScore: 0, targetScore: '', difference: 0, pointsNeeded: 0 },
    gerDay: { currentScore: 0, targetScore: '', difference: 0, pointsNeeded: 0 },
    dragonDay: { currentScore: 0, targetScore: '', difference: 0, pointsNeeded: 0 },
    heroDay: { currentScore: 0, targetScore: '', difference: 0, pointsNeeded: 0 },
  });

  // Weekly total score
  const [weeklyScore, setWeeklyScore] = useState<WeeklyScore>({
    currentTotal: 0,
    targetScore: '',
    difference: 0,
    pointsNeeded: 0,
  });

  // Get current week number
  const getWeekNumber = () => {
    const now = new Date();
    return Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7));
  };

  // Load saved scores from AsyncStorage
  const loadSavedScores = async () => {
    try {
      const weekNumber = getWeekNumber();
      const storageKey = `scores_week_${weekNumber}`;
      const savedData = await AsyncStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Calculate weekly total
        const weeklyTotal = (parsedData.unit_day_score || 0) +
                           (parsedData.summon_day_score || 0) +
                           (parsedData.witch_day_score || 0) +
                           (parsedData.ger_day_score || 0) +
                           (parsedData.dragon_day_score || 0) +
                           (parsedData.hero_day_score || 0);

        // Update individual day scores
        setScores(prev => ({
          ...prev,
          unitDay: { ...prev.unitDay, currentScore: parsedData.unit_day_score || 0 },
          summonDay: { ...prev.summonDay, currentScore: parsedData.summon_day_score || 0 },
          witchDay: { ...prev.witchDay, currentScore: parsedData.witch_day_score || 0 },
          gerDay: { ...prev.gerDay, currentScore: parsedData.ger_day_score || 0 },
          dragonDay: { ...prev.dragonDay, currentScore: parsedData.dragon_day_score || 0 },
          heroDay: { ...prev.heroDay, currentScore: parsedData.hero_day_score || 0 },
        }));

        // Update weekly total
        setWeeklyScore(prev => ({
          ...prev,
          currentTotal: weeklyTotal,
        }));
      }
    } catch (error) {
      console.error('Error loading scores:', error);
    }
  };

  useEffect(() => {
    loadSavedScores();
  }, []);

  // Calculate difference for individual days
  const calculateDayDifference = (dayKey: string, targetValue: string) => {
    const currentScore = scores[dayKey].currentScore;
    const target = parseInt(targetValue) || 0;
    const difference = target - currentScore;
    const pointsNeeded = difference > 0 ? difference : 0;

    setScores(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        targetScore: targetValue,
        difference,
        pointsNeeded,
      },
    }));
  };

  // Calculate difference for weekly total
  const calculateWeeklyDifference = (targetValue: string) => {
    const target = parseInt(targetValue) || 0;
    const difference = target - weeklyScore.currentTotal;
    const pointsNeeded = difference > 0 ? difference : 0;

    setWeeklyScore(prev => ({
      ...prev,
      targetScore: targetValue,
      difference,
      pointsNeeded,
    }));
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Component for individual day comparison
  const renderDayComponent = (dayKey: string, title: string) => {
    const dayScore = scores[dayKey];
    const hasTarget = dayScore.targetScore.length > 0;

    return (
      <View style={[styles.dayComponent, hasTarget && styles.dayComponentWithTarget]}>
        <Text style={styles.dayTitle}>{title}</Text>
        
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Current Score:</Text>
          <Text style={styles.currentScore}>{formatNumber(dayScore.currentScore)}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Target Score:</Text>
          <TextInput
            style={styles.targetInput}
            keyboardType="numeric"
            value={dayScore.targetScore}
            onChangeText={(value) => calculateDayDifference(dayKey, value.replace(/[^0-9]/g, ''))}
            placeholder="0"
            placeholderTextColor="#666"
          />
        </View>

        {hasTarget && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Difference:</Text>
              <Text style={[
                styles.resultValue,
                dayScore.difference >= 0 ? styles.positiveValue : styles.negativeValue
              ]}>
                {dayScore.difference >= 0 ? '+' : ''}{formatNumber(dayScore.difference)}
              </Text>
            </View>
            
            {dayScore.pointsNeeded > 0 ? (
              <View style={styles.resultRow}>
                <Text style={styles.needLabel}>Points Needed:</Text>
                <Text style={styles.needValue}>{formatNumber(dayScore.pointsNeeded)}</Text>
              </View>
            ) : (
              <Text style={styles.achievedText}>🎉 Target Achieved!</Text>
            )}
          </View>
        )}
      </View>
    );
  };

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
        
        <InfoTabs />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.headerTitle}>Compare Scores</Text>
            <Text style={styles.headerSubtitle}>Set target scores and see how many points you need</Text>

            {/* Daily Comparisons - 2 per row */}
            <View style={styles.dailyContainer}>
              <View style={styles.row}>
                {renderDayComponent('unitDay', 'Unit Day')}
                {renderDayComponent('summonDay', 'Summon Day')}
              </View>
              
              <View style={styles.row}>
                {renderDayComponent('witchDay', 'Witch Day')}
                {renderDayComponent('gerDay', 'Ger Day')}
              </View>
              
              <View style={styles.row}>
                {renderDayComponent('dragonDay', 'Dragon Day')}
                {renderDayComponent('heroDay', 'Hero Day')}
              </View>
            </View>

            {/* Weekly Total Component */}
            <View style={[
              styles.weeklyComponent, 
              weeklyScore.targetScore.length > 0 && styles.weeklyComponentWithTarget
            ]}>
              <Text style={styles.weeklyTitle}>Weekly Total</Text>
              
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Current Weekly Total:</Text>
                <Text style={styles.currentScore}>{formatNumber(weeklyScore.currentTotal)}</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Target Weekly Score:</Text>
                <TextInput
                  style={styles.targetInput}
                  keyboardType="numeric"
                  value={weeklyScore.targetScore}
                  onChangeText={(value) => calculateWeeklyDifference(value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </View>

              {weeklyScore.targetScore.length > 0 && (
                <View style={styles.resultsContainer}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Difference:</Text>
                    <Text style={[
                      styles.resultValue,
                      weeklyScore.difference >= 0 ? styles.positiveValue : styles.negativeValue
                    ]}>
                      {weeklyScore.difference >= 0 ? '+' : ''}{formatNumber(weeklyScore.difference)}
                    </Text>
                  </View>
                  
                  {weeklyScore.pointsNeeded > 0 ? (
                    <View style={styles.resultRow}>
                      <Text style={styles.needLabel}>Points Needed:</Text>
                      <Text style={styles.needValue}>{formatNumber(weeklyScore.pointsNeeded)}</Text>
                    </View>
                  ) : (
                    <Text style={styles.achievedText}>🎉 Weekly Target Achieved!</Text>
                  )}
                </View>
              )}
            </View>

            {/* Refresh Button */}
            <TouchableOpacity style={styles.refreshButton} onPress={loadSavedScores}>
              <Text style={styles.refreshButtonText}>🔄 Refresh Current Scores</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 90,
  },
  headerTitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 28,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dailyContainer: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dayComponent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  dayComponentWithTarget: {
    backgroundColor: 'rgba(255, 255, 150, 0.9)',
    borderColor: 'rgba(255, 215, 0, 0.8)',
  },
  dayTitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontFamily: 'MedievalSharp',
    fontSize: 12,
    color: '#666666',
  },
  currentScore: {
    fontFamily: 'MedievalSharp',
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: 'MedievalSharp',
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  targetInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  resultsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultLabel: {
    fontFamily: 'MedievalSharp',
    fontSize: 12,
    color: '#333333',
  },
  resultValue: {
    fontFamily: 'MedievalSharp',
    fontSize: 12,
    fontWeight: 'bold',
  },
  positiveValue: {
    color: '#ff6b6b',
  },
  negativeValue: {
    color: '#51cf66',
  },
  needLabel: {
    fontFamily: 'MedievalSharp',
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  needValue: {
    fontFamily: 'MedievalSharp',
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  achievedText: {
    fontFamily: 'MedievalSharp',
    fontSize: 12,
    color: '#51cf66',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  weeklyComponent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 24,
  },
  weeklyComponentWithTarget: {
    backgroundColor: 'rgba(255, 255, 150, 0.9)',
    borderColor: 'rgba(255, 215, 0, 0.8)',
  },
  weeklyTitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 20,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: 'rgba(0, 150, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 150, 255, 0.9)',
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});