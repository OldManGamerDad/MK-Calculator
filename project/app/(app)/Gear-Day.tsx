import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Image, 
  ImageBackground,
  Platform,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import InfoTabs from '@/components/InfoTabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

interface ResourceScore {
  nameKey: string;
  value: string;
  pointsPerUnit: number;
  batchSize: number;
  image: string;
}

export default function GearDayScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [startingScore, setStartingScore] = useState<string>('');
  
  // Post-save overlay states
  const [showPostSaveOverlay, setShowPostSaveOverlay] = useState(false);
  const [postSaveAnimation] = useState(new Animated.Value(0));
  const [savedTotalScore, setSavedTotalScore] = useState(0);
  
  // Compare overlay states
  const [showCompareOverlay, setShowCompareOverlay] = useState(false);
  const [overlayAnimation] = useState(new Animated.Value(400));
  const [gearCompareScore, setGearCompareScore] = useState({
    currentScore: 0,
    targetScore: '',
    difference: 0,
    pointsNeeded: 0,
  });
  
  const [resources, setResources] = useState<Record<string, ResourceScore>>({
    forgeHammer: { 
      nameKey: 'gearDay.forgeHammer', 
      value: '', 
      pointsPerUnit: 100,
      batchSize: 1,
      image: 'https://iili.io/doRwcKv.png'
    },
    galleryShards: { 
      nameKey: 'gearDay.galleryShards', 
      value: '', 
      pointsPerUnit: 1000,
      batchSize: 1,
      image: 'https://iili.io/doRwhVs.png'
    },
  });

  const [loading, setLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [savedScores, setSavedScores] = useState<any>(null);

  // Get current week number
  const getWeekNumber = () => {
    const now = new Date();
    return Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7));
  };

  const loadSavedScores = async () => {
    try {
      const weekNumber = getWeekNumber();
      const storageKey = `scores_week_${weekNumber}`;
      const savedData = await AsyncStorage.getItem(storageKey);
      
      if (savedData) {
        setSavedScores(JSON.parse(savedData));
      } else {
        setSavedScores(null);
      }
    } catch (error) {
      console.error('Error loading scores:', error);
    }
  };

  // Post-save overlay functions
  const showPostSaveOverlayWithAnimation = () => {
    setShowPostSaveOverlay(true);
    Animated.timing(postSaveAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hidePostSaveOverlay = () => {
    Animated.timing(postSaveAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowPostSaveOverlay(false);
    });
  };

  const handleCompareDay = () => {
    hidePostSaveOverlay();
    // Load current score for comparison
    loadGearCompareScore();
    setShowCompareOverlay(true);
    Animated.timing(overlayAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCompareWeek = () => {
    hidePostSaveOverlay();
    router.push('/Compare-Scores' as any); // ✅ Fixed: Removed /(app)/ prefix
  };

  // Compare overlay functions
  const loadGearCompareScore = async () => {
    try {
      const weekNumber = getWeekNumber();
      const storageKey = `scores_week_${weekNumber}`;
      const savedData = await AsyncStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setGearCompareScore(prev => ({
          ...prev,
          currentScore: parsedData.gear_day_score || 0,
        }));
      }
    } catch (error) {
      console.error('Error loading gear score:', error);
    }
  };

  const calculateGearComparison = (targetValue: string) => {
    const target = parseInt(targetValue) || 0;
    const difference = target - gearCompareScore.currentScore;
    const pointsNeeded = difference > 0 ? difference : 0;

    setGearCompareScore(prev => ({
      ...prev,
      targetScore: targetValue,
      difference,
      pointsNeeded,
    }));
  };

  const toggleCompareOverlay = () => {
    if (showCompareOverlay) {
      Animated.timing(overlayAnimation, {
        toValue: 400,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowCompareOverlay(false);
      });
    }
  };

  const navigateToFullCompare = () => {
    router.push('/Compare-Scores' as any); // ✅ Fixed: Removed /(app)/ prefix
  };

  const calculateResourceScore = (resource: ResourceScore) => {
    const value = parseInt(resource.value) || 0;
    const batches = Math.floor(value / resource.batchSize);
    return batches * resource.pointsPerUnit;
  };

  // Calculate resource total separately
  const calculateResourceTotal = () => {
    return Object.values(resources).reduce((total, resource) => {
      return total + calculateResourceScore(resource);
    }, 0);
  };

  // Calculate total score including starting score
  const calculateTotalScore = () => {
    const resourceTotal = calculateResourceTotal();
    const starting = parseInt(startingScore) || 0;
    return starting + resourceTotal;
  };

  const handleResourceChange = (key: string, value: string) => {
    setResources(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: value.replace(/[^0-9]/g, ''),
      },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const total = calculateTotalScore();
      const weekNumber = getWeekNumber();
      const storageKey = `scores_week_${weekNumber}`;

      // Get existing scores for this week
      const existingScoresString = await AsyncStorage.getItem(storageKey);
      const existingScores = existingScoresString ? JSON.parse(existingScoresString) : {};

      // Save both gear day score and starting score
      const updatedScores = {
        ...existingScores,
        gear_day_score: total,
        gear_day_starting_score: parseInt(startingScore) || 0,
        last_updated: new Date().toISOString()
      };

      // Save back to device storage
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedScores));

      setSavedTotalScore(total);
      Alert.alert(t('common.success'), t('gearDay.scoreSaved'));
      
      // Load the saved data to show it worked
      await loadSavedScores();
      
      // Clear the form but keep starting score
      setResources(prev => {
        const reset = { ...prev };
        Object.keys(reset).forEach(key => {
          reset[key] = { ...reset[key], value: '' };
        });
        return reset;
      });
      setSelectedResource(null);

      // Show post-save overlay
      showPostSaveOverlayWithAnimation();
    } catch (error) {
      console.error('Error saving score:', error);
      Alert.alert(t('common.error'), t('gearDay.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewScores = () => {
    router.push('/(app)/WeeklyScores'); // Navigate to weekly scores page
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
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
            <View style={styles.headerContainer}>
              <Image 
                source={{ uri: 'https://iili.io/3Wsd5ZX.png' }}
                style={styles.headerImage}
                resizeMode="contain"
              />
            </View>

            {/* Starting Score Section */}
            <View style={styles.startingScoreContainer}>
              <View style={styles.startingScoreHeader}>
                <Text style={styles.startingScoreTitle}>Current Total Score</Text>
                <Text style={styles.startingScoreSubtitle}>Enter your current score as of today</Text>
              </View>
              
              <View style={styles.startingScoreInputContainer}>
                <TextInput
                  style={styles.startingScoreInput}
                  keyboardType="numeric"
                  value={startingScore}
                  onChangeText={(value) => setStartingScore(value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity 
                  style={styles.clearStartingButton}
                  onPress={() => setStartingScore('')}
                >
                  <Text style={styles.clearButtonText}>C</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.startingScoreDisplay}>
                Starting Score: {formatNumber(parseInt(startingScore) || 0)}
              </Text>
            </View>
            
            <View style={styles.resourcesContainer}>
              {Object.entries(resources).map(([key, resource]) => (
                <TouchableOpacity 
                  key={key} 
                  style={[
                    styles.resourceCard,
                    selectedResource === key && styles.selectedResourceCard
                  ]}
                  onPress={() => setSelectedResource(key)}
                >
                  <Image 
                    source={{ uri: resource.image }}
                    style={styles.resourceImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.resourceName}>{t(resource.nameKey)}</Text>
                  <TextInput
                    style={styles.input}
                    value={resource.value}
                    onChangeText={(value) => handleResourceChange(key, value)}
                    keyboardType="numeric"
                    placeholder={t('gearDay.enterAmount')}
                    placeholderTextColor="#666"
                  />
                  <Text style={styles.pointsText}>
                    {t('gearDay.points')}: {formatNumber(calculateResourceScore(resource))}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Total Container with breakdown */}
            <View style={styles.totalContainer}>
              <View style={styles.totalBreakdown}>
                <Text style={styles.breakdownText}>
                  Starting: {formatNumber(parseInt(startingScore) || 0)}
                </Text>
                <Text style={styles.breakdownText}>
                  + Resources: {formatNumber(calculateResourceTotal())}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total:</Text>
                <Text style={styles.totalValue}>{formatNumber(calculateTotalScore())}</Text>
              </View>
            </View>

            {/* Inline Button Container */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.inlineButton, styles.saveButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.inlineButtonText}>
                  {loading ? t('common.saving') : t('gearDay.saveScore')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inlineButton, styles.viewButton]}
                onPress={handleViewScores}
              >
                <Text style={styles.inlineButtonText}>
                  {t('gearDay.viewScore')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Saved scores to show starting score */}
            {savedScores && (
              <View style={styles.savedScoresContainer}>
                <Text style={styles.savedScoresTitle}>📱 {t('gearDay.savedOnDevice')}:</Text>
                <Text style={styles.savedScoresText}>
                  Starting Score: {savedScores.gear_day_starting_score || 0}
                </Text>
                <Text style={styles.savedScoresText}>
                  {t('gearDay.gearDayScore')}: {savedScores.gear_day_score || 0}
                </Text>
                <Text style={styles.savedScoresText}>
                  {t('gearDay.saved')}: {savedScores.last_updated ? new Date(savedScores.last_updated).toLocaleString() : t('gearDay.never')}
                </Text>
                <Text style={styles.savedScoresText}>
                  {t('gearDay.week')}: {getWeekNumber()}
                </Text>
              </View>
            )}

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                💾 {t('gearDay.scoresLocalInfo')}
              </Text>
              <Text style={styles.infoText}>
                🔄 {t('gearDay.dataResetInfo')}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Post-Save Overlay */}
        {showPostSaveOverlay && (
          <Animated.View 
            style={[
              postSaveStyles.overlay,
              {
                opacity: postSaveAnimation,
                transform: [{
                  scale: postSaveAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }]
              }
            ]}
          >
            <View style={postSaveStyles.content}>
              <Text style={postSaveStyles.title}>🎉 Score Saved!</Text>
              <Text style={postSaveStyles.scoreText}>
                Total Score: {formatNumber(savedTotalScore)}
              </Text>
              <Text style={postSaveStyles.subtitle}>
                Would you like to compare your score?
              </Text>
              
              <View style={postSaveStyles.buttonContainer}>
                <TouchableOpacity 
                  style={[postSaveStyles.glowButton, postSaveStyles.compareButton]}
                  onPress={handleCompareDay}
                >
                  <Text style={postSaveStyles.glowButtonText}>Compare Day</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[postSaveStyles.glowButton, postSaveStyles.weekButton]}
                  onPress={handleCompareWeek}
                >
                  <Text style={postSaveStyles.glowButtonText}>Compare Week</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[postSaveStyles.glowButton, postSaveStyles.noButton]}
                  onPress={hidePostSaveOverlay}
                >
                  <Text style={postSaveStyles.glowButtonText}>No Thanks</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Day Compare Overlay */}
        {showCompareOverlay && (
          <Animated.View 
            style={[
              compareStyles.overlay,
              {
                transform: [{ translateX: overlayAnimation }]
              }
            ]}
          >
            <View style={compareStyles.overlayContent}>
              <Text style={compareStyles.overlayTitle}>Gear Day Quick Compare</Text>
              
              <View style={[
                compareStyles.gearComponent,
                gearCompareScore.targetScore.length > 0 && compareStyles.gearComponentWithTarget
              ]}>
                <Text style={compareStyles.gearTitle}>Gear Day</Text>
                
                <View style={compareStyles.scoreRow}>
                  <Text style={compareStyles.scoreLabel}>Current Score:</Text>
                  <Text style={compareStyles.currentScore}>{formatNumber(gearCompareScore.currentScore)}</Text>
                </View>

                <View style={compareStyles.inputContainer}>
                  <Text style={compareStyles.inputLabel}>Target Score:</Text>
                  <TextInput
                    style={compareStyles.targetInput}
                    keyboardType="numeric"
                    value={gearCompareScore.targetScore}
                    onChangeText={(value) => calculateGearComparison(value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    placeholderTextColor="#666"
                  />
                </View>

                {gearCompareScore.targetScore.length > 0 && (
                  <View style={compareStyles.resultsContainer}>
                    <View style={compareStyles.resultRow}>
                      <Text style={compareStyles.resultLabel}>Difference:</Text>
                      <Text style={[
                        compareStyles.resultValue,
                        gearCompareScore.difference >= 0 ? compareStyles.positiveValue : compareStyles.negativeValue
                      ]}>
                        {gearCompareScore.difference >= 0 ? '+' : ''}{formatNumber(gearCompareScore.difference)}
                      </Text>
                    </View>
                    
                    {gearCompareScore.pointsNeeded > 0 ? (
                      <View style={compareStyles.resultRow}>
                        <Text style={compareStyles.needLabel}>Points Needed:</Text>
                        <Text style={compareStyles.needValue}>{formatNumber(gearCompareScore.pointsNeeded)}</Text>
                      </View>
                    ) : (
                      <Text style={compareStyles.achievedText}>🎉 Target Achieved!</Text>
                    )}
                  </View>
                )}
              </View>

              <View style={compareStyles.buttonContainer}>
                <TouchableOpacity 
                  style={compareStyles.weekCompareButton}
                  onPress={navigateToFullCompare}
                >
                  <Text style={compareStyles.weekCompareButtonText}>📊 Compare Week</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={compareStyles.closeButton}
                  onPress={toggleCompareOverlay}
                >
                  <Text style={compareStyles.closeButtonText}>✕ Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
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
    padding: 16,
    paddingTop: 90,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 12,
  },
  headerImage: {
    width: 200,
    height: 100,
  },
  // Starting Score Styles
  startingScoreContainer: {
    backgroundColor: 'rgba(0, 100, 200, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 100, 200, 0.5)',
  },
  startingScoreHeader: {
    marginBottom: 12,
  },
  startingScoreTitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  startingScoreSubtitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  startingScoreInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  startingScoreInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'MedievalSharp',
  },
  clearStartingButton: {
    backgroundColor: 'rgba(255, 77, 77, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.9)',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  startingScoreDisplay: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  resourcesContainer: {
    gap: 16,
  },
  resourceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(51, 51, 51, 0.7)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedResourceCard: {
    borderColor: 'rgba(255, 204, 0, 0.9)',
    backgroundColor: 'rgba(58, 42, 42, 0.6)',
  },
  resourceImage: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginBottom: 12,
  },
  resourceName: {
    fontSize: 18,
    fontFamily: 'MedievalSharp',
    textAlign: 'center',
    marginBottom: 12,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    color: '#000000',
  },
  pointsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ffffff',
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  totalContainer: {
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 204, 0, 0.5)',
  },
  // Total breakdown styles
  totalBreakdown: {
    marginBottom: 8,
  },
  breakdownText: {
    fontFamily: 'MedievalSharp',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  totalValue: {
    color: '#ffcc00',
    fontSize: 24,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  inlineButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  saveButton: {
    backgroundColor: 'rgba(255, 204, 0, 0.8)',
    borderColor: 'rgba(255, 204, 0, 0.9)',
  },
  viewButton: {
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
    borderColor: 'rgba(255, 165, 0, 0.9)',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(102, 102, 102, 0.7)',
    borderColor: 'rgba(102, 102, 102, 0.9)',
  },
  inlineButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  savedScoresContainer: {
    backgroundColor: 'rgba(0, 150, 0, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 150, 0, 0.5)',
  },
  savedScoresTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'MedievalSharp',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  savedScoresText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

// Post-Save Overlay Styles
const postSaveStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 300,
  },
  content: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    fontFamily: 'MedievalSharp',
    fontSize: 28,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  scoreText: {
    fontFamily: 'MedievalSharp',
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 25,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    gap: 15,
    alignItems: 'center',
  },
  glowButton: {
    backgroundColor: 'transparent',
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgb(255, 255, 0)',
    shadowColor: 'rgb(255, 255, 0)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 15,
    position: 'relative',
    minWidth: 160,
    ...Platform.select({
      ios: {
        shadowColor: 'rgb(255, 255, 0)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  compareButton: {},
  weekButton: {},
  noButton: {},
  glowButtonText: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgb(255, 255, 0)',
    textShadowColor: 'rgb(255, 255, 0)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});

// Compare Overlay Styles
const compareStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 320,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 200,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 20,
  },
  overlayContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  overlayTitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 22,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gearComponent: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
  },
  gearComponentWithTarget: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.6)',
  },
  gearTitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    color: '#ffffff',
    opacity: 0.8,
  },
  currentScore: {
    fontFamily: 'MedievalSharp',
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: 'MedievalSharp',
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 4,
    opacity: 0.8,
  },
  targetInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  resultsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#ffffff',
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
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 20,
  },
  weekCompareButton: {
    backgroundColor: 'rgba(0, 150, 255, 0.8)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 150, 255, 0.9)',
  },
  weekCompareButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 77, 77, 0.8)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 77, 77, 0.9)',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});