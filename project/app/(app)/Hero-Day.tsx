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
import { useTranslation } from 'react-i18next';
import InfoTabs from '@/components/InfoTabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react-native';

interface RHeroScore {
  nameKey: string;
  value: string;
  pointsPerUnit: number;
  image: string;
  cardImage: string;
}

interface SRHeroScore {
  nameKey: string;
  value: string;
  pointsPerUnit: number;
  image: string;
  cardImage: string;
}

interface SSRHeroScore {
  nameKey: string;
  value: string;
  pointsPerUnit: number;
  image: string;
  cardImage: string;
}

interface ResourceScore {
  nameKey: string;
  value: string;
  pointsPerUnit: number;
  image: string;
}

export default function HeroDayScreen() {
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
  const [heroCompareScore, setHeroCompareScore] = useState({
    currentScore: 0,
    targetScore: '',
    difference: 0,
    pointsNeeded: 0,
  });
  
  const [nHeroCards, setNHeroCards] = useState<ResourceScore>({
    nameKey: 'heroDay.nHeroCards',
    value: '',
    pointsPerUnit: 100,
    image: 'https://iili.io/dxysGpf.png',
  });

  const [rHeroCards, setRHeroCards] = useState<Record<string, RHeroScore>>({
    peter: {
      nameKey: 'heroDay.heroes.peter',
      value: '',
      pointsPerUnit: 700,
      image: 'https://iili.io/dIcNVHJ.png',
      cardImage: 'https://iili.io/dxys17s.png',
    },
    etley: {
      nameKey: 'heroDay.heroes.etley',
      value: '',
      pointsPerUnit: 700,
      image: 'https://iili.io/dIcNWAv.png',
      cardImage: 'https://iili.io/dxys17s.png',
    },
    anton: {
      nameKey: 'heroDay.heroes.anton',
      value: '',
      pointsPerUnit: 700,
      image: 'https://iili.io/dIcwfB1.png',
      cardImage: 'https://iili.io/dxys17s.png',
    },
  });

  const [srHeroCards, setSRHeroCards] = useState<Record<string, SRHeroScore>>({
    kris: {
      nameKey: 'heroDay.heroes.kris',
      value: '',
      pointsPerUnit: 3500,
      image: 'https://iili.io/3u8jmWF.png',
      cardImage: 'https://iili.io/dxys02n.png',
    },
    harold: {
      nameKey: 'heroDay.heroes.harold',
      value: '',
      pointsPerUnit: 3500,
      image: 'https://iili.io/3u8jbx1.png',
      cardImage: 'https://iili.io/dxys02n.png',
    },
    arwyn: {
      nameKey: 'heroDay.heroes.arwyn',
      value: '',
      pointsPerUnit: 3500,
      image: 'https://iili.io/3u8w9fa.png',
      cardImage: 'https://iili.io/dxys02n.png',
    },
    merlin: {
      nameKey: 'heroDay.heroes.merlin',
      value: '',
      pointsPerUnit: 3500,
      image: 'https://iili.io/3u8w2JR.png',
      cardImage: 'https://iili.io/dxys02n.png',
    },
    samar: {
      nameKey: 'heroDay.heroes.samar',
      value: '',
      pointsPerUnit: 3500,
      image: 'https://iili.io/3u8wH0J.png',
      cardImage: 'https://iili.io/dxys02n.png',
    },
    alucard: {
      nameKey: 'heroDay.heroes.alucard',
      value: '',
      pointsPerUnit: 3500,
      image: 'https://iili.io/3u8wJUv.png',
      cardImage: 'https://iili.io/dxys02n.png',
    },
    ophelia: {
      nameKey: 'heroDay.heroes.ophelia',
      value: '',
      pointsPerUnit: 3500,
      image: 'https://iili.io/3u8jpig.png',
      cardImage: 'https://iili.io/dxys02n.png',
    },
  });

  const [ssrHeroCards, setSSRHeroCards] = useState<Record<string, SSRHeroScore>>({
    ssrHero1: {
      nameKey: 'heroDay.ssrHero1',
      value: '',
      pointsPerUnit: 14000,
      image: 'https://iili.io/dxysEkG.png',
      cardImage: 'https://iili.io/dxysEkG.png',
    }
  });

  const [galleryShards, setGalleryShards] = useState<ResourceScore>({
    nameKey: 'heroDay.galleryShards',
    value: '',
    pointsPerUnit: 1000,
    image: 'https://iili.io/dxyYu72.png',
  });

  const [loading, setLoading] = useState(false);
  const [isRHeroExpanded, setIsRHeroExpanded] = useState(false);
  const [isSRHeroExpanded, setIsSRHeroExpanded] = useState(false);
  const [isSSRHeroExpanded, setIsSSRHeroExpanded] = useState(false);
  const [savedScores, setSavedScores] = useState<any>(null);

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
    loadHeroCompareScore();
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
  const loadHeroCompareScore = async () => {
    try {
      const weekNumber = getWeekNumber();
      const storageKey = `scores_week_${weekNumber}`;
      const savedData = await AsyncStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setHeroCompareScore(prev => ({
          ...prev,
          currentScore: parsedData.hero_day_score || 0,
        }));
      }
    } catch (error) {
      console.error('Error loading hero score:', error);
    }
  };

  const calculateHeroComparison = (targetValue: string) => {
    const target = parseInt(targetValue) || 0;
    const difference = target - heroCompareScore.currentScore;
    const pointsNeeded = difference > 0 ? difference : 0;

    setHeroCompareScore(prev => ({
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

  // Calculation functions
  const calculateNHeroScore = () => {
    const value = parseInt(nHeroCards.value) || 0;
    return value * nHeroCards.pointsPerUnit;
  };

  const calculateRHeroScore = (hero: RHeroScore) => {
    const value = parseInt(hero.value) || 0;
    return value * hero.pointsPerUnit;
  };

  const calculateSRHeroScore = (hero: SRHeroScore) => {
    const value = parseInt(hero.value) || 0;
    return value * hero.pointsPerUnit;
  };

  const calculateSSRHeroScore = (hero: SSRHeroScore) => {
    const value = parseInt(hero.value) || 0;
    return value * hero.pointsPerUnit;
  };

  const calculateGalleryShardsScore = () => {
    const value = parseInt(galleryShards.value) || 0;
    return value * galleryShards.pointsPerUnit;
  };

  const calculateTotalRHeroScore = () => {
    return Object.values(rHeroCards).reduce((total, hero) => {
      return total + calculateRHeroScore(hero);
    }, 0);
  };

  const calculateTotalSRHeroScore = () => {
    return Object.values(srHeroCards).reduce((total, hero) => {
      return total + calculateSRHeroScore(hero);
    }, 0);
  };

  const calculateTotalSSRHeroScore = () => {
    return Object.values(ssrHeroCards).reduce((total, hero) => {
      return total + calculateSSRHeroScore(hero);
    }, 0);
  };

  const calculateResourceTotal = () => {
    return (
      calculateNHeroScore() +
      calculateTotalRHeroScore() +
      calculateTotalSRHeroScore() +
      calculateTotalSSRHeroScore() +
      calculateGalleryShardsScore()
    );
  };

  const calculateTotalScore = () => {
    const resourceTotal = calculateResourceTotal();
    const starting = parseInt(startingScore) || 0;
    return starting + resourceTotal;
  };

  // Input handlers
  const handleNHeroChange = (value: string) => {
    setNHeroCards(prev => ({
      ...prev,
      value: value.replace(/[^0-9]/g, ''),
    }));
  };

  const handleRHeroChange = (heroKey: string, value: string) => {
    setRHeroCards(prev => ({
      ...prev,
      [heroKey]: {
        ...prev[heroKey],
        value: value.replace(/[^0-9]/g, ''),
      },
    }));
  };

  const handleSRHeroChange = (heroKey: string, value: string) => {
    setSRHeroCards(prev => ({
      ...prev,
      [heroKey]: {
        ...prev[heroKey],
        value: value.replace(/[^0-9]/g, ''),
      },
    }));
  };

  const handleSSRHeroChange = (heroKey: string, value: string) => {
    setSSRHeroCards(prev => ({
      ...prev,
      [heroKey]: {
        ...prev[heroKey],
        value: value.replace(/[^0-9]/g, ''),
      },
    }));
  };

  const handleGalleryShardsChange = (value: string) => {
    setGalleryShards(prev => ({
      ...prev,
      value: value.replace(/[^0-9]/g, ''),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const total = calculateTotalScore();
      const weekNumber = getWeekNumber();
      const storageKey = `scores_week_${weekNumber}`;

      const existingScoresString = await AsyncStorage.getItem(storageKey);
      const existingScores = existingScoresString ? JSON.parse(existingScoresString) : {};

      const updatedScores = {
        ...existingScores,
        hero_day_score: total,
        hero_day_starting_score: parseInt(startingScore) || 0,
        last_updated: new Date().toISOString()
      };

      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedScores));

      setSavedTotalScore(total);
      Alert.alert(t('common.success'), t('heroDay.scoreSaved'));
      
      await loadSavedScores();
      
      // Clear the form but keep starting score
      setNHeroCards(prev => ({ ...prev, value: '' }));
      setRHeroCards(prev => {
        const reset = { ...prev };
        Object.keys(reset).forEach(key => {
          reset[key] = { ...reset[key], value: '' };
        });
        return reset;
      });
      setSRHeroCards(prev => {
        const reset = { ...prev };
        Object.keys(reset).forEach(key => {
          reset[key] = { ...reset[key], value: '' };
        });
        return reset;
      });
      setSSRHeroCards(prev => {
        const reset = { ...prev };
        Object.keys(reset).forEach(key => {
          reset[key] = { ...reset[key], value: '' };
        });
        return reset;
      });
      setGalleryShards(prev => ({ ...prev, value: '' }));

      // Show post-save overlay
      showPostSaveOverlayWithAnimation();
    } catch (error) {
      console.error('Error saving score:', error);
      Alert.alert(t('common.error'), t('heroDay.saveError'));
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
              <Text style={styles.title}>{t('heroDay.title')}</Text>
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

            <View style={styles.resourcesGrid}>
              <View style={styles.resourceCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: nHeroCards.image }}
                      style={styles.resourceImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.headerContent}>
                    <Text style={styles.resourceName}>{t(nHeroCards.nameKey)}</Text>
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>
                        {formatNumber(nHeroCards.pointsPerUnit)} Points Each
                      </Text>
                    </View>
                  </View>
                </View>

                <TextInput
                  style={styles.resourceInput}
                  keyboardType="numeric"
                  value={nHeroCards.value}
                  onChangeText={handleNHeroChange}
                  placeholder="Enter Amount"
                  placeholderTextColor="#666"
                />

                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Score:</Text>
                  <Text style={styles.scoreValue}>
                    {formatNumber(calculateNHeroScore())}
                  </Text>
                </View>
              </View>

              <View style={styles.resourceCard}>
                <TouchableOpacity 
                  onPress={() => setIsRHeroExpanded(!isRHeroExpanded)}
                  style={styles.cardHeader}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: 'https://iili.io/dxys17s.png' }}
                      style={styles.resourceImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.headerContent}>
                    <Text style={styles.resourceName}>R Hero Cards</Text>
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>700 Points Each</Text>
                    </View>
                  </View>
                  {isRHeroExpanded ? (
                    <ChevronUp size={24} color="#ffffff" />
                  ) : (
                    <ChevronDown size={24} color="#ffffff" />
                  )}
                </TouchableOpacity>

                {isRHeroExpanded && (
                  <View style={styles.expandedContent}>
                    {Object.entries(rHeroCards).map(([key, hero]) => (
                      <View key={key} style={styles.heroItem}>
                        <View style={styles.heroHeader}>
                          <View style={styles.imageContainer}>
                            <Image
                              source={{ uri: hero.image }}
                              style={styles.resourceImage}
                              resizeMode="contain"
                            />
                          </View>
                          <View style={styles.headerContent}>
                            <Text style={styles.resourceName}>{t(hero.nameKey)}</Text>
                            <View style={styles.pointsBadge}>
                              <Text style={styles.pointsText}>
                                {formatNumber(hero.pointsPerUnit)} Points Each
                              </Text>
                            </View>
                          </View>
                        </View>

                        <TextInput
                          style={styles.resourceInput}
                          keyboardType="numeric"
                          value={hero.value}
                          onChangeText={(value) => handleRHeroChange(key, value)}
                          placeholder="Enter Amount"
                          placeholderTextColor="#666"
                        />

                        <View style={styles.scoreContainer}>
                          <Text style={styles.scoreLabel}>Score:</Text>
                          <Text style={styles.scoreValue}>
                            {formatNumber(calculateRHeroScore(hero))}
                          </Text>
                        </View>
                      </View>
                    ))}

                    <View style={styles.totalContainer}>
                      <Text style={styles.totalLabel}>Total R Hero Score:</Text>
                      <Text style={styles.totalValue}>
                        {formatNumber(calculateTotalRHeroScore())}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.resourceCard}>
                <TouchableOpacity 
                  onPress={() => setIsSRHeroExpanded(!isSRHeroExpanded)}
                  style={styles.cardHeader}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: 'https://iili.io/dxys02n.png' }}
                      style={styles.resourceImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.headerContent}>
                    <Text style={styles.resourceName}>SR Hero Cards</Text>
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>3,500 Points Each</Text>
                    </View>
                  </View>
                  {isSRHeroExpanded ? (
                    <ChevronUp size={24} color="#ffffff" />
                  ) : (
                    <ChevronDown size={24} color="#ffffff" />
                  )}
                </TouchableOpacity>

                {isSRHeroExpanded && (
                  <View style={styles.expandedContent}>
                    {Object.entries(srHeroCards).map(([key, hero]) => (
                      <View key={key} style={styles.heroItem}>
                        <View style={styles.heroHeader}>
                          <View style={styles.imageContainer}>
                            <Image
                              source={{ uri: hero.image }}
                              style={styles.resourceImage}
                              resizeMode="contain"
                            />
                          </View>
                          <View style={styles.headerContent}>
                            <Text style={styles.resourceName}>{t(hero.nameKey)}</Text>
                            <View style={styles.pointsBadge}>
                              <Text style={styles.pointsText}>
                                {formatNumber(hero.pointsPerUnit)} Points Each
                              </Text>
                            </View>
                          </View>
                        </View>

                        <TextInput
                          style={styles.resourceInput}
                          keyboardType="numeric"
                          value={hero.value}
                          onChangeText={(value) => handleSRHeroChange(key, value)}
                          placeholder="Enter Amount"
                          placeholderTextColor="#666"
                        />

                        <View style={styles.scoreContainer}>
                          <Text style={styles.scoreLabel}>Score:</Text>
                          <Text style={styles.scoreValue}>
                            {formatNumber(calculateSRHeroScore(hero))}
                          </Text>
                        </View>
                      </View>
                    ))}

                    <View style={styles.totalContainer}>
                      <Text style={styles.totalLabel}>Total SR Hero Score:</Text>
                      <Text style={styles.totalValue}>
                        {formatNumber(calculateTotalSRHeroScore())}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.resourceCard}>
                <TouchableOpacity 
                  onPress={() => setIsSSRHeroExpanded(!isSSRHeroExpanded)}
                  style={styles.cardHeader}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: 'https://iili.io/dxysEkG.png' }}
                      style={styles.resourceImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.headerContent}>
                    <Text style={styles.resourceName}>SSR Hero Cards</Text>
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>14,000 Points Each</Text>
                    </View>
                  </View>
                  {isSSRHeroExpanded ? (
                    <ChevronUp size={24} color="#ffffff" />
                  ) : (
                    <ChevronDown size={24} color="#ffffff" />
                  )}
                </TouchableOpacity>

                {isSSRHeroExpanded && (
                  <View style={styles.expandedContent}>
                    {Object.entries(ssrHeroCards).map(([key, hero]) => (
                      <View key={key} style={styles.heroItem}>
                        <View style={styles.heroHeader}>
                          <View style={styles.imageContainer}>
                            <Image
                              source={{ uri: hero.image }}
                              style={styles.resourceImage}
                              resizeMode="contain"
                            />
                          </View>
                          <View style={styles.headerContent}>
                            <Text style={styles.resourceName}>{t(hero.nameKey)}</Text>
                            <View style={styles.pointsBadge}>
                              <Text style={styles.pointsText}>
                                {formatNumber(hero.pointsPerUnit)} Points Each
                              </Text>
                            </View>
                          </View>
                        </View>

                        <TextInput
                          style={styles.resourceInput}
                          keyboardType="numeric"
                          value={hero.value}
                          onChangeText={(value) => handleSSRHeroChange(key, value)}
                          placeholder="Enter Amount"
                          placeholderTextColor="#666"
                        />

                        <View style={styles.scoreContainer}>
                          <Text style={styles.scoreLabel}>Score:</Text>
                          <Text style={styles.scoreValue}>
                            {formatNumber(calculateSSRHeroScore(hero))}
                          </Text>
                        </View>
                      </View>
                    ))}

                    <View style={styles.totalContainer}>
                      <Text style={styles.totalLabel}>Total SSR Hero Score:</Text>
                      <Text style={styles.totalValue}>
                        {formatNumber(calculateTotalSSRHeroScore())}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.resourceCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: galleryShards.image }}
                      style={styles.resourceImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.headerContent}>
                    <Text style={styles.resourceName}>{t(galleryShards.nameKey)}</Text>
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>
                        {formatNumber(galleryShards.pointsPerUnit)} Points Each
                      </Text>
                    </View>
                  </View>
                </View>

                <TextInput
                  style={styles.resourceInput}
                  keyboardType="numeric"
                  value={galleryShards.value}
                  onChangeText={handleGalleryShardsChange}
                  placeholder="Enter Amount"
                  placeholderTextColor="#666"
                />

                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Score:</Text>
                  <Text style={styles.scoreValue}>
                    {formatNumber(calculateGalleryShardsScore())}
                  </Text>
                </View>
              </View>
            </View>

            {/* Updated Total Score Display with breakdown */}
            <View style={styles.mainTotalContainer}>
              <View style={styles.totalBreakdown}>
                <Text style={styles.breakdownText}>
                  Starting: {formatNumber(parseInt(startingScore) || 0)}
                </Text>
                <Text style={styles.breakdownText}>
                  + Heroes: {formatNumber(calculateResourceTotal())}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.mainTotalLabel}>Grand Total:</Text>
                <Text style={styles.mainTotalValue}>{formatNumber(calculateTotalScore())}</Text>
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
                  {loading ? t('common.saving') : t('heroDay.saveScore')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inlineButton, styles.viewButton]}
                onPress={handleViewScores}
              >
                <Text style={styles.inlineButtonText}>
                  {t('heroDay.viewScore')}
                </Text>
              </TouchableOpacity>
            </View>

            {savedScores && (
              <View style={styles.savedScoresContainer}>
                <Text style={styles.savedScoresTitle}>📱 {t('heroDay.savedOnDevice')}:</Text>
                <Text style={styles.savedScoresText}>
                  Starting Score: {savedScores.hero_day_starting_score || 0}
                </Text>
                <Text style={styles.savedScoresText}>
                  {t('heroDay.heroesDayScore')}: {savedScores.hero_day_score || 0}
                </Text>
                <Text style={styles.savedScoresText}>
                  {t('heroDay.saved')}: {savedScores.last_updated ? new Date(savedScores.last_updated).toLocaleString() : t('heroDay.never')}
                </Text>
                <Text style={styles.savedScoresText}>
                  {t('heroDay.week')}: {getWeekNumber()}
                </Text>
              </View>
            )}

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                💾 {t('heroDay.scoresLocalInfo')}
              </Text>
              <Text style={styles.infoText}>
                🔄 {t('heroDay.dataResetInfo')}
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
              <Text style={compareStyles.overlayTitle}>Hero Day Quick Compare</Text>
              
              <View style={[
                compareStyles.heroComponent,
                heroCompareScore.targetScore.length > 0 && compareStyles.heroComponentWithTarget
              ]}>
                <Text style={compareStyles.heroTitle}>Hero Day</Text>
                
                <View style={compareStyles.scoreRow}>
                  <Text style={compareStyles.scoreLabel}>Current Score:</Text>
                  <Text style={compareStyles.currentScore}>{formatNumber(heroCompareScore.currentScore)}</Text>
                </View>

                <View style={compareStyles.inputContainer}>
                  <Text style={compareStyles.inputLabel}>Target Score:</Text>
                  <TextInput
                    style={compareStyles.targetInput}
                    keyboardType="numeric"
                    value={heroCompareScore.targetScore}
                    onChangeText={(value) => calculateHeroComparison(value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    placeholderTextColor="#666"
                  />
                </View>

                {heroCompareScore.targetScore.length > 0 && (
                  <View style={compareStyles.resultsContainer}>
                    <View style={compareStyles.resultRow}>
                      <Text style={compareStyles.resultLabel}>Difference:</Text>
                      <Text style={[
                        compareStyles.resultValue,
                        heroCompareScore.difference >= 0 ? compareStyles.positiveValue : compareStyles.negativeValue
                      ]}>
                        {heroCompareScore.difference >= 0 ? '+' : ''}{formatNumber(heroCompareScore.difference)}
                      </Text>
                    </View>
                    
                    {heroCompareScore.pointsNeeded > 0 ? (
                      <View style={compareStyles.resultRow}>
                        <Text style={compareStyles.needLabel}>Points Needed:</Text>
                        <Text style={compareStyles.needValue}>{formatNumber(heroCompareScore.pointsNeeded)}</Text>
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
    height: '100%'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
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
    flex: 1
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
    padding: 12
  },
  headerImage: {
    width: 200,
    height: 100
  },
  title: {
    fontFamily: 'MedievalSharp',
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
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
    gap: 16
  },
  resourceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(51, 51, 51, 0.7)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    gap: 12
  },
  imageContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444'
  },
  resourceImage: {
    width: '100%',
    height: '100%'
  },
  headerContent: {
    flex: 1,
    gap: 4
  },
  resourceName: {
    fontFamily: 'MedievalSharp',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  pointsBadge: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  pointsText: {
    color: '#ffffff',
    fontFamily: 'MedievalSharp',
    fontSize: 14
  },
  resourceInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 12,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    textAlign: 'center'
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12
  },
  scoreLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  scoreValue: {
    color: '#ff6600',
    fontSize: 20,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  expandedContent: {
    padding: 12,
    gap: 16
  },
  heroItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 102, 0, 0.5)'
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 102, 0, 0.5)'
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  totalValue: {
    color: '#ff6600',
    fontSize: 20,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  mainTotalContainer: {
    backgroundColor: 'rgba(255, 102, 0, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 102, 0, 0.5)',
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
  mainTotalLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mainTotalValue: {
    color: '#ff6600',
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
    backgroundColor: 'rgba(255, 102, 0, 0.8)',
    borderColor: 'rgba(255, 102, 0, 0.9)',
  },
  viewButton: {
    backgroundColor: 'rgba(255, 140, 0, 0.8)',
    borderColor: 'rgba(255, 140, 0, 0.9)',
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

// Compare Overlay Styles (keeping the existing ones with white text)
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
  heroComponent: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
  },
  heroComponentWithTarget: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.6)',
  },
  heroTitle: {
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