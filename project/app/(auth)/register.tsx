import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gamerTag, setGamerTag] = useState('');
  const [profileImage, setProfileImage] = useState('https://i.ibb.co/wF4ND6c/default-profile.jpg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  async function handleRegister() {
    if (!email || !password || !gamerTag) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            gamerTag: gamerTag.trim(),
            profileImage: profileImage
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('No user data returned');

      router.replace('/(app)/(tabs)');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to create account. Please try again.');
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
        <Text style={styles.subtitle}>Create Account</Text>

        <View style={styles.form}>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <View style={styles.cameraIcon}>
              <Camera size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Gamer Tag"
            placeholderTextColor="#999"
            value={gamerTag}
            onChangeText={setGamerTag}
            autoCapitalize="none"
          />

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
            autoComplete="new-password"
          />
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading || !email || !password || !gamerTag}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginText}>
              Already have an account? Sign In
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
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333333',
    marginBottom: 20,
    alignSelf: 'center',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff0000',
    borderRadius: 20,
    padding: 8,
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
  loginButton: {
    marginTop: 20,
    padding: 10,
  },
  loginText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
  },
});