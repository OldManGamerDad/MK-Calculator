import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, ImageBackground, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import InfoTabs from '@/components/InfoTabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DragonLevel {
  currentLevel: string;
  completedSections: number[];
  runesOwned: string;
}

interface DragonConfig {
  nameKey: string; // Changed from name to nameKey
  dragonImage: string;
  runeImage: string;
  pointsPerRune: number;
  batchSize: number;
  showSections?: boolean;
}

interface ResourceScore {
  nameKey: string; // Changed from name to nameKey
  value: string;
  pointsPerUnit: number;
  batchSize: number;
  image: string;
}

export default function DragonDayScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  
  // Add starting score state
  const [startingScore, setStartingScore] = useState<string>('');
  
  // Post-save overlay states
  const [showPostSaveOverlay, setShowPostSaveOverlay] = useState(false);
  const [postSaveAnimation] = useState(new Animated.Value(0));
  const [savedTotalScore, setSavedTotalScore] = useState(0);
  
  // Compare overlay states
  const [showCompareOverlay, setShowCompareOverlay] = useState(false);
  const [overlayAnimation] = useState(new Animated.Value(400));
  const [dragonCompareScore, setDragonCompareScore] = useState({
    currentScore: 0,
    targetScore: '',
    difference: 0,
    pointsNeeded: 0,
  });
  
  const dragons: Record<string, DragonConfig> = {
    bronze: {
      nameKey: 'dragonDay.bronzeDragon',
      dragonImage: 'https://iili.io/3TMJCDg.png',
      runeImage: 'https://iili.io/dxyYlqb.png',
      pointsPerRune: 70,
      batchSize: 1,
      showSections: true,
    },
    silver: {
      nameKey: 'dragonDay.silverDragon',
      dragonImage: 'https://iili.io/3TMJoxa.png',
      runeImage: 'https://iili.io/dxyYaLu.png',
      pointsPerRune: 700,
      batchSize: 1,
      showSections: true,
    },
    gold: {
      nameKey: 'dragonDay.goldenDragon',
      dragonImage: 'https://iili.io/3TMJqR1.png',
      runeImage: 'https://iili.io/dxyYYXe.png',
      pointsPerRune: 7000,
      batchSize: 20,
      showSections: true,
    },
    legendary: {
      nameKey: 'dragonDay.legendaryDragon',
      dragonImage: 'https://iili.io/3TMJBOF.png',
      runeImage: 'https://iili.io/dxyY7I9.png',
      pointsPerRune: 14000,
      batchSize: 100,
      showSections: false,
    },
  };

  const [dragonLevels, setDragonLevels] = useState<Record<string, DragonLevel>>({
    bronze: { currentLevel: '', completedSections: [], runesOwned: '' },
    silver: { currentLevel: '', completedSections: [], runesOwned: '' },
    gold: { currentLevel: '', completedSections: [], runesOwned: '' },
    legendary: { currentLevel: '', completedSections: [], runesOwned: '' },
  });

  const [resources, setResources] = useState<Record<string, ResourceScore>>({
    galleryShards: {
      nameKey: 'dragonDay.galleryShards',
      value: '',
      pointsPerUnit: 1000,
      batchSize: 1,
      image: 'https://iili.io/dxyYu72.png',
    },
  });

  const [loading, setLoading] = useState(false);
  const [selectedDragon, setSelectedDragon] = useState<string | null>('bronze');
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
    loadDragonCompareScore();
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
  const loadDragonCompareScore = async () => {
    try {
      const weekNumber = getWeekNumber();
      const storageKey = `scores_week_${weekNumber}`;
      const savedData = await AsyncStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setDragonCompareScore(prev => ({
          ...prev,
          currentScore: parsedData.dragon_day_score || 0,
        }));
      }
    } catch (error) {
      console.error('Error loading dragon score:', error);
    }
  };

  const calculateDragonComparison = (targetValue: string) => {
    const target = parseInt(targetValue) || 0;
    const difference = target - dragonCompareScore.currentScore;
    const pointsNeeded = difference > 0 ? difference : 0;

    setDragonCompareScore(prev => ({
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

  const calculateResourceScore = (resource: ResourceScore) => {
    const value = parseInt(resource.value) || 0;
    const batches = Math.floor(value / resource.batchSize);
    return batches * resource.pointsPerUnit;
  };

  const toggleSection = (dragonType: string, sectionIndex: number) => {
    setDragonLevels(prev => {
      const dragon = prev[dragonType];
      const newSections = dragon.completedSections.includes(sectionIndex)
        ? dragon.completedSections.filter(i => i !== sectionIndex)
        : [...dragon.completedSections, sectionIndex].sort((a, b) => a - b);

      return {
        ...prev,
        [dragonType]: {
          ...dragon,
          completedSections: newSections,
        },
      };
    });
  };

  // Updated calculation to handle multiple level-ups
  const calculatePotentialLevel = (currentLevel: number, completedSections: number[], runesOwned: number, dragonType: string): {
    canLevelUp: boolean;
    runesNeeded: number;
    remainingRunes: number;
    pointsEarned: number;
    levelsGained: number;
    newLevel: number;
    totalRunesUsed: number;
    blockedReason?: string;
  } => {
    if (currentLevel <= 0) {
      return {
        canLevelUp: false,
        runesNeeded: 0,
        remainingRunes: runesOwned,
        pointsEarned: 0,
        levelsGained: 0,
        newLevel: currentLevel,
        totalRunesUsed: 0,
        blockedReason: 'Set dragon level first'
      };
    }

    switch (dragonType) {
      case 'bronze': {
        let tempLevel = currentLevel;
        let tempRunes = runesOwned;
        let totalPoints = 0;
        let totalRunesUsed = 0;
        let levelsGained = 0;

        // Calculate multiple level-ups
        while (tempRunes > 0) {
          const nextLevel = tempLevel + 1;
          const runesNeeded = nextLevel <= 50 ? nextLevel * 5 : 250;
          
          if (tempRunes >= runesNeeded) {
            tempRunes -= runesNeeded;
            totalRunesUsed += runesNeeded;
            totalPoints += runesNeeded * 70;
            tempLevel++;
            levelsGained++;
          } else {
            break;
          }
        }

        const nextLevelCost = tempLevel === currentLevel ? 
          (tempLevel + 1 <= 50 ? (tempLevel + 1) * 5 : 250) : 
          (tempLevel + 1 <= 50 ? (tempLevel + 1) * 5 : 250);

        return {
          canLevelUp: levelsGained > 0,
          runesNeeded: nextLevelCost,
          remainingRunes: tempRunes,
          pointsEarned: totalPoints,
          levelsGained,
          newLevel: tempLevel,
          totalRunesUsed
        };
      }

      case 'silver': {
        const bronzeLevel = parseInt(dragonLevels.bronze?.currentLevel) || 0;
        
        let tempLevel = currentLevel;
        let tempRunes = runesOwned;
        let totalPoints = 0;
        let totalRunesUsed = 0;
        let levelsGained = 0;

        const silverRuneCosts = [
          2, 5, 7, 10, 12, 15, 17, 20, 22, 25, 27, 30, 32, 35, 37, 40, 42, 45, 47, 50,
          52, 55, 57, 60, 62, 65, 67, 70, 72, 75, 77, 80, 82, 85, 87, 90, 92, 95, 97, 100,
          102, 105, 107, 110, 112, 115, 117, 120, 122, 125
        ];

        // Calculate multiple level-ups
        while (tempRunes > 0) {
          const nextLevel = tempLevel + 1;
          const bronzeRequired = nextLevel * 5;
          
          if (bronzeLevel < bronzeRequired) {
            break; // Can't level up due to Bronze requirement
          }
          
          const runesNeeded = nextLevel <= 50 ? (silverRuneCosts[nextLevel - 1] || 125) : 125;
          
          if (tempRunes >= runesNeeded) {
            tempRunes -= runesNeeded;
            totalRunesUsed += runesNeeded;
            totalPoints += runesNeeded * 700;
            tempLevel++;
            levelsGained++;
          } else {
            break;
          }
        }

        if (levelsGained === 0) {
          const nextLevel = currentLevel + 1;
          const bronzeRequired = nextLevel * 5;
          const runesRequired = nextLevel <= 50 ? (silverRuneCosts[nextLevel - 1] || 125) : 125;
          
          if (bronzeLevel < bronzeRequired) {
            return {
              canLevelUp: false,
              runesNeeded: runesRequired,
              remainingRunes: runesOwned,
              pointsEarned: 0,
              levelsGained: 0,
              newLevel: currentLevel,
              totalRunesUsed: 0,
              blockedReason: `Need Bronze level ${bronzeRequired}`
            };
          }
        }

        const nextLevelCost = tempLevel === currentLevel ? 
          (tempLevel + 1 <= 50 ? (silverRuneCosts[tempLevel] || 125) : 125) : 
          (tempLevel + 1 <= 50 ? (silverRuneCosts[tempLevel] || 125) : 125);

        return {
          canLevelUp: levelsGained > 0,
          runesNeeded: nextLevelCost,
          remainingRunes: tempRunes,
          pointsEarned: totalPoints,
          levelsGained,
          newLevel: tempLevel,
          totalRunesUsed
        };
      }

      case 'gold': {
        const silverLevel = parseInt(dragonLevels.silver?.currentLevel) || 0;
        
        let tempLevel = currentLevel;
        let tempRunes = runesOwned;
        let totalPoints = 0;
        let totalRunesUsed = 0;
        let levelsGained = 0;

        // Calculate multiple level-ups
        while (tempRunes > 0) {
          const nextLevel = tempLevel + 1;
          const silverRequired = nextLevel * 100;
          
          if (silverLevel < silverRequired) {
            break; // Can't level up due to Silver requirement
          }
          
          let runesNeeded = 66;
          if (nextLevel <= 24) {
            const goldRuneCosts = [20, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240];
            runesNeeded = goldRuneCosts[nextLevel - 1] || 66;
          }
          
          if (tempRunes >= runesNeeded) {
            tempRunes -= runesNeeded;
            totalRunesUsed += runesNeeded;
            totalPoints += runesNeeded * 7000;
            tempLevel++;
            levelsGained++;
          } else {
            break;
          }
        }

        if (levelsGained === 0) {
          const nextLevel = currentLevel + 1;
          const silverRequired = nextLevel * 100;
          let runesRequired = 66;
          if (nextLevel <= 24) {
            const goldRuneCosts = [20, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240];
            runesRequired = goldRuneCosts[nextLevel - 1] || 66;
          }
          
          if (silverLevel < silverRequired) {
            return {
              canLevelUp: false,
              runesNeeded: runesRequired,
              remainingRunes: runesOwned,
              pointsEarned: 0,
              levelsGained: 0,
              newLevel: currentLevel,
              totalRunesUsed: 0,
              blockedReason: `Need Silver level ${silverRequired}`
            };
          }
        }

        let nextLevelCost = 66;
        if (tempLevel + 1 <= 24) {
          const goldRuneCosts = [20, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240];
          nextLevelCost = goldRuneCosts[tempLevel] || 66;
        }

        return {
          canLevelUp: levelsGained > 0,
          runesNeeded: nextLevelCost,
          remainingRunes: tempRunes,
          pointsEarned: totalPoints,
          levelsGained,
          newLevel: tempLevel,
          totalRunesUsed
        };
      }

      case 'legendary': {
        return {
          canLevelUp: true,
          runesNeeded: runesOwned,
          remainingRunes: 0,
          pointsEarned: runesOwned * 14000,
          levelsGained: 0,
          newLevel: currentLevel,
          totalRunesUsed: runesOwned
        };
      }

      default:
        return {
          canLevelUp: false,
          runesNeeded: 0,
          remainingRunes: runesOwned,
          pointsEarned: 0,
          levelsGained: 0,
          newLevel: currentLevel,
          totalRunesUsed: 0
        };
    }
  };

  // Updated threshold-based dragon scoring with multiple level-ups
  const calculateDragonScore = (dragonType: string, dragon: DragonLevel) => {
    const currentLevel = parseInt(dragon.currentLevel) || 0;
    const runesOwned = parseInt(dragon.runesOwned) || 0;
    
    if (currentLevel === 0 || runesOwned === 0) return 0;

    switch (dragonType) {
      case 'bronze': {
        let tempLevel = currentLevel;
        let tempRunes = runesOwned;
        let totalPoints = 0;

        // Calculate multiple level-ups
        while (tempRunes > 0) {
          const nextLevel = tempLevel + 1;
          const runesNeeded = nextLevel <= 50 ? nextLevel * 5 : 250;
          
          if (tempRunes >= runesNeeded) {
            tempRunes -= runesNeeded;
            totalPoints += runesNeeded * 70;
            tempLevel++;
          } else {
            break;
          }
        }

        return totalPoints;
      }

      case 'silver': {
        const bronzeLevel = parseInt(dragonLevels.bronze?.currentLevel) || 0;
        
        let tempLevel = currentLevel;
        let tempRunes = runesOwned;
        let totalPoints = 0;

        const silverRuneCosts = [
          2, 5, 7, 10, 12, 15, 17, 20, 22, 25, 27, 30, 32, 35, 37, 40, 42, 45, 47, 50,
          52, 55, 57, 60, 62, 65, 67, 70, 72, 75, 77, 80, 82, 85, 87, 90, 92, 95, 97, 100,
          102, 105, 107, 110, 112, 115, 117, 120, 122, 125
        ];

        // Calculate multiple level-ups
        while (tempRunes > 0) {
          const nextLevel = tempLevel + 1;
          const bronzeRequired = nextLevel * 5;
          
          // Check if Bronze Dragon level requirement is met
          if (bronzeLevel < bronzeRequired) {
            break; // Can't level up due to Bronze requirement
          }
          
          const runesNeeded = nextLevel <= 50 ? (silverRuneCosts[nextLevel - 1] || 125) : 125;
          
          if (tempRunes >= runesNeeded) {
            tempRunes -= runesNeeded;
            totalPoints += runesNeeded * 700;
            tempLevel++;
          } else {
            break;
          }
        }

        return totalPoints;
      }

      case 'gold': {
        const silverLevel = parseInt(dragonLevels.silver?.currentLevel) || 0;
        
        let tempLevel = currentLevel;
        let tempRunes = runesOwned;
        let totalPoints = 0;

        // Calculate multiple level-ups
        while (tempRunes > 0) {
          const nextLevel = tempLevel + 1;
          const silverRequired = nextLevel * 100;
          
          // Check if Silver Dragon level requirement is met
          if (silverLevel < silverRequired) {
            break; // Can't level up due to Silver requirement
          }
          
          let runesNeeded = 66;
          if (nextLevel <= 24) {
            const goldRuneCosts = [20, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240];
            runesNeeded = goldRuneCosts[nextLevel - 1] || 66;
          }
          
          if (tempRunes >= runesNeeded) {
            tempRunes -= runesNeeded;
            totalPoints += runesNeeded * 7000;
            tempLevel++;
          } else {
            break;
          }
        }

        return totalPoints;
      }

      case 'legendary': {
        // Legendary dragons use simple multiplication (as in your original code)
        return runesOwned * 14000;
      }

      default:
        return 0;
    }
  };

  // Add function to calculate resource total separately
  const calculateResourceTotal = () => {
    const dragonScores = Object.entries(dragonLevels).reduce((total, [dragonType, dragon]) => {
      return total + calculateDragonScore(dragonType, dragon);
    }, 0);

    const resourceScores = Object.values(resources).reduce((total, resource) => {
      return total + calculateResourceScore(resource);
    }, 0);

    return dragonScores + resourceScores;
  };

  // Update calculateTotalScore to include starting score
  const calculateTotalScore = () => {
    const resourceTotal = calculateResourceTotal();
    const starting = parseInt(startingScore) || 0;
    return starting + resourceTotal;
  };

  const handleDragonChange = (dragonType: string, field: keyof DragonLevel, value: string) => {
    if (field === 'completedSections') return;
    
    setDragonLevels(prev => ({
      ...prev,
      [dragonType]: {
        ...prev[dragonType],
        [field]: value.replace(/[^0-9]/g, ''),
      },
    }));
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

      // Update with current Dragon Day score and starting score
      const updatedScores = {
        ...existingScores,
        dragon_day_score: total,
        dragon_day_starting_score: parseInt(startingScore) || 0,
        last_updated: new Date().toISOString()
      };

      // Save back to device storage
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedScores));

      setSavedTotalScore(total);
      Alert.alert(t('common.success'), t('dragonDay.scoreSaved'));
      
      // Load the saved data to show it worked
      await loadSavedScores();
      
      // Clear the form but keep starting score
      setDragonLevels({
        bronze: { currentLevel: '', completedSections: [], runesOwned: '' },
        silver: { currentLevel: '', completedSections: [], runesOwned: '' },
        gold: { currentLevel: '', completedSections: [], runesOwned: '' },
        legendary: { currentLevel: '', completedSections: [], runesOwned: '' },
      });
      setResources(prev => {
        const reset = { ...prev };
        Object.keys(reset).forEach(key => {
          reset[key] = { ...reset[key], value: '' };
        });
        return reset;
      });

      // Show post-save overlay
      showPostSaveOverlayWithAnimation();
    } catch (error) {
      console.error('Error saving score:', error);
      Alert.alert(t('common.error'), t('dragonDay.saveError'));
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

  const renderSectionBars = (dragonType: string, currentLevel: number) => {
    const dragon = dragonLevels[dragonType];
    const runesPerSection = currentLevel * 5;

    return (
      <View style={styles.sectionBarsContainer}>
        <Text style={styles.sectionLabel}>
          Completed Sections ({runesPerSection} runes per section)
        </Text>
        <View style={styles.sectionBars}>
          {[0, 1, 2, 3, 4].map((index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.sectionBar,
                dragon.completedSections.includes(index) && styles.sectionBarCompleted
              ]}
              onPress={() => toggleSection(dragonType, index)}
              disabled={!currentLevel}
            >
              <Text style={styles.sectionBarText}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderDragonCard = (dragonType: string, config: DragonConfig) => {
    const dragon = dragonLevels[dragonType];
    const currentLevel = parseInt(dragon.currentLevel) || 0;
    const runesOwned = parseInt(dragon.runesOwned) || 0;
    const isSelected = selectedDragon === dragonType;

    // Updated stats display with multiple level-ups
    let stats = null;
    if (currentLevel > 0 && dragonType !== 'legendary') {
      const {
        canLevelUp,
        runesNeeded,
        remainingRunes,
        pointsEarned,
        levelsGained,
        newLevel,
        totalRunesUsed,
        blockedReason
      } = calculatePotentialLevel(currentLevel, dragon.completedSections, runesOwned, dragonType);

      stats = (
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Current Dragon Level</Text>
            <Text style={styles.statValue}>{currentLevel}</Text>
          </View>
          
          {levelsGained > 0 && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>New Dragon Level</Text>
              <Text style={[styles.statValue, styles.successText]}>{newLevel}</Text>
            </View>
          )}
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Next Level Requirement</Text>
            <Text style={styles.statValue}>{runesNeeded.toLocaleString()} Runes</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Runes Owned</Text>
            <Text style={styles.statValue}>{runesOwned.toLocaleString()}</Text>
          </View>
          
          {blockedReason ? (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={[styles.statValue, styles.blockedText]}>{blockedReason}</Text>
            </View>
          ) : canLevelUp ? (
            <>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={[styles.statValue, styles.successText]}>
                  Can level up {levelsGained} time{levelsGained > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Runes Used</Text>
                <Text style={styles.statValue}>{totalRunesUsed.toLocaleString()}</Text>
              </View>
              {remainingRunes > 0 && (
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Remaining Runes</Text>
                  <Text style={[styles.statValue, styles.unusableRunes]}>
                    {remainingRunes.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Points Earned</Text>
                <Text style={[styles.statValue, styles.pointsText]}>
                  {pointsEarned.toLocaleString()}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={[styles.statValue, styles.insufficientText]}>
                Need {(runesNeeded - runesOwned).toLocaleString()} more runes
              </Text>
            </View>
          )}
        </View>
      );
    } else if (dragonType === 'legendary' && runesOwned > 0) {
      stats = (
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Runes Owned</Text>
            <Text style={styles.statValue}>{runesOwned.toLocaleString()}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Points (14,000 per rune):</Text>
            <Text style={[styles.statValue, styles.pointsText]}>
              {(runesOwned * 14000).toLocaleString()}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={dragonType}
        style={[styles.dragonCard, isSelected && styles.selectedDragonCard]}
        onPress={() => setSelectedDragon(dragonType)}
      >
        <View style={styles.headerRow}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: config.dragonImage }}
              style={styles.dragonImage}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t(config.nameKey)}</Text>
            <Text style={styles.subtitle}>
              {config.pointsPerRune.toLocaleString()} pts/rune
              {config.batchSize > 1 ? ` (${config.batchSize}s)` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.inputsRow}>
          <View style={styles.inputContainer}>
            <View style={styles.runeInputHeader}>
              <Text style={styles.label}>Starting Dragon Level</Text>
              <View style={styles.runeImageContainer}>
                <Image
                  source={{ uri: config.dragonImage }}
                  style={styles.runeImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={dragon.currentLevel}
              onChangeText={(value) => handleDragonChange(dragonType, 'currentLevel', value)}
              placeholder="Level"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {config.showSections && currentLevel > 0 && renderSectionBars(dragonType, currentLevel)}

        <View style={styles.inputsRow}>
          <View style={[styles.inputContainer, { flex: 2 }]}>
            <View style={styles.runeInputHeader}>
              <Text style={styles.label}>Dragon Runes Owned</Text>
              <View style={styles.runeImageContainer}>
                <Image
                  source={{ uri: config.runeImage }}
                  style={styles.runeImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={dragon.runesOwned}
              onChangeText={(value) => handleDragonChange(dragonType, 'runesOwned', value)}
              placeholder="Amount"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {stats}

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Dragon Score</Text>
          <Text style={styles.scoreValue}>
            {calculateDragonScore(dragonType, dragon).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderResourceCard = (key: string, resource: ResourceScore) => {
    const isSelected = selectedResource === key;

    return (
      <TouchableOpacity
        key={key}
        style={[styles.resourceCard, isSelected && styles.selectedResourceCard]}
        onPress={() => setSelectedResource(key)}
      >
        <View style={styles.resourceHeader}>
          <View style={styles.resourceImageContainer}>
            <Image
              source={{ uri: resource.image }}
              style={styles.resourceImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.resourceTitleContainer}>
            <Text style={styles.resourceTitle}>{t(resource.nameKey)}</Text>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                {resource.pointsPerUnit.toLocaleString()} Points
                {resource.batchSize > 1 ? ` / ${resource.batchSize}` : ''}
              </Text>
            </View>
          </View>
        </View>

        <TextInput
          style={styles.resourceInput}
          keyboardType="numeric"
          value={resource.value}
          onChangeText={(value) => handleResourceChange(key, value)}
          placeholder="Enter Amount"
          placeholderTextColor="#666"
        />

        <View style={styles.resourceScoreRow}>
          <Text style={styles.resourceScoreLabel}>Score:</Text>
          <Text style={styles.resourceScoreValue}>
            {calculateResourceScore(resource).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
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
            <View style={styles.headerContainer}>
              <Image 
                source={{ uri: 'https://iili.io/3WiP5QI.png' }}
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

            {Object.entries(dragons).map(([dragonType, config]) => 
              renderDragonCard(dragonType, config)
            )}

            {Object.entries(resources).map(([key, resource]) =>
              renderResourceCard(key, resource)
            )}

            {/* Updated Total Score Display with breakdown */}
            <View style={styles.totalContainer}>
              <View style={styles.totalBreakdown}>
                <Text style={styles.breakdownText}>
                  Starting: {formatNumber(parseInt(startingScore) || 0)}
                </Text>
                <Text style={styles.breakdownText}>
                  + Dragons: {formatNumber(calculateResourceTotal())}
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
                  {loading ? t('common.saving') : t('dragonDay.saveScore')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inlineButton, styles.viewButton]}
                onPress={handleViewScores}
              >
                <Text style={styles.inlineButtonText}>
                  {t('dragonDay.viewScore')}
                </Text>
              </TouchableOpacity>
            </View>

            {savedScores && (
              <View style={styles.savedScoresContainer}>
                <Text style={styles.savedScoresTitle}>📱 {t('dragonDay.savedOnDevice')}:</Text>
                <Text style={styles.savedScoresText}>
                  Starting Score: {savedScores.dragon_day_starting_score || 0}
                </Text>
                <Text style={styles.savedScoresText}>
                  {t('dragonDay.dragonDayScore')}: {savedScores.dragon_day_score || 0}
                </Text>
                <Text style={styles.savedScoresText}>
                  {t('dragonDay.saved')}: {savedScores.last_updated ? new Date(savedScores.last_updated).toLocaleString() : t('dragonDay.never')}
                </Text>
                <Text style={styles.savedScoresText}>
                  {t('dragonDay.week')}: {getWeekNumber()}
                </Text>
              </View>
            )}

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                💾 {t('dragonDay.scoresLocalInfo')}
              </Text>
              <Text style={styles.infoText}>
                🔄 {t('dragonDay.dataResetInfo')}
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
              <Text style={compareStyles.overlayTitle}>Dragon Day Quick Compare</Text>
              
              <View style={[
                compareStyles.dragonComponent,
                dragonCompareScore.targetScore.length > 0 && compareStyles.dragonComponentWithTarget
              ]}>
                <Text style={compareStyles.dragonTitle}>Dragon Day</Text>
                
                <View style={compareStyles.scoreRow}>
                  <Text style={compareStyles.scoreLabel}>Current Score:</Text>
                  <Text style={compareStyles.currentScore}>{formatNumber(dragonCompareScore.currentScore)}</Text>
                </View>

                <View style={compareStyles.inputContainer}>
                  <Text style={compareStyles.inputLabel}>Target Score:</Text>
                  <TextInput
                    style={compareStyles.targetInput}
                    keyboardType="numeric"
                    value={dragonCompareScore.targetScore}
                    onChangeText={(value) => calculateDragonComparison(value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    placeholderTextColor="#666"
                  />
                </View>

                {dragonCompareScore.targetScore.length > 0 && (
                  <View style={compareStyles.resultsContainer}>
                    <View style={compareStyles.resultRow}>
                      <Text style={compareStyles.resultLabel}>Difference:</Text>
                      <Text style={[
                        compareStyles.resultValue,
                        dragonCompareScore.difference >= 0 ? compareStyles.positiveValue : compareStyles.negativeValue
                      ]}>
                        {dragonCompareScore.difference >= 0 ? '+' : ''}{formatNumber(dragonCompareScore.difference)}
                      </Text>
                    </View>
                    
                    {dragonCompareScore.pointsNeeded > 0 ? (
                      <View style={compareStyles.resultRow}>
                        <Text style={compareStyles.needLabel}>Points Needed:</Text>
                        <Text style={compareStyles.needValue}>{formatNumber(dragonCompareScore.pointsNeeded)}</Text>
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
    width: '100%',
    height: '100%',
    marginRight: 5,
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
  sectionTitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 24,
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dragonCard: {
    backgroundColor: 'rgba(42, 42, 42, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(51, 51, 51, 0.7)',
    marginBottom: 16,
  },
  selectedDragonCard: {
    borderColor: 'rgba(0, 204, 102, 0.9)',
    backgroundColor: 'rgba(42, 58, 42, 0.6)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 204, 102, 0.8)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dragonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'MedievalSharp',
    fontSize: 24,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    color: '#00cc66',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  runeInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  runeImageContainer: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  runeImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#000000',
  },
  sectionBarsContainer: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sectionBars: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionBar: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(51, 51, 51, 0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(68, 68, 68, 0.7)',
  },
  sectionBarCompleted: {
    backgroundColor: 'rgba(0, 204, 102, 0.8)',
    borderColor: 'rgba(0, 230, 115, 0.8)',
  },
  sectionBarText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statValue: {
    color: '#00cc66',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  unusableRunes: {
    color: '#ffaa00',
  },
  blockedText: {
    color: '#ff6b6b',
  },
  successText: {
    color: '#00cc66',
  },
  insufficientText: {
    color: '#ffaa00',
  },
  pointsText: {
    color: '#00cc66',
    fontWeight: 'bold',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 8,
  },
  scoreLabel: {
    fontFamily: 'MedievalSharp',
    fontSize: 18,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreValue: {
    fontFamily: 'MedievalSharp',
    fontSize: 20,
    color: '#00cc66',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  resourceCard: {
    backgroundColor: 'rgba(42, 42, 42, 0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(51, 51, 51, 0.7)',
    marginBottom: 16,
  },
  selectedResourceCard: {
    borderColor: 'rgba(0, 204, 102, 0.9)',
    backgroundColor: 'rgba(42, 58, 42, 0.6)',
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  resourceImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 204, 102, 0.8)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  resourceImage: {
    width: '100%',
    height: '100%',
  },
  resourceTitleContainer: {
    flex: 1,
  },
  resourceTitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 20,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointsBadge: {
    backgroundColor: 'rgba(0, 204, 102, 0.8)',  // Changed to green background
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 204, 102, 0.9)',  // Changed border to match green theme
  },
  pointsBadgeText: {
    color: '#ffffff',  // White text
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  resourceInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
  },
  resourceScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 8,
  },
  resourceScoreLabel: {
    fontFamily: 'MedievalSharp',
    fontSize: 18,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  resourceScoreValue: {
    fontFamily: 'MedievalSharp',
    fontSize: 20,
    color: '#00cc66',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  totalContainer: {
    backgroundColor: 'rgba(0, 204, 102, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 204, 102, 0.5)',
  },
  // Add breakdown styles
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
    color: '#00cc66',
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
    backgroundColor: 'rgba(0, 204, 102, 0.8)',
    borderColor: 'rgba(0, 204, 102, 0.9)',
  },
  viewButton: {
    backgroundColor: 'rgba(34, 139, 34, 0.8)',
    borderColor: 'rgba(34, 139, 34, 0.9)',
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
  dragonComponent: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
  },
  dragonComponentWithTarget: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.6)',
  },
  dragonTitle: {
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