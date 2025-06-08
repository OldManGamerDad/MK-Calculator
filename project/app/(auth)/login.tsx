import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) throw signInError;
      if (!data.user) throw new Error('No user data returned');

      router.replace('/(app)/(tabs)');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1599790772272-d1425cd3242e?q=80&w=1920' }}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>FAFO</Text>
        <Text style={styles.subtitle}>Mightiest Calculator</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
          />
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading || !email || !password}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerText}>
              Don't have an account? Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'MedievalSharp',
    fontSize: 64,
    color: '#ffffff',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 24,
    color: '#ff0000',
    marginBottom: 40,
    textShadowColor: 'rgba(255, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#000000',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
  },
  button: {
    backgroundColor: '#ff0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#666666',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'MedievalSharp',
  },
  registerButton: {
    marginTop: 20,
    padding: 10,
  },
  registerText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
  },
});