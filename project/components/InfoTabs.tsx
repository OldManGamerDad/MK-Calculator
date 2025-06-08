import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Platform, Dimensions, Text, SafeAreaView } from 'react-native';
import { Info } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import EventPointsTable from './EventPointsTable';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TabData {
  id: number;
  numeral: string;
  dayNameKey: string;
}

interface EventData {
  eventKey: string;
  points: string;
}

export default function InfoTabs() {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  
  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const modalScale = useSharedValue(0);
  const tabSlideX = useSharedValue(0);

  const tabs: TabData[] = [
    { id: 1, numeral: 'I', dayNameKey: 'days.unit' },
    { id: 2, numeral: 'II', dayNameKey: 'days.summon' },
    { id: 3, numeral: 'III', dayNameKey: 'days.witch' },
    { id: 4, numeral: 'IV', dayNameKey: 'days.gear' },
    { id: 5, numeral: 'V', dayNameKey: 'days.dragon' },
    { id: 6, numeral: 'VI', dayNameKey: 'days.hero' },
  ];

  const eventData: { [key: number]: EventData[] } = {
    0: [
      { eventKey: "eventPoints.unit.tier1Tome", points: "+800" },
      { eventKey: "eventPoints.unit.tier2Tome", points: "+4000" },
      { eventKey: "eventPoints.unit.tier3Tome", points: "+20000" },
      { eventKey: "eventPoints.unit.tier4Tome", points: "+100000" },
      { eventKey: "eventPoints.unit.crowns5", points: "+140" },
      { eventKey: "eventPoints.unit.talentBooks25", points: "+70" },
      { eventKey: "eventPoints.unit.monsterDefeated", points: "+500" },
      { eventKey: "eventPoints.unit.titanRally", points: "+1000" },
      { eventKey: "eventPoints.unit.evilGuardRally", points: "+1000" },
      { eventKey: "eventPoints.unit.darkPriest", points: "+500" },
      { eventKey: "eventPoints.unit.galleryShard", points: "+1000" },
    ],
    1: [
      { eventKey: "eventPoints.summon.rareDragonRune", points: "+70" },
      { eventKey: "eventPoints.summon.excellentDragonRune", points: "+700" },
      { eventKey: "eventPoints.summon.perfectDragonRune", points: "+7000" },
      { eventKey: "eventPoints.summon.epicDragonRune", points: "+14000" },
      { eventKey: "eventPoints.summon.lightReagent", points: "+70" },
      { eventKey: "eventPoints.summon.forgeHammer", points: "+100" },
      { eventKey: "eventPoints.summon.advancedSummoningSpells", points: "+70" },
      { eventKey: "eventPoints.summon.perfectSummoningSpell", points: "+140" },
      { eventKey: "eventPoints.common.monsterDefeated", points: "+500" },
      { eventKey: "eventPoints.common.titanRally", points: "+1000" },
      { eventKey: "eventPoints.common.evilGuardRally", points: "+1000" },
      { eventKey: "eventPoints.common.darkPriest", points: "+500" },
      { eventKey: "eventPoints.common.galleryShard", points: "+1000" },
    ],
    2: [
      { eventKey: "eventPoints.witch.lightReagent", points: "+70" },
      { eventKey: "eventPoints.witch.strengtheningPotions25", points: "+70" },
      { eventKey: "eventPoints.witch.fortunePotions5", points: "+140" },
      { eventKey: "eventPoints.common.monsterDefeated", points: "+500" },
      { eventKey: "eventPoints.common.titanRally", points: "+1000" },
      { eventKey: "eventPoints.common.evilGuardRally", points: "+1000" },
      { eventKey: "eventPoints.common.darkPriest", points: "+500" },
      { eventKey: "eventPoints.common.galleryShard", points: "+1000" },
    ],
    3: [
      { eventKey: "eventPoints.gear.forgeHammer", points: "+100" },
      { eventKey: "eventPoints.gear.elementalVial25", points: "+140" },
      { eventKey: "eventPoints.gear.bloodOfTitan5", points: "+280" },
      { eventKey: "eventPoints.common.monsterDefeated", points: "+500" },
      { eventKey: "eventPoints.common.titanRally", points: "+1000" },
      { eventKey: "eventPoints.common.evilGuardRally", points: "+1000" },
      { eventKey: "eventPoints.common.darkPriest", points: "+500" },
      { eventKey: "eventPoints.common.galleryShard", points: "+1000" },
    ],
    4: [
      { eventKey: "eventPoints.dragon.rareDragonRune", points: "+70" },
      { eventKey: "eventPoints.dragon.excellentDragonRune", points: "+700" },
      { eventKey: "eventPoints.dragon.perfectDragonRune", points: "+7000" },
      { eventKey: "eventPoints.dragon.epicDragonRune", points: "+14000" },
      { eventKey: "eventPoints.dragon.dragonSoulStone25", points: "+140" },
      { eventKey: "eventPoints.dragon.deluxeDragonSoulStone5", points: "+280" },
      { eventKey: "eventPoints.common.monsterDefeated", points: "+500" },
      { eventKey: "eventPoints.common.titanRally", points: "+1000" },
      { eventKey: "eventPoints.common.evilGuardRally", points: "+1000" },
      { eventKey: "eventPoints.common.darkPriest", points: "+500" },
      { eventKey: "eventPoints.common.galleryShard", points: "+1000" },
    ],
    5: [
      { eventKey: "eventPoints.hero.nHeroCard", points: "+100" },
      { eventKey: "eventPoints.hero.rHeroCard", points: "+700" },
      { eventKey: "eventPoints.hero.srHeroCard", points: "+3500" },
      { eventKey: "eventPoints.hero.ssrHeroCard", points: "+14000" },
      { eventKey: "eventPoints.common.monsterDefeated", points: "+500" },
      { eventKey: "eventPoints.common.titanRally", points: "+1000" },
      { eventKey: "eventPoints.common.evilGuardRally", points: "+1000" },
      { eventKey: "eventPoints.common.darkPriest", points: "+500" },
      { eventKey: "eventPoints.common.galleryShard", points: "+1000" },
    ],
  };

  React.useEffect(() => {
    // Info button animation
    scale.value = withRepeat(
      withSequence(
        withSpring(1.1, { damping: 2 }),
        withSpring(1, { damping: 2 })
      ),
      -1,
      true
    );

    rotation.value = withRepeat(
      withSequence(
        withSpring(18, { damping: 2 }),
        withSpring(-18, { damping: 2 })
      ),
      -1,
      true
    );
  }, []);

  const handleModalOpen = () => {
    setModalVisible(true);
    modalScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100
    });
  };

  const handleModalClose = () => {
    modalScale.value = withTiming(0, { duration: 200 });
    setTimeout(() => setModalVisible(false), 200);
  };

  const handleTabChange = (index: number) => {
    // Slide animation for tab content
    tabSlideX.value = withTiming(-20, { duration: 150 }, () => {
      tabSlideX.value = withTiming(0, { duration: 150 });
    });
    setSelectedTab(index);
  };

  const animatedInfoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const animatedModalStyle = useAnimatedStyle(() => ({
    opacity: modalScale.value,
    transform: [{ scale: modalScale.value }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabSlideX.value }],
  }));

  return (
    <>
      <Animated.View style={[styles.container, animatedInfoStyle]}>
        <TouchableOpacity
          onPress={handleModalOpen}
          style={styles.button}
          accessibilityLabel={t('infoTabs.openInfo')}
        >
          <Info size={16} color="#eec747" strokeWidth={2.5} />
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={handleModalClose}
        animationType="none"
        statusBarTranslucent={true}
        accessibilityViewIsModal={true}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, animatedModalStyle]}>
            <View style={styles.tabsContainer}>
              {tabs.map((tab: TabData, index: number) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    selectedTab === index && styles.selectedTab
                  ]}
                  onPress={() => handleTabChange(index)}
                  accessibilityLabel={`${t(tab.dayNameKey)} Day - ${tab.numeral}`}
                >
                  <Text style={[
                    styles.tabNumeral,
                    selectedTab === index && styles.selectedTabNumeral
                  ]}>
                    {tab.numeral}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Animated.View style={[styles.contentContainer, animatedContentStyle]}>
              <View style={styles.tableHeaderContainer}>
                <Text style={styles.tableHeaderText}>Event</Text>
                <Text style={styles.tableHeaderText}>Points</Text>
              </View>
              <View style={styles.tableContainer}>
                <EventPointsTable 
                  data={eventData[selectedTab]} 
                  selectedDay={selectedTab}
                />
              </View>
            </Animated.View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleModalClose}
              accessibilityLabel={t('infoTabs.close')}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.select({
      ios: 60,
      android: 40,
      web: 20
    }),
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(238, 199, 71, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eec747',
    ...Platform.select({
      ios: {
        shadowColor: '#eec747',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 0 15px rgba(238, 199, 71, 0.4)',
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.90,
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(238, 199, 71, 0.4)',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#eec747',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(238, 199, 71, 0.2)',
      },
    }),
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
    gap: 5,
  },
  tab: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(238, 199, 71, 0.4)',
  },
  selectedTab: {
    backgroundColor: 'rgba(238, 199, 71, 0.15)',
    borderColor: '#eec747',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#eec747',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 0 12px rgba(238, 199, 71, 0.3)',
      },
    }),
  },
  tabNumeral: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedTabNumeral: {
    color: '#eec747',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 6,
  },
  tableHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238, 199, 71, 0.3)',
    marginBottom: 4,
  },
  tableHeaderText: {
    color: '#eec747',
    fontFamily: 'MedievalSharp',
    fontSize: 18, // Made larger
    fontWeight: '700', // Made bolder
  },
  tableContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 4,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 77, 77, 0.15)',
    borderColor: '#ff4d4d',
    borderWidth: 2,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontFamily: 'MedievalSharp',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});