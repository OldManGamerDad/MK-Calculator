import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, Image, Switch, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

interface ActionPointItem {
  nameKey: string;
  image: string;
  value: string;
  points: number;
}

interface HeroItem {
  name: string;
  image: string;
  enabled: boolean;
  bonus: number;
}

export default function UltimateHuntingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  
  // Add starting score state
  const [startingScore, setStartingScore] = useState<string>('');
  
  const [isActionPointsExpanded, setIsActionPointsExpanded] = useState(false);
  const [isHeroesExpanded, setIsHeroesExpanded] = useState(false);
  
  const [actionPoints, setActionPoints] = useState<ActionPointItem[]>([
    { nameKey: 'ultimateHunting.5ap', image: 'https://i.ibb.co/7YWgg5N/5-Action-Points.png', value: '', points: 5 },
    { nameKey: 'ultimateHunting.10ap', image: 'https://i.ibb.co/jw9XxBM/10-Action-Points.png', value: '', points: 10 },
    { nameKey: 'ultimateHunting.20ap', image: 'https://i.ibb.co/gyf62Xz/20-Action-Points.png', value: '', points: 20 },
    { nameKey: 'ultimateHunting.50ap', image: 'https://i.ibb.co/WvT9ktP/50-Action-Points.png', value: '', points: 50 },
    { nameKey: 'ultimateHunting.100ap', image: 'https://i.ibb.co/ZMvFdpq/100-Action-Points.png', value: '', points: 100 },
    { nameKey: 'ultimateHunting.200ap', image: 'https://i.ibb.co/c6zY6Z2/200-Action-Points.png', value: '', points: 200 },
  ]);

  const [heroes, setHeroes] = useState<HeroItem[]>([
    { name: 'Ryan', image: 'https://i.ibb.co/r7w8qVD/Ryan.png', enabled: false, bonus: 10 },
    { name: 'Pandaria', image: 'https://i.ibb.co/gTnsztd/Pandaria.png', enabled: false, bonus: 10 },
    { name: 'Fatima', image: 'https://i.ibb.co/rMQdwHV/Fatima.png', enabled: false, bonus: 10 },
    { name: 'Harold', image: 'https://i.ibb.co/YB1BbSQ/Harold.png', enabled: false, bonus: 10 },
    { name: 'Miku', image: 'https://i.ibb.co/m5W83xz/Miku.png', enabled: false, bonus: 20 },
    { name: 'Giselle', image: 'https://i.ibb.co/fFNnkr3/Giselle.png', enabled: false, bonus: 10 },
    { name: 'Jessica', image: 'https://i.ibb.co/3zT3dFN/Jessica.png', enabled: false, bonus: 10 },
    { name: 'Pedra', image: 'https://i.ibb.co/9w0VDLf/Pedra.png', enabled: false, bonus: 10 },
    { name: 'Hana', image: 'https://i.ibb.co/VYkxHBx/Hana.png', enabled: false, bonus: 10 },
    { name: 'Pythia', image: 'https://i.ibb.co/frNXc17/Pythia.png', enabled: false, bonus: 10 },
    { name: 'Luvia', image: 'https://i.ibb.co/4Z12sTB/Luvia.png', enabled: false, bonus: 10 },
  ]);

  const [vipLevel, setVipLevel] = useState('');

  const actionPointsHeight = useSharedValue(0);
  const actionPointsRotate = useSharedValue('0deg');
  const heroesHeight = useSharedValue(0);
  const heroesRotate = useSharedValue('0deg');

  const   actionPointsContainerStyle = useAnimatedStyle(() => ({
    height: actionPointsHeight.value,
    overflow: 'hidden',
    opacity: actionPointsHeight.value === 0 ? 0 : 1,
    marginBottom: actionPointsHeight.value === 0 ? 0 : 2, // Reduced from 5 to close gap with AP Heroes
  }));

  const actionPointsIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: actionPointsRotate.value }],
  }));

  const   heroesContainerStyle = useAnimatedStyle(() => ({
    height: heroesHeight.value,
    overflow: 'hidden',
    opacity: heroesHeight.value === 0 ? 0 : 1,
    marginBottom: heroesHeight.value === 0 ? 0 : 2, // Reduced from 5
  }));

  const heroesIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: heroesRotate.value }],
  }));

  const handleActionPointsExpand = () => {
    const newHeight = !isActionPointsExpanded ? 400 : 0;
    actionPointsHeight.value = withSpring(newHeight, {}, (finished) => {
      if (finished && !isActionPointsExpanded) {
        runOnJS(setIsActionPointsExpanded)(true);
      }
    });
    actionPointsRotate.value = withTiming(isActionPointsExpanded ? '0deg' : '180deg', {}, () => {
      if (isActionPointsExpanded) {
        runOnJS(setIsActionPointsExpanded)(false);
      }
    });
  };

  const handleHeroesExpand = () => {
    const newHeight = !isHeroesExpanded ? 400 : 0;
    heroesHeight.value = withSpring(newHeight, {}, (finished) => {
      if (finished && !isHeroesExpanded) {
        runOnJS(setIsHeroesExpanded)(true);
      }
    });
    heroesRotate.value = withTiming(isHeroesExpanded ? '0deg' : '180deg', {}, () => {
      if (isHeroesExpanded) {
        runOnJS(setIsHeroesExpanded)(false);
      }
    });
  };

  const handleInputChange = (text: string, index: number) => {
    const newActionPoints = [...actionPoints];
    newActionPoints[index].value = text.replace(/[^0-9]/g, '');
    setActionPoints(newActionPoints);
  };

  const toggleHero = (index: number) => {
    const newHeroes = [...heroes];
    newHeroes[index].enabled = !newHeroes[index].enabled;
    setHeroes(newHeroes);
  };

  const calculateTotalAP = () => {
    return actionPoints.reduce((total, item) => {
      const value = parseInt(item.value) || 0;
      return total + (value * item.points);
    }, 0);
  };

  const calculateHeroReduction = () => {
    return heroes.reduce((total, hero) => {
      if (hero.enabled) {
        return total + hero.bonus;
      }
      return total;
    }, 0);
  };

  const calculateAPGeneration = () => {
    const level = parseInt(vipLevel) || 0;
    
    if (level >= 13 && level <= 20) return 3200;
    if (level === 11 || level === 12) return 3000;
    if (level === 10) return 2800;
    if (level === 9) return 2600;
    if (level === 8) return 2400;
    if (level >= 1 && level <= 7) return 2000;
    return 0;
  };

  // Add function to calculate hunting total separately
  const calculateHuntingTotal = () => {
    const totalAP = calculateTotalAP();
    const heroReduction = calculateHeroReduction() / 100;
    const dailyVideo = 250;
    const apGeneration = calculateAPGeneration();
    
    const total = totalAP + dailyVideo + (apGeneration * (heroReduction + 1));
    
    return Math.floor(total);
  };

  // Update calculateTotalPoints to include starting score
  const calculateTotalPoints = () => {
    const huntingTotal = calculateHuntingTotal();
    const starting = parseInt(startingScore) || 0;
    return starting + huntingTotal;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={{ uri: 'https://iili.io/3NjdOYv.png' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2.5} />
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        
        <View style={{ height: 200 }} />
        <ScrollView style={styles.overlay} showsVerticalScrollIndicator={false}>
          
          {/* Compact Starting Score Section */}
          <View style={styles.startingScoreContainer}>
            <Text style={styles.startingScoreTitle}>Current Total Score</Text>
            
            <View style={styles.startingScoreInputContainer}>
              <TextInput
                style={styles.startingScoreInput}
                keyboardType="numeric"
                value={startingScore}
                onChangeText={(value) => setStartingScore(value.replace(/[^0-9]/g, ''))}
                placeholder="Enter current score"
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
              Starting: {formatNumber(parseInt(startingScore) || 0)}
            </Text>
          </View>

          <View style={styles.vipContainer}>
            <View style={styles.vipContent}>
              <View style={styles.vipIconContainer}>
                <Image 
                  source={{ uri: 'https://i.ibb.co/XzQdwHV/VIP.jpg' }}
                  style={styles.vipIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.vipTitle}>VIP Level</Text>
              <TextInput
                style={styles.vipInput}
                keyboardType="numeric"
                value={vipLevel}
                onChangeText={setVipLevel}
                placeholder="0"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.headerContainer} onPress={handleActionPointsExpand}>
            <View style={styles.headerContent}>
              <Image 
                source={{ uri: 'https://i.ibb.co/c6zY6Z2/200-Action-Points.png' }}
                style={styles.headerImage}
                resizeMode="contain"
              />
              <Text style={styles.headerText}>Action Points</Text>
              <Animated.View style={actionPointsIconStyle}>
                {isActionPointsExpanded ? (
                  <ChevronUp size={24} color="#ffffff" />
                ) : (
                  <ChevronDown size={24} color="#ffffff" />
                )}
              </Animated.View>
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />

          <Animated.View style={[styles.expandableContent, actionPointsContainerStyle]}>
            {isActionPointsExpanded && (
              <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <Text style={styles.sectionTitle}>Enter Vials Quantity</Text>
                {actionPoints.map((item, index) => (
                  <View key={index} style={styles.itemContainer}>
                    <View style={styles.itemContent}>
                      <Image 
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.itemText}>{t(item.nameKey)}</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={item.value}
                      onChangeText={(text) => handleInputChange(text, index)}
                      placeholder="0"
                      placeholderTextColor="#666"
                    />
                  </View>
                ))}
                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Total Action Points:</Text>
                  <Text style={styles.totalValue}>{calculateTotalAP()}</Text>
                </View>
              </ScrollView>
            )}
          </Animated.View>

          <TouchableOpacity 
            style={styles.headerContainer} 
            onPress={handleHeroesExpand}
          >
            <View style={styles.headerContent}>
              <Image 
                source={{ uri: 'https://i.ibb.co/m5W83xz/Miku.png' }}
                style={styles.headerImage}
                resizeMode="contain"
              />
              <Text style={styles.headerText}>AP Heroes</Text>
              <Animated.View style={heroesIconStyle}>
                {isHeroesExpanded ? (
                  <ChevronUp size={24} color="#ffffff" />
                ) : (
                  <ChevronDown size={24} color="#ffffff" />
                )}
              </Animated.View>
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />

          <Animated.View style={[styles.expandableContent, heroesContainerStyle]}>
            {isHeroesExpanded && (
              <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <Text style={styles.sectionTitle}>Pick AP Hero</Text>
                {heroes.map((hero, index) => (
                  <View key={index} style={styles.heroContainer}>
                    <View style={styles.heroContent}>
                      <Image 
                        source={{ uri: hero.image }}
                        style={styles.heroImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.heroName}>{hero.name}</Text>
                    </View>
                    <View style={styles.bonusContainer}>
                      <Text style={[styles.bonusText, hero.enabled && styles.bonusTextActive]}>
                        {hero.bonus}%
                      </Text>
                      <Switch
                        value={hero.enabled}
                        onValueChange={() => toggleHero(index)}
                        trackColor={{ false: '#666', true: '#2d5a27' }}
                        thumbColor={hero.enabled ? '#4CAF50' : '#f4f3f4'}
                      />
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </Animated.View>

          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <View style={styles.totalIconContainer}>
                <Image 
                  source={{ uri: 'https://i.ibb.co/C7tSNfs/Total-AP.png' }}
                  style={styles.totalIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.totalLabel}>Total AP:</Text>
              <Text style={styles.totalValue}>{calculateTotalAP()}</Text>
            </View>

            <View style={styles.totalRow}>
              <View style={styles.totalIconContainer}>
                <Image 
                  source={{ uri: 'https://i.ibb.co/pzcsjGx/AP-Reduction.jpg' }}
                  style={styles.totalIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.totalLabel}>Hero Reduction %:</Text>
              <Text style={styles.totalValue}>{calculateHeroReduction()}%</Text>
            </View>

            <View style={styles.totalRow}>
              <View style={styles.totalIconContainer}>
                <Image 
                  source={{ uri: 'https://i.ibb.co/YQSfPP3/Daily-Video.jpg' }}
                  style={styles.totalIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.totalLabel}>5 Days Daily Video:</Text>
              <Text style={styles.calculatedValue}>250</Text>
            </View>

            <View style={styles.totalRow}>
              <View style={styles.totalIconContainer}>
                <Image 
                  source={{ uri: 'https://i.ibb.co/MnMDRC4/AP-Generation.jpg' }}
                  style={styles.totalIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.totalLabel}>5 Days AP Generation:</Text>
              <Text style={styles.calculatedValue}>{calculateAPGeneration()}</Text>
            </View>

            {/* Updated Total Points Display with breakdown */}
            <View style={styles.finalTotalContainer}>
              <View style={styles.totalBreakdown}>
                <Text style={styles.breakdownText}>
                  Starting: {formatNumber(parseInt(startingScore) || 0)}
                </Text>
                <Text style={styles.breakdownText}>
                  + Hunting: {formatNumber(calculateHuntingTotal())}
                </Text>
              </View>
              <View style={styles.finalTotalRow}>
                <View style={styles.totalIconContainer}>
                  <Image 
                    source={{ uri: 'https://i.ibb.co/tBddTLv/Hunting-Icon.jpg' }}
                    style={styles.totalIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.finalTotalLabel}>Grand Total:</Text>
                <Text style={styles.finalTotalValue}>{formatNumber(calculateTotalPoints())}</Text>
              </View>
            </View>
          </View>
          
          <View style={{ height: 10 }} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 16,
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
  // Compact Starting Score Styles
  startingScoreContainer: {
    backgroundColor: 'rgba(0, 100, 200, 0.2)',
    padding: 10, // Reduced from 16
    borderRadius: 8, // Reduced from 12
    marginBottom: 12, // Reduced from 16
    borderWidth: 2,
    borderColor: 'rgba(0, 100, 200, 0.5)',
  },
  startingScoreTitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 16, // Reduced from 20
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8, // Reduced from 12
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  startingScoreInputContainer: {
    flexDirection: 'row',
    gap: 8, // Reduced from 12
    marginBottom: 6, // Reduced from 12
  },
  startingScoreInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6, // Reduced from 8
    padding: 8, // Reduced from 12
    fontSize: 16, // Reduced from 18
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'MedievalSharp',
  },
  clearStartingButton: {
    backgroundColor: 'rgba(255, 77, 77, 0.8)',
    borderRadius: 6, // Reduced from 8
    paddingHorizontal: 12, // Reduced from 16
    paddingVertical: 8, // Reduced from 12
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.9)',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 12, // Reduced from 14
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  startingScoreDisplay: {
    fontFamily: 'MedievalSharp',
    fontSize: 14, // Reduced from 16
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerContainer: {
    backgroundColor: 'rgba(45, 90, 39, 0.3)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: '#2d5a27',
    marginTop: 0, // Removed margin to close gaps between sections
    marginBottom: 0,
    zIndex: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerImage: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  headerText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  divider: {
    height: 1, // Reduced from 2 to make thinner
    backgroundColor: '#000000',
    width: '100%',
    marginTop: -1,
    marginBottom: -1, // Added negative margin to pull closer
    zIndex: 1,
  },
  expandableContent: {
    backgroundColor: 'rgba(45, 90, 39, 0.2)',
    borderWidth: 2,
    borderColor: '#2d5a27',
    borderRadius: 12,
    padding: 12,
    marginBottom: 0, // Removed margin to close gaps
    zIndex: 3,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: 'rgba(45, 90, 39, 0.3)',
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d5a27',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: 28,
    height: 28,
    marginRight: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  itemText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 6,
    padding: 6,
    width: 70,
    textAlign: 'center',
    fontSize: 14,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#2d5a27',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2d5a27',
  },
  totalText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  totalValue: {
    color: '#ffffff', // Changed from '#4CAF50' to white
    fontSize: 22,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: 'rgba(45, 90, 39, 0.3)',
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d5a27',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  heroImage: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  heroName: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bonusText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    minWidth: 40,
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bonusTextActive: {
    color: '#4CAF50',
  },
  sectionTitle: {
    color: '#4CAF50',
    fontSize: 18,
    fontFamily: 'MedievalSharp',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  totalsContainer: {
    backgroundColor: 'rgba(45, 90, 39, 0.2)',
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 12,
    padding: 12, // Back to original
    marginTop: 12, // Back to original
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8, // Back to original
    backgroundColor: 'rgba(45, 90, 39, 0.3)',
    padding: 10, // Back to original
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  totalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  totalIcon: {
    width: '100%',
    height: '100%',
  },
  totalLabel: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  calculatedValue: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'MedievalSharp',
    minWidth: 50,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Add breakdown styles for final total
  finalTotalContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 12,
    padding: 12, // Back to original
    marginTop: 8, // Back to original
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
  finalTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(76, 175, 80, 0.4)',
    padding: 12, // Back to original
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  finalTotalLabel: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontWeight: 'bold',
  },
  finalTotalValue: {
    color: '#ffffff', // Changed from '#4CAF50' to white
    fontSize: 20,
    fontFamily: 'MedievalSharp',
    minWidth: 100,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  vipContainer: {
    backgroundColor: 'rgba(45, 90, 39, 0.2)',
    borderWidth: 3,
    borderColor: '#2d5a27',
    borderRadius: 16,
    padding: 8,
    marginBottom: 20, // Increased to add MORE space before Action Points
    shadowColor: '#2d5a27',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  vipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(45, 90, 39, 0.3)',
    padding: 12, // Reduced from 16
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2d5a27',
  },
  vipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  vipIcon: {
    width: '100%',
    height: '100%',
  },
  vipTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  vipInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 10,
    width: 70,
    textAlign: 'center',
    fontSize: 20,
    color: '#000000',
    fontFamily: 'MedievalSharp',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
});