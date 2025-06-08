import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ImageBackground } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

interface HeroCard {
  nameKey: string;
  image: string;
  value: string;
  multiplier: number;
}

interface ComponentSection {
  titleKey: string;
  headerImage: string;
  items: HeroCard[];
}

export default function UltimatePowerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  
  // Add starting score state
  const [startingScore, setStartingScore] = useState<string>('');
  
  const [sections, setSections] = useState<Record<string, boolean>>({
    heroes: false,
    unit: false,
    dragon: false,
    castle: false,
    witch: false,
    blacksmith: false,
  });

  const [heroCards, setHeroCards] = useState<HeroCard[]>([
    { nameKey: 'ultimatePower.nHeroCard', image: 'https://i.ibb.co/sPQdNyG/N-Hero.png', value: '', multiplier: 100 },
    { nameKey: 'ultimatePower.rHeroCard', image: 'https://i.ibb.co/qYVHzws/R-Hero.png', value: '', multiplier: 700 },
    { nameKey: 'ultimatePower.srHeroCard', image: 'https://i.ibb.co/mSjd1VF/SR-Hero.png', value: '', multiplier: 3500 },
    { nameKey: 'ultimatePower.ssrHeroCard', image: 'https://i.ibb.co/L1yyk0V/SSR-Hero.png', value: '', multiplier: 14000 },
  ]);

  const [unitCards, setUnitCards] = useState<HeroCard[]>([
    { nameKey: 'ultimatePower.tier1UnitTome', image: 'https://i.ibb.co/R6RZYff/Tier-1.png', value: '', multiplier: 800 },
    { nameKey: 'ultimatePower.tier2UnitTome', image: 'https://i.ibb.co/GMPLtm2/Tier-2.png', value: '', multiplier: 4000 },
    { nameKey: 'ultimatePower.tier3UnitTome', image: 'https://i.ibb.co/TvHn6qL/Tier-3.png', value: '', multiplier: 20000 },
    { nameKey: 'ultimatePower.tier4UnitTome', image: 'https://i.ibb.co/4mJhBSW/Tier-4.png', value: '', multiplier: 100000 },
  ]);

  const [dragonCards, setDragonCards] = useState<HeroCard[]>([
    { nameKey: 'ultimatePower.rareDragonRune', image: 'https://i.ibb.co/Jd4gFj2/Rare-Dragon.png', value: '', multiplier: 70 },
    { nameKey: 'ultimatePower.fineDragonRune', image: 'https://i.ibb.co/k8RTzXx/Fine-Dragon.png', value: '', multiplier: 700 },
    { nameKey: 'ultimatePower.perfectDragonRune', image: 'https://i.ibb.co/g7hxjJj/Perfect-Dragon.png', value: '', multiplier: 7000 },
    { nameKey: 'ultimatePower.epicDragonRune', image: 'https://i.ibb.co/54bRpTh/Epic-Dragon.png', value: '', multiplier: 14000 },
  ]);

  const [castleResources, setCastleResources] = useState<HeroCard[]>([
    { nameKey: 'ultimatePower.stone', image: 'https://i.ibb.co/qk4r6Nq/Stone.png', value: '', multiplier: 100 },
    { nameKey: 'ultimatePower.wood', image: 'https://i.ibb.co/kHN88FX/Wood.png', value: '', multiplier: 500 },
    { nameKey: 'ultimatePower.steel', image: 'https://i.ibb.co/mR6107Q/Steel.png', value: '', multiplier: 2000 },
  ]);

  const [witchItems, setWitchItems] = useState<HeroCard[]>([
    { nameKey: 'ultimatePower.lightReagent', image: 'https://i.ibb.co/mbt0wYt/Light-Reagent.png', value: '', multiplier: 70 },
    { nameKey: 'ultimatePower.strengtheningPotion', image: 'https://i.ibb.co/q9CSj4Y/Strengthening-Potion.png', value: '', multiplier: 3 },
    { nameKey: 'ultimatePower.fortunePotion', image: 'https://i.ibb.co/bQJm46g/Fortune-Potion.png', value: '', multiplier: 28 },
  ]);

  const [blacksmithItems, setBlacksmithItems] = useState<HeroCard[]>([
    { nameKey: 'ultimatePower.forgeHammer', image: 'https://i.ibb.co/bPWTsSS/Forge-Hammer.png', value: '', multiplier: 100 },
  ]);

  // Initialize animation values for each section
  const sectionHeights = {
    heroes: useSharedValue(0),
    unit: useSharedValue(0),
    dragon: useSharedValue(0),
    castle: useSharedValue(0),
    witch: useSharedValue(0),
    blacksmith: useSharedValue(0),
  };

  const toggleSection = useCallback((sectionKey: keyof typeof sections) => {
    const newHeight = !sections[sectionKey] ? 400 : 0;
    const heightValue = sectionHeights[sectionKey as keyof typeof sectionHeights];
    if (heightValue) {
      heightValue.value = withSpring(newHeight);
    }
    setSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  }, [sections, sectionHeights]);

  const calculateSectionTotal = useCallback((items: HeroCard[]) => {
    return items.reduce((total, item) => {
      const value = parseInt(item.value) || 0;
      return total + (value * item.multiplier);
    }, 0);
  }, []);

  // Add function to calculate power total separately
  const calculatePowerTotal = useCallback(() => {
    return (
      calculateSectionTotal(heroCards) +
      calculateSectionTotal(unitCards) +
      calculateSectionTotal(dragonCards) +
      calculateSectionTotal(castleResources) +
      calculateSectionTotal(witchItems) +
      calculateSectionTotal(blacksmithItems)
    );
  }, [heroCards, unitCards, dragonCards, castleResources, witchItems, blacksmithItems, calculateSectionTotal]);

  // Update calculateGrandTotal to include starting score
  const calculateGrandTotal = useCallback(() => {
    const powerTotal = calculatePowerTotal();
    const starting = parseInt(startingScore) || 0;
    return starting + powerTotal;
  }, [calculatePowerTotal, startingScore]);

  const handleValueChange = useCallback((
    items: HeroCard[],
    setItems: React.Dispatch<React.SetStateAction<HeroCard[]>>,
    index: number,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], value: value.replace(/[^0-9]/g, '') };
    setItems(newItems);
  }, []);

  const formatNumber = useCallback((num: number) => {
    return num.toLocaleString();
  }, []);

  const handleStartingScoreChange = useCallback((value: string) => {
    setStartingScore(value.replace(/[^0-9]/g, ''));
  }, []);

  const clearStartingScore = useCallback(() => {
    setStartingScore('');
  }, []);

  const componentSections: ComponentSection[] = [
    {
      titleKey: "ultimatePower.heroes",
      headerImage: 'https://i.ibb.co/XCpBfsN/Heroes.png',
      items: heroCards,
    },
    {
      titleKey: 'ultimatePower.unit',
      headerImage: 'https://i.ibb.co/bg7G4dy/Unit.png',
      items: unitCards,
    },
    {
      titleKey: 'ultimatePower.dragon',
      headerImage: 'https://i.ibb.co/5n8GwzC/Dragon.png',
      items: dragonCards,
    },
    {
      titleKey: 'ultimatePower.castle',
      headerImage: 'https://i.ibb.co/QMSyxB6/Castle.png',
      items: castleResources,
    },
    {
      titleKey: 'ultimatePower.witch',
      headerImage: 'https://i.ibb.co/BPSkzS4/Witch.png',
      items: witchItems,
    },
    {
      titleKey: 'ultimatePower.blacksmith',
      headerImage: 'https://i.ibb.co/HDNQY84/Blacksmith.png',
      items: blacksmithItems,
    },
  ];

  const renderSection = useCallback((section: ComponentSection, index: number) => {
    const sectionKey = section.titleKey.split('.')[1] as keyof typeof sections;
    const isExpanded = sections[sectionKey];
    const items = section.items;
    const setItems = index === 0 ? setHeroCards 
                  : index === 1 ? setUnitCards 
                  : index === 2 ? setDragonCards 
                  : index === 3 ? setCastleResources
                  : index === 4 ? setWitchItems
                  : setBlacksmithItems;

    const containerStyle = useAnimatedStyle(() => {
      const heightValue = sectionHeights[sectionKey as keyof typeof sectionHeights];
      return {
        height: heightValue?.value ?? 0,
        overflow: 'hidden',
      };
    });

    return (
      <View key={section.titleKey} style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionKey)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: section.headerImage }} style={styles.headerImage} />
          <View style={styles.headerContent}>
            <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
            <Text style={styles.sectionScore}>
              Score: {calculateSectionTotal(items).toLocaleString()}
            </Text>
          </View>
          {isExpanded ? (
            <ChevronUp size={24} color="#ffffff" />
          ) : (
            <ChevronDown size={24} color="#ffffff" />
          )}
        </TouchableOpacity>

        <Animated.View style={[styles.sectionContent, containerStyle]}>
          {isExpanded && (
            <ScrollView 
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {items.map((item, idx) => (
                <View key={`${section.titleKey}-${idx}`} style={styles.itemContainer}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{t(item.nameKey)}</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={item.value}
                        onChangeText={(value) => handleValueChange(items, setItems, idx, value)}
                        keyboardType="numeric"
                        placeholder="Amount"
                        placeholderTextColor="#ffffff80"
                        maxLength={10}
                      />
                      <Text style={styles.score}>
                        Score: {((parseInt(item.value) || 0) * item.multiplier).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    );
  }, [sections, sectionHeights, calculateSectionTotal, handleValueChange, toggleSection, t]);

  return (
    <ImageBackground 
      source={{ uri: 'https://iili.io/3NjdOYv.png' }}
      style={styles.container}
      resizeMode="cover"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2.5} />
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        
        <View style={{ height: 180 }} />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Compact Starting Score Section */}
          <View style={styles.startingScoreContainer}>
            <Text style={styles.startingScoreTitle}>Current Total Score</Text>
            
            <View style={styles.startingScoreInputContainer}>
              <TextInput
                style={styles.startingScoreInput}
                keyboardType="numeric"
                value={startingScore}
                onChangeText={handleStartingScoreChange}
                placeholder="Enter current score"
                placeholderTextColor="#666"
                maxLength={15}
              />
              <TouchableOpacity 
                style={styles.clearStartingButton}
                onPress={clearStartingScore}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>C</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.startingScoreDisplay}>
              Starting: {formatNumber(parseInt(startingScore) || 0)}
            </Text>
          </View>

          {componentSections.map((section, index) => renderSection(section, index))}
          
          {/* Updated Total Container with breakdown */}
          <View style={styles.totalContainer}>
            <View style={styles.totalBreakdown}>
              <Text style={styles.breakdownText}>
                Starting: {formatNumber(parseInt(startingScore) || 0)}
              </Text>
              <Text style={styles.breakdownText}>
                + Power: {formatNumber(calculatePowerTotal())}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <View style={styles.totalHeader}>
                <Image 
                  source={{ uri: 'https://i.ibb.co/8sFhSSt/Total-Score.png' }}
                  style={styles.totalIcon}
                />
                <Text style={styles.totalLabel}>Grand Total:</Text>
              </View>
              <Text style={styles.totalValue}>{formatNumber(calculateGrandTotal())}</Text>
            </View>
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
    padding: 16,
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
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 100, 200, 0.5)',
  },
  startingScoreTitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  startingScoreInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  startingScoreInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'MedievalSharp',
  },
  clearStartingButton: {
    backgroundColor: 'rgba(255, 77, 77, 0.8)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.9)',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  startingScoreDisplay: {
    fontFamily: 'MedievalSharp',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingRight: 10,
  },
  section: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 248, 255, 0.3)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(224, 232, 255, 0.4)', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(137, 207, 240, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 232, 255, 0.4)',
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'rgba(240, 244, 255, 0.3)',
  },
  headerContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  sectionScore: {
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  sectionContent: {
    backgroundColor: 'rgba(60, 136, 255, 0.4)',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 136, 255, 0.4)',
    alignItems: 'center',
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: 'rgba(240, 244, 255, 0.3)',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    width: 100,
    maxWidth: '35%',
    backgroundColor: 'rgba(245, 248, 255, 0.4)',
    borderRadius: 8,
    padding: 6,
    fontSize: 14,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(224, 232, 255, 0.5)',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  score: {
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  totalContainer: {
    backgroundColor: 'rgba(0, 148, 255, 0.4)',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  totalIcon: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 18,
  },
  totalLabel: {
    fontSize: 20,
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  totalValue: {
    fontSize: 26,
    fontFamily: 'MedievalSharp',
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});