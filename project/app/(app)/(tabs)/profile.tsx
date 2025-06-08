import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, TextInput, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, CreditCard as Edit2, Save, X, Trash2, ArrowLeft } from 'lucide-react-native';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';

const DEFAULT_PROFILE_IMAGE = 'https://i.ibb.co/QvDPwn16/Funny-Dragon-1.png';
const BACKGROUND_IMAGE_URL = 'https://iili.io/3NjdOYv.png';
const PROFILE_STORAGE_KEY = 'user_profile_data';

interface UserData {
  email: string;
  gamerTag: string;
  discordHandle: string;
  profileImage: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    email: '',
    gamerTag: '',
    discordHandle: '',
    profileImage: DEFAULT_PROFILE_IMAGE
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData>(userData);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedData) {
        const parsedData: UserData = JSON.parse(savedData);
        setUserData(parsedData);
        setEditedData(parsedData);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const saveUserData = async (dataToSave: UserData): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error('Error saving profile data:', error);
      return false;
    }
  };

  const pickImage = async () => {
    if (!isEditing) return;

    try {
      // Show action sheet for image source selection
      Alert.alert(
        "Select Profile Photo",
        "Choose how you'd like to add your profile photo",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Choose from Gallery", onPress: () => selectFromGallery() },
          { text: "Take Photo", onPress: () => takePhoto() }
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.pickImageError'));
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        // Show confirmation dialog
        Alert.alert(
          "Save Profile Photo",
          "Do you want to use this image as your profile photo?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Save", 
              onPress: () => {
                setEditedData(prev => ({
                  ...prev,
                  profileImage: result.assets[0].uri
                }));
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.pickImageError'));
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        // Show confirmation dialog
        Alert.alert(
          "Save Profile Photo",
          "Do you want to use this photo as your profile photo?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Save", 
              onPress: () => {
                setEditedData(prev => ({
                  ...prev,
                  profileImage: result.assets[0].uri
                }));
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.pickImageError'));
    }
  };

  const deleteProfileImage = () => {
    Alert.alert(
      t('profile.deletePhotoTitle'),
      t('profile.deletePhotoMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setEditedData(prev => ({
              ...prev,
              profileImage: DEFAULT_PROFILE_IMAGE
            }));
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const success = await saveUserData(editedData);
      if (success) {
        setUserData(editedData);
        setIsEditing(false);
        Alert.alert(t('common.success'), t('profile.updateSuccess'));
      } else {
        Alert.alert(t('common.error'), t('profile.updateError'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t('profile.clearDataTitle'),
      t('profile.clearDataMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
              const defaultData: UserData = {
                email: '',
                gamerTag: '',
                discordHandle: '',
                profileImage: DEFAULT_PROFILE_IMAGE
              };
              setUserData(defaultData);
              setEditedData(defaultData);
              router.replace('/(tabs)');
            } catch (error) {
              Alert.alert(t('common.error'), t('profile.clearDataError'));
            }
          }
        }
      ]
    );
  };

  const showDeleteButton = isEditing && editedData.profileImage !== DEFAULT_PROFILE_IMAGE;

  return (
    <ImageBackground
      source={{ uri: BACKGROUND_IMAGE_URL }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#ffffff" strokeWidth={2.5} />
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        
        <View style={styles.content}>
          <Text style={styles.title}>{t('tabs.profile')}</Text>
          
          <View style={styles.imageSection}>
            <TouchableOpacity 
              style={[
                styles.imageContainer,
                isEditing && styles.imageContainerEditing
              ]} 
              onPress={isEditing ? pickImage : undefined}
            >
              <Image 
                source={{ uri: editedData.profileImage }} 
                style={styles.profileImage}
                defaultSource={{ uri: DEFAULT_PROFILE_IMAGE }}
              />
              {isEditing && (
                <View style={styles.cameraIcon}>
                  <Camera size={24} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            {showDeleteButton && (
              <TouchableOpacity 
                style={styles.deletePhotoButton}
                onPress={deleteProfileImage}
                disabled={loading}
              >
                <Trash2 size={18} color="#ff0000" />
                <Text style={styles.deletePhotoText}>{t('common.deletePhoto')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('profile.gamerTag')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedData.gamerTag}
                  onChangeText={(text) => setEditedData(prev => ({ ...prev, gamerTag: text }))}
                  placeholder={t('profile.enterGamerTag')}
                  placeholderTextColor="#666"
                />
              ) : (
                <Text style={styles.value}>{userData.gamerTag || t('profile.notSet')}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('profile.discordHandle')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedData.discordHandle}
                  onChangeText={(text) => setEditedData(prev => ({ ...prev, discordHandle: text }))}
                  placeholder={t('profile.enterDiscord')}
                  placeholderTextColor="#666"
                />
              ) : (
                <Text style={styles.value}>{userData.discordHandle || t('profile.notSet')}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('profile.email')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedData.email}
                  onChangeText={(text) => setEditedData(prev => ({ ...prev, email: text }))}
                  placeholder={t('profile.enterEmail')}
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.value}>{userData.email || t('profile.notSet')}</Text>
              )}
            </View>

            <View style={styles.buttonContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={() => {
                      setEditedData(userData);
                      setIsEditing(false);
                    }}
                    disabled={loading}
                  >
                    <X size={18} color="#ffffff" />
                    <Text style={styles.editButtonText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editButton, styles.saveButton, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                  >
                    <Save size={18} color="#ffffff" />
                    <Text style={styles.editButtonText}>
                      {loading ? t('common.saving') : t('common.save')}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.editButton, styles.editProfileButton]}
                  onPress={() => setIsEditing(true)}
                  disabled={loading}
                >
                  <Edit2 size={18} color="#ffffff" />
                  <Text style={styles.editButtonText}>{t('common.editProfile')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.languageContainer}>
            <LanguageSelector />
          </View>

          <TouchableOpacity
            style={[styles.signOutButton, loading && styles.buttonDisabled]}
            onPress={handleSignOut}
            disabled={loading}
          >
            <Text style={styles.signOutButtonText}>{t('profile.clearData')}</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 35,
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
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 90,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'MedievalSharp',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(51, 51, 51, 0.7)',
    position: 'relative',
    borderWidth: 3,
    borderColor: 'rgba(255, 0, 0, 0.8)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  imageContainerEditing: {
    opacity: 0.8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderRadius: 16,
    padding: 6,
  },
  deletePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.5)',
  },
  deletePhotoText: {
    color: '#ff0000',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  infoContainer: {
    backgroundColor: 'rgba(42, 42, 42, 0.7)',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  label: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'MedievalSharp',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  value: {
    color: '#ff0000',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#000000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  editProfileButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  cancelButton: {
    backgroundColor: 'rgba(102, 102, 102, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(102, 102, 102, 0.3)',
  },
  saveButton: {
    backgroundColor: 'rgba(0, 204, 102, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 204, 102, 0.3)',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  languageContainer: {
    backgroundColor: 'rgba(42, 42, 42, 0.7)',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});