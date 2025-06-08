import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Trash2, ArrowLeft } from 'lucide-react-native'; // Add ArrowLeft import
import { useRouter } from 'expo-router'; // Add this import
import { supabase } from '@/lib/supabase';

type Score = {
  id: string;
  created_at: string;
  unit_day_score: number | null;
  summon_day_score: number | null;
  witch_day_score: number | null;
  gear_day_score: number | null;
  dragon_day_score: number | null;
  heroes_day_score: number | null;
  total_score: number;
};

export default function HistoryScreen() {
  const router = useRouter(); // Add this line
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchScores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScores(data || []);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scoreId: string) => {
    Alert.alert(
      'Delete Score',
      'Are you sure you want to delete this score? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(scoreId);
              const { error } = await supabase
                .from('scores')
                .delete()
                .eq('id', scoreId);

              if (error) throw error;
              setScores(prev => prev.filter(score => score.id !== scoreId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete score');
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchScores();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number | null) => {
    return num?.toLocaleString() || '0';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Add back button to loading screen too */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" strokeWidth={2.5} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.loadingText}>Loading scores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Add the back button here */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#ffffff" strokeWidth={2.5} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {scores.length === 0 ? (
          <Text style={styles.noScoresText}>No scores recorded yet</Text>
        ) : (
          scores.map((score) => (
            <View key={score.id} style={styles.scoreCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.dateText}>{formatDate(score.created_at)}</Text>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    deleting === score.id && styles.deleteButtonDisabled
                  ]}
                  onPress={() => handleDelete(score.id)}
                  disabled={deleting === score.id}
                >
                  <Trash2 
                    size={20} 
                    color={deleting === score.id ? '#666666' : '#ff0000'} 
                    strokeWidth={2.5}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.scoreGrid}>
                <ScoreItem label="Unit Day" value={formatNumber(score.unit_day_score)} />
                <ScoreItem label="Summon Day" value={formatNumber(score.summon_day_score)} />
                <ScoreItem label="Witch Day" value={formatNumber(score.witch_day_score)} />
                <ScoreItem label="Gear Day" value={formatNumber(score.gear_day_score)} />
                <ScoreItem label="Dragon Day" value={formatNumber(score.dragon_day_score)} />
                <ScoreItem label="Hero Day" value={formatNumber(score.heroes_day_score)} />
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Score:</Text>
                <Text style={styles.totalValue}>{formatNumber(score.total_score)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ScoreItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.scoreItem}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  // Add back button styles
  backButton: {
    position: 'absolute',
    top: 50, // Adjust based on your safe area
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10, // Make sure it appears above other elements
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    marginLeft: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Add scrollView styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 90, // Add padding to account for the back button
  },
  loadingText: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 90, // Adjust for back button
    fontFamily: 'MedievalSharp',
  },
  noScoresText: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'MedievalSharp',
    fontSize: 18,
  },
  scoreCard: {
    backgroundColor: '#2a2a2a',
    margin: 10,
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ff0000',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scoreItem: {
    width: '48%',
    marginBottom: 10,
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 5,
  },
  scoreLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
  },
  scoreValue: {
    color: '#ff0000',
    fontSize: 18,
    fontFamily: 'MedievalSharp',
    marginTop: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'MedievalSharp',
  },
  totalValue: {
    color: '#ff0000',
    fontSize: 24,
    fontFamily: 'MedievalSharp',
  },
});