import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { CreditCard as Edit2, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ScoreSummaryProps {
  currentDayScore: number;
  weekNumber: number;
  DayField: 'unit_day_score' | 'summon_day_score' | 'witch_day_score' | 'gear_day_score' | 'dragon_day_score' | 'heroes_day_score';
  accentColor: string;
}

interface WeeklyScores {
  unit_day_score: number | null;
  summon_day_score: number | null;
  witch_day_score: number | null;
  gear_day_score: number | null;
  dragon_day_score: number | null;
  heroes_day_score: number | null;
  overall_score: number | null;
}

export default function ScoreSummary({ currentDayScore, weekNumber, DayField, accentColor }: ScoreSummaryProps) {
  const router = useRouter();
  const [weeklyScores, setWeeklyScores] = useState<WeeklyScores>({
    unit_day_score: null,
    summon_day_score: null,
    witch_day_score: null,
    gear_day_score: null,
    dragon_day_score: null,
    heroes_day_score: null,
    overall_score: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedOverallScore, setEditedOverallScore] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchScores();
  }, [currentDayScore]);

  const calculateCumulativeScore = () => {
    const dayOrder = [
      'unit_day_score',
      'summon_day_score',
      'witch_day_score',
      'gear_day_score',
      'dragon_day_score',
      'heroes_day_score'
    ];

    const currentDayIndex = dayOrder.indexOf(DayField);
    let cumulativeScore = 0;

    for (let i = 0; i <= currentDayIndex; i++) {
      if (dayOrder[i] === DayField) {
        cumulativeScore += currentDayScore;
      } else {
        const score = weeklyScores[dayOrder[i] as keyof WeeklyScores];
        if (score !== null) {
          cumulativeScore += score;
        }
      }
    }

    return cumulativeScore;
  };

  const createInitialScore = async (userId: string) => {
    const initialData = {
      user_id: userId,
      week_number: weekNumber,
      unit_day_score: null,
      summon_day_score: null,
      witch_day_score: null,
      gear_day_score: null,
      dragon_day_score: null,
      heroes_day_score: null,
      overall_score: null,
      [DayField]: currentDayScore || null
    };

    try {
      const { error: insertError } = await supabase
        .from('scores')
        .insert([initialData]);

      if (insertError) throw insertError;

      return initialData;
    } catch (error) {
      console.error('Error creating initial score:', error);
      throw error;
    }
  };

  const fetchScores = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace('/(auth)/login');
        return;
      }

      const { data: scoreData, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('week_number', weekNumber)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          const initialScore = await createInitialScore(session.user.id);
          setWeeklyScores(initialScore);
          setEditedOverallScore('0');
        } else {
          console.error('Error fetching scores:', error);
        }
        return;
      }

      if (scoreData) {
        setWeeklyScores(scoreData);
        const cumulative = calculateCumulativeScore();
        setEditedOverallScore(cumulative.toString());
      } else {
        const initialScore = await createInitialScore(session.user.id);
        setWeeklyScores(initialScore);
        setEditedOverallScore('0');
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  const handleSaveOverallScore = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace('/(auth)/login');
        return;
      }

      const newScore = parseInt(editedOverallScore) || 0;
      
      const { data: existingScore } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('week_number', weekNumber)
        .single();

      const updateData = {
        [DayField]: currentDayScore || null,
        overall_score: newScore || null
      };

      let error;
      if (existingScore) {
        const { error: updateError } = await supabase
          .from('scores')
          .update(updateData)
          .eq('id', existingScore.id);
        error = updateError;
      } else {
        const initialScore = await createInitialScore(session.user.id);
        const { error: updateError } = await supabase
          .from('scores')
          .update(updateData)
          .eq('id', initialScore.id);
        error = updateError;
      }

      if (error) {
        console.error('Error saving score:', error);
        Alert.alert('Error', 'Failed to save score. Please try again.');
        return;
      }

      setWeeklyScores(prev => ({
        ...prev,
        [DayField]: currentDayScore || null,
        overall_score: newScore || null
      }));
      setIsEditing(false);
      Alert.alert('Success', 'Overall score updated successfully!');
    } catch (error) {
      console.error('Error saving score:', error);
      Alert.alert('Error', 'Failed to save score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <View style={[styles.container, { borderColor: accentColor }]}>
      <View style={styles.row}>
        <Text style={styles.label}>Current Day Score:</Text>
        <Text style={[styles.value, { color: accentColor }]}>
          {formatNumber(currentDayScore)}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={[styles.row, styles.lastRow]}>
        <Text style={styles.label}>Overall Score:</Text>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={editedOverallScore}
              onChangeText={setEditedOverallScore}
              keyboardType="numeric"
              selectTextOnFocus
            />
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: `${accentColor}33` }]}
              onPress={handleSaveOverallScore}
              disabled={loading}
            >
              <Check size={20} color={accentColor} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editContainer}>
            <Text style={[styles.value, { color: accentColor }]}>
              {formatNumber(calculateCumulativeScore())}
            </Text>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: `${accentColor}33` }]}
              onPress={() => {
                setEditedOverallScore(calculateCumulativeScore().toString());
                setIsEditing(true);
              }}
            >
              <Edit2 size={20} color={accentColor} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lastRow: {
    marginBottom: 0,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
  },
  value: {
    fontSize: 20,
    fontFamily: 'MedievalSharp',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    width: 120,
    color: '#000000',
    fontSize: 16,
    textAlign: 'right',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 12,
  },
});