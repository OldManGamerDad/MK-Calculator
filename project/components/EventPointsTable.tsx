import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

interface EventData {
  eventKey: string; // Changed from 'event' to 'eventKey' for translation keys
  points: string;
}

interface EventPointsTableProps {
  data?: EventData[];
  selectedDay?: number;
}

const EventPointsTable: React.FC<EventPointsTableProps> = ({ data, selectedDay = 0 }) => {
  const { t } = useTranslation();

  // Default data structure with translation keys
  const defaultData: EventData[][] = [
    // Day I - Unit
    [
      { eventKey: "eventPoints.unit.tier1Tome", points: "+800" },
      { eventKey: "eventPoints.unit.tier2Tome", points: "+4000" },
      { eventKey: "eventPoints.unit.tier3Tome", points: "+20000" },
      { eventKey: "eventPoints.unit.tier4Tome", points: "+100000" },
      { eventKey: "eventPoints.unit.crowns", points: "+280" },
      { eventKey: "eventPoints.unit.talentBooks", points: "+140" },
      { eventKey: "eventPoints.unit.monsterDefeated", points: "+500" },
      { eventKey: "eventPoints.unit.titanRally", points: "+1000" },
      { eventKey: "eventPoints.unit.evilGuardRally", points: "+1000" },
      { eventKey: "eventPoints.unit.darkPriest", points: "+500" },
      { eventKey: "eventPoints.unit.galleryShard", points: "+1000" },
    ],
    // Day II - Summon
    [
      { eventKey: "eventPoints.summon.summonScroll", points: "+500" },
      { eventKey: "eventPoints.summon.epicSummon", points: "+2000" },
      { eventKey: "eventPoints.summon.legendarySummon", points: "+5000" },
    ],
    // Add more days as needed...
  ];

  const tableData: EventData[] = data || defaultData[selectedDay] || defaultData[0];

  return (
    <View style={styles.container}>
      {/* Table Content */}
      <ScrollView 
        style={[styles.tableContent, { overflow: 'hidden' }]} 
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 10 }}
      >
        {tableData.map((row: EventData, index: number) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index % 2 === 0 && styles.evenRow
            ]}
          >
            <Text style={styles.eventText}>{t(row.eventKey)}</Text>
            <Text style={styles.pointsText}>{row.points}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 400,
  },
  tableContent: {
    flex: 1,
    paddingBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238, 199, 71, 0.1)',
    minHeight: 60,
  },
  evenRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  eventText: {
    flex: 2.5,
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
    paddingRight: 12,
  },
  pointsText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#eec747',
    textAlign: 'right',
  },
});

export default EventPointsTable;