import { useState } from 'react';
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
  Animated,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InfoTabs from '@/components/InfoTabs';
import { useTranslation } from 'react-i18next';

interface ResourceScore {
  nameKey: string;
  value: string;
  pointsPerUnit: number;
  batchSize: number;
  image: string;
}

export default function UnitDayScreen() {
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
  const [unitCompareScore, setUnitCompareScore] = useState({
    currentScore: 0,
    targetScore: '',
    difference: 0,
    pointsNeeded: 0,
  });
  
  const [resources, setResources] = useState<Record<string, ResourceScore>>({
    tier1: { 
      nameKey: 'unitDay.tier1Tome',
      value: '', 
      pointsPerUnit: 800,
      batchSize: 1,
      image: 'https://iili.io/dxyYM7V.th.png'
    },
    tier2: { 
      nameKey: 'unitDay.tier2Tome',
      value: '', 
      pointsPerUnit: 4000,
      batchSize: 1,
      image: 'https://iili.io/dxyYGdQ.png'
    },
    tier3: { 
      nameKey: 'unitDay.tier3Tome',
      value: '', 
      pointsPerUnit: 20000,
      batchSize: 1,
      image: 'https://iili.io/dxyY1rx.png'
    },
    tier4: { 
      nameKey: 'unitDay.tier4Tome',
      value: '', 
      pointsPerUnit: 100000,
      batchSize: 1,
      image: 'https://iili.io/dxyY01j.png'
    },
    crowns: { 
      nameKey: 'unitDay.crowns',
      value: '', 
      pointsPerUnit: 140,
      batchSize: 5,
      image: 'https://iili.io/dxyYx1f.png'
    },
    talentBooks: { 
      nameKey: 'unitDay.talentBooks',
      value: '', 
      pointsPerUnit: 70,
      batchSize: 25,
      image: 'https://iili.io/dxyYAeS.png'
    },
    galleryShards: { 
      nameKey: 'unitDay.galleryShards',
      value: '', 
      pointsPerUnit: 1000,
      batchSize: 1,
      image: 'https://iili.io/dxyYu72.png'
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

  const calculateResourceScore = (resource: ResourceScore) => {
    const value = parseInt(resource.value) || 0;
    const batches = Math.floor(value / resource.batchSize);
    return batches * resource.pointsPerUnit;
  };

  const calculateResourceTotal = () => {
    return Object.values(resources).reduce((total, resource) => {
      return total + calculateResourceScore(resource);
    }, 0);
  };

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
    loadUnitCompareScore();
    setShowCompareOverlay(true);
    Animated.timing(overlayAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCompareWeek = () => {
    hidePostSaveOverlay();
    router.push('/Compare-Scores' as any);
  };

  // Compare overlay functions
  const loadUnitCompareScore = async () => {
    try {
      const weekNumber = getWeekNumber();
      const storageKey = `scores_week_${weekNumber}`;
      const savedData = await AsyncStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setUnitCompareScore(prev => ({
          ...prev,
          currentScore: parsedData.unit_day_score || 0,
        }));
      }
    } catch (error) {
      console.error('Error loading unit score:', error);
    }
  };

  const calculateUnitComparison = (targetValue: string) => {
    const target = parseInt(targetValue) || 0;
    const difference = target - unitCompareScore.currentScore;
    const pointsNeeded = difference > 0 ? difference : 0;

    setUnitCompareScore(prev => ({
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
    router.push('/Compare-Scores' as any);
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

      // Update with current Unit Day score
      const updatedScores = {
        ...existingScores,
        unit_day_score: total,
        unit_day_starting_score: parseInt(startingScore) || 0,
        last_updated: new Date().toISOString()
      };

      // Save back to device storage
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedScores));

      setSavedTotalScore(total);
      Alert.alert(t('common.success'), t('unitDay.scoreSaved'));
      
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
      Alert.alert(t('common.error'), t('unitDay.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewScores = () => {
    router.push('/(app)/WeeklyScores');
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
          <ArrowLeft size={20} color="#ffffff" strokeWidth={2.5} />
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
                source={{ uri: 'https://iili.io/3WiCCcg.png' }}
                style={styles.headerImage}
                resizeMode="contain"
              />
            </View>

            {/* Starting Score Section */}
            <View style={styles.startingScoreContainer}>
              <View style={styles.startingScoreHeader}>
                <Text style={styles.startingScoreTitle}>{t('unitDay.currentTotalScore')}</Text>
                <Text style={styles.startingScoreSubtitle}>{t('unitDay.enterCurrentScore')}</Text>
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
                  <Text style={styles.clearButtonText}>{t('calculator.clear')}</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.startingScoreDisplay}>
                {t('unitDay.startingScore')}: {formatNumber(parseInt(startingScore) || 0)}
              </Text>
            </View>
            
            <View style={styles.resourcesGrid}>
              {Object.entries(resources).map(([key, resource]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.resourceCard,
                    selectedResource === key && styles.selectedResourceCard
                  ]}
                  onPress={() => setSelectedResource(key)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: resource.image }}
                        style={styles.resourceImage}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.headerContent}>
                      <Text style={styles.resourceName}>{t(resource.nameKey)}</Text>
                      <View style={styles.pointsBadge}>
                        <Text style={styles.pointsText}>
                          {formatNumber(resource.pointsPerUnit)} {t('unitDay.pts')}
                          {resource.batchSize > 1 ? ` / ${resource.batchSize}` : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.resourceInput}
                      keyboardType="numeric"
                      value={resource.value}
                      onChangeText={(value) => handleResourceChange(key, value)}
                      placeholder={`${t('unitDay.enterAmount')}${resource.batchSize > 1 ? ` (${t('unitDay.total')})` : ''}`}
                      placeholderTextColor="#666"
                    />
                    <TouchableOpacity 
                      style={styles.clearResourceButton}
                      onPress={() => handleResourceChange(key, '')}
                    >
                      <Text style={styles.clearResourceText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>{t('common.score')}:</Text>
                    <Text style={styles.scoreValue}>{formatNumber(calculateResourceScore(resource))}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.totalContainer}>
              <View style={styles.totalBreakdown}>
                <Text style={styles.breakdownText}>
                  {t('unitDay.starting')}: {formatNumber(parseInt(startingScore) || 0)}
                </Text>
                <Text style={styles.breakdownText}>
                  + {t('unitDay.resources')}: {formatNumber(calculateResourceTotal())}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('unitDay.grandTotal')}:</Text>
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
                  {loading ? t('common.saving') : t('unitDay.saveScore')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inlineButton, styles.viewButton]}
                onPress={handleViewScores}
              >
                <Text style={styles.inlineButtonText}>
                  {t('unitDay.viewScore')}
                </Text>
              </TouchableOpacity>
            </View>

            {savedScores && (
              <View style={styles.savedScoresContainer}>
                <Text style={styles.savedScoresTitle}>📱 {t('unitDay.savedOnDevice')}:</Text>
                <Text style={styles.savedScoresText}>
                  {t('unitDay.startingScore')}: {savedScores.unit_day_starting_score || 0}
                </Text>
                <Text style={styles.savedScoresText}>
                  {t('unitDay.unitDayScore')}: {savedScores.unit_day_score || 0}
                </Text>
                <Text style={styles.savedScoresText}>
                  {t('unitDay.saved')}: {savedScores.last_updated ? new Date(savedScores.last_updated).toLocaleString() : t('unitDay.never')}
                </Text>
                <Text style={styles.savedScoresText}>
                  {t('unitDay.week')}: {getWeekNumber()}
                </Text>
              </View>
            )}

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                💾 {t('unitDay.scoresLocalInfo')}
              </Text>
              <Text style={styles.infoText}>
                🔄 {t('unitDay.dataResetInfo')}
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
              <Text style={compareStyles.overlayTitle}>Unit Day Quick Compare</Text>
              
              <View style={[
                compareStyles.unitComponent,
                unitCompareScore.targetScore.length > 0 && compareStyles.unitComponentWithTarget
              ]}>
                <Text style={compareStyles.unitTitle}>Unit Day</Text>
                
                <View style={compareStyles.scoreRow}>
                  <Text style={compareStyles.scoreLabel}>Current Score:</Text>
                  <Text style={compareStyles.currentScore}>{formatNumber(unitCompareScore.currentScore)}</Text>
                </View>

                <View style={compareStyles.inputContainer}>
                  <Text style={compareStyles.inputLabel}>Target Score:</Text>
                  <TextInput
                    style={compareStyles.targetInput}
                    keyboardType="numeric"
                    value={unitCompareScore.targetScore}
                    onChangeText={(value) => calculateUnitComparison(value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    placeholderTextColor="#666"
                  />
                </View>

                {unitCompareScore.targetScore.length > 0 && (
                  <View style={compareStyles.resultsContainer}>
                    <View style={compareStyles.resultRow}>
                      <Text style={compareStyles.resultLabel}>Difference:</Text>
                      <Text style={[
                        compareStyles.resultValue,
                        unitCompareScore.difference >= 0 ? compareStyles.positiveValue : compareStyles.negativeValue
                      ]}>
                        {unitCompareScore.difference >= 0 ? '+' : ''}{formatNumber(unitCompareScore.difference)}
                      </Text>
                    </View>
                    
                    {unitCompareScore.pointsNeeded > 0 ? (
                      <View style={compareStyles.resultRow}>
                        <Text style={compareStyles.needLabel}>Points Needed:</Text>
                        <Text style={compareStyles.needValue}>{formatNumber(unitCompareScore.pointsNeeded)}</Text>
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
    top: 35,
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
  headerContainer: {
    width: '100%',
    height: 80,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
  },
  headerImage: {
    width: '200%',
    height: '400%',
    marginRight: 60,
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
  resourcesGrid: {
    gap: 16,
  },
  resourceCard: {
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(51, 51, 51, 0.7)',
  },
  selectedResourceCard: {
    borderColor: 'rgba(255, 77, 77, 0.9)',
    backgroundColor: 'rgba(58, 42, 42, 0.6)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    gap: 12,
  },
  imageContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(68, 68, 68, 0.7)',
  },
  resourceImage: {
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flex: 1,
    gap: 4,
  },
  resourceName: {
    fontFamily: 'MedievalSharp',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointsBadge: {
    backgroundColor: 'rgba(255, 77, 77, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  pointsText: {
    color: '#ffffff',
    fontFamily: 'MedievalSharp',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Input Container Styles
  inputContainer: {
    flexDirection: 'row',
    margin: 12,
    gap: 8,
    alignItems: 'center',
  },
  resourceInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  clearResourceButton: {
    backgroundColor: 'rgba(255, 77, 77, 0.8)',
    borderRadius: 6,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.9)',
  },
  clearResourceText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
  },
  scoreLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreValue: {
    color: '#ff4d4d',
    fontSize: 20,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  totalContainer: {
    backgroundColor: 'rgba(255, 77, 77, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 77, 77, 0.5)',
  },
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
    color: '#ff4d4d',
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
    backgroundColor: 'rgba(255, 77, 77, 0.8)',
    borderColor: 'rgba(255, 77, 77, 0.9)',
  },
  viewButton: {
    backgroundColor: 'rgba(77, 150, 255, 0.8)',
    borderColor: 'rgba(77, 150, 255, 0.9)',
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
    // Inner glow effect
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
  compareButton: {
    // All buttons use the same base style now
  },
  weekButton: {
    // All buttons use the same base style now
  },
  noButton: {
    // All buttons use the same base style now
  },
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
  unitComponent: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
  },
  unitComponentWithTarget: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.6)',
  },
  unitTitle: {
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