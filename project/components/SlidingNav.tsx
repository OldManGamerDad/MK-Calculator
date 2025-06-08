// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, TextInput, Alert, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
  Extrapolate,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { MessageSquare, ListOrdered, User, Swords, ScrollText, CookingPot, Hammer, Castle, Sword, ShieldPlus, ArrowDown as BowArrow, Home, Calculator, ChevronDown, ChevronRight, Settings } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NAV_WIDTH = Math.min(220, SCREEN_WIDTH * 0.55);
const UTILITIES_WIDTH = 180;
const DRAGON_BUTTON_TOP_POSITION = SCREEN_HEIGHT * 0.15; // 15% from top
const UTILITY_ITEM_HEIGHT = 42; // Height of each utility item
const UTILITY_ITEM_MARGIN = 10; // Margin between items
const UTILITY_PANEL_PADDING = 30; // Top and bottom padding

export default function SlidingNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [kingdomGuardName, setKingdomGuardName] = useState('');
  const [discordName, setDiscordName] = useState('');
  const [utilitiesExpanded, setUtilitiesExpanded] = useState(false);
  
  // Move navigation items INSIDE the component function so they update when language changes
  const mainNavItems = [
    { name: t('days.unit'), route: '/(app)/Unit-Day', color: '#ff4d4d', icon: Swords },
    { name: t('days.summon'), route: '/(app)/Summon-Day', color: '#4d94ff', icon: ScrollText },
    { name: t('days.witch'), route: '/(app)/Witch-Day', color: '#9933ff', icon: CookingPot },
    { name: t('days.gear'), route: '/(app)/Gear-Day', color: '#ffcc00', icon: Hammer },
    { name: t('days.dragon'), route: '/(app)/Dragon-Day', color: '#00cc66', icon: Castle },
    { name: t('days.hero'), route: '/(app)/Hero-Day', color: '#ff6600', icon: Sword },
  ];

  const ultimateNavItems = [
    { name: t('specialEvents.ultimatePower'), route: '/(app)/Ultimate-Power', color: '#8b0000', icon: ShieldPlus },
    { name: t('specialEvents.ultimateHunting'), route: '/(app)/Ultimate-Hunting', color: '#2d5a27', icon: BowArrow },
  ];

  const utilityItems = [
    { name: t('tabs.calculator'), route: '/(app)/calculator', color: '#ff0000', icon: Calculator },
    { name: t('navigation.weeklyScores'), route: '/(app)/WeeklyScores', color: '#4d94ff', icon: ListOrdered },
    { name: t('tabs.profile'), route: '/(tabs)/profile', color: '#ff6600', icon: User },
    { name: t('navigation.contact'), color: '#ff0000', icon: MessageSquare, isAction: true },
  ];

  // Calculate dynamic height for utilities panel
  const utilitiesPanelHeight = (utilityItems.length * UTILITY_ITEM_HEIGHT) + ((utilityItems.length - 1) * UTILITY_ITEM_MARGIN) + UTILITY_PANEL_PADDING;
  
  // Animation values
  const translateX = useSharedValue(-NAV_WIDTH);
  const dragonBreathe = useSharedValue(1);
  const overlayOpacity = useSharedValue(0);
  const utilitiesTranslateX = useSharedValue(-UTILITIES_WIDTH);
  const utilitiesOpacity = useSharedValue(0);
  
  // Magic particles (simplified to 5 particles)
  const particleOpacity = Array.from({ length: 5 }, () => useSharedValue(0));
  const particleTranslateX = Array.from({ length: 5 }, () => useSharedValue(0));
  const particleTranslateY = Array.from({ length: 5 }, () => useSharedValue(0));
  
  // Dragon breathing animation
  useEffect(() => {
    const breathAnimation = () => {
      dragonBreathe.value = withSequence(
        withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      );
      
      setTimeout(breathAnimation, 3000);
    };
    
    breathAnimation();
  }, []);

  // Utilities expand/collapse animation
  const toggleUtilities = () => {
    console.log('Toggle utilities called, current state:', utilitiesExpanded);
    const newExpandedState = !utilitiesExpanded;
    setUtilitiesExpanded(newExpandedState);
    
    if (newExpandedState) {
      // Expanding - slide in from left
      console.log('Expanding utilities');
      utilitiesTranslateX.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      utilitiesOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // Collapsing - slide out to left
      console.log('Collapsing utilities');
      utilitiesOpacity.value = withTiming(0, { duration: 200 });
      utilitiesTranslateX.value = withSpring(-UTILITIES_WIDTH, {
        damping: 15,
        stiffness: 100,
      });
    }
  };

  // Simplified particle animation
  const animateParticles = (opening: boolean) => {
    for (let i = 0; i < 5; i++) {
      if (opening) {
        const randomX = Math.random() * 80 - 40;
        const randomY = Math.random() * 200 - 100;
        const delay = i * 100;
        
        particleOpacity[i].value = 0;
        particleTranslateX[i].value = randomX;
        particleTranslateY[i].value = randomY;
        
        // Animate in
        particleOpacity[i].value = withDelay(
          delay,
          withTiming(0.8, { duration: 400 })
        );
        
        particleTranslateX[i].value = withDelay(
          delay,
          withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) })
        );
        
        particleTranslateY[i].value = withDelay(
          delay,
          withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) })
        );
        
        // Fade out
        particleOpacity[i].value = withDelay(
          delay + 600,
          withTiming(0, { duration: 200 })
        );
      } else {
        // Closing animation
        const randomX = Math.random() * 100 - 50;
        const randomY = Math.random() * 100 - 50;
        const delay = i * 50;
        
        particleOpacity[i].value = withDelay(
          delay,
          withTiming(0.6, { duration: 200 })
        );
        
        particleTranslateX[i].value = withDelay(
          delay,
          withTiming(randomX, { duration: 400 })
        );
        
        particleTranslateY[i].value = withDelay(
          delay,
          withTiming(randomY, { duration: 400 })
        );
        
        particleOpacity[i].value = withDelay(
          delay + 200,
          withTiming(0, { duration: 200 })
        );
      }
    }
  };

  const toggleNav = () => {
    if (!isOpen) {
      // Opening
      overlayOpacity.value = withTiming(0.7, { duration: 400 });
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
      animateParticles(true);
    } else {
      // Closing - also collapse utilities
      overlayOpacity.value = withTiming(0, { duration: 300 });
      translateX.value = withSpring(-NAV_WIDTH, {
        damping: 20,
        stiffness: 90,
      });
      animateParticles(false);
      
      // Close utilities submenu when closing nav
      if (utilitiesExpanded) {
        setUtilitiesExpanded(false);
        utilitiesOpacity.value = withTiming(0, { duration: 200 });
        utilitiesTranslateX.value = withSpring(-UTILITIES_WIDTH, {
          damping: 15,
          stiffness: 100,
        });
      }
    }
    
    setIsOpen(!isOpen);
  };

  const handleContact = async () => {
    if (!message.trim()) {
      Alert.alert(t('common.error'), t('navigation.enterMessage'));
      return;
    }

    // Close message modal and show name collection modal
    setShowContactModal(false);
    setShowNameModal(true);
  };

  const sendToDiscord = async () => {
    if (!kingdomGuardName.trim() || !discordName.trim()) {
      Alert.alert(t('common.error'), t('navigation.enterBothNames'));
      return;
    }

    setSending(true);
    try {
      // Your Discord webhook URL
      const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1379761782670884944/176NmIRX0sDyYgHTikjJDg-rG8snz53XNVi1R9YhjMSr3ci6861zTHFdZgHxz8OZOe1C';
      
      // Create Discord embed message
      const discordMessage = {
        embeds: [{
          title: "📱 New Kingdom Guard Contact Message",
          color: 0xff4d4d, // Red color to match your app theme
          fields: [
            {
              name: "🏰 Kingdom Guard Name", 
              value: kingdomGuardName,
              inline: true
            },
            {
              name: "💬 Discord Name",
              value: discordName,
              inline: true
            },
            {
              name: "📝 Message",
              value: message,
              inline: false
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "Kingdom Guard App Contact"
          }
        }]
      };

      // Send to Discord
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordMessage),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status}`);
      }

      Alert.alert(t('common.success'), t('navigation.messageSent'));
      
      // Clear all fields and close modals
      setMessage('');
      setKingdomGuardName('');
      setDiscordName('');
      setShowNameModal(false);
      
    } catch (error) {
      console.error('Error sending Discord message:', error);
      Alert.alert(t('common.error'), t('navigation.messageFailed'));
    } finally {
      setSending(false);
    }
  };

  const navStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-NAV_WIDTH, 0],
      [0, 180],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value + NAV_WIDTH },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const dragonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: dragonBreathe.value },
        { scaleX: isOpen ? -1 : 1 }
      ],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
      pointerEvents: overlayOpacity.value > 0 ? 'auto' : 'none',
    };
  });

  const utilitiesContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: utilitiesTranslateX.value }],
      opacity: utilitiesOpacity.value,
      pointerEvents: utilitiesExpanded ? 'auto' : 'none',
    };
  });

  const getCurrentDayColor = () => {
    const currentRoute = [...mainNavItems, ...ultimateNavItems].find(item => pathname.includes(item.route));
    return currentRoute?.color || '#ffffff';
  };

  // Render magic particles
  const renderParticles = () => {
    return particleOpacity.map((_, index) => (
      <Animated.View 
        key={`particle-${index}`}
        style={[
          styles.magicParticle,
          {
            left: NAV_WIDTH / 2,
            top: '50%',
          },
          useAnimatedStyle(() => ({
            opacity: particleOpacity[index].value,
            transform: [
              { translateX: particleTranslateX[index].value },
              { translateY: particleTranslateY[index].value },
            ],
            backgroundColor: index % 2 === 0 ? '#ff9500' : '#ffcc00',
          }))
        ]}
      />
    ));
  };

  return (
    <>
      {/* Original Contact Modal */}
      {showContactModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('navigation.contactTitle')}</Text>
            <TextInput
              style={styles.messageInput}
              placeholder={t('navigation.enterMessagePlaceholder')}
              placeholderTextColor="#666"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowContactModal(false);
                  setMessage('');
                }}
              >
                <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleContact}
              >
                <Text style={styles.modalButtonText}>{t('common.next')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Name Collection Modal */}
      {showNameModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('navigation.yourInfo')}</Text>
            <Text style={styles.modalSubtitle}>{t('navigation.enterGameDetails')}</Text>
            
            <TextInput
              style={styles.nameInput}
              placeholder={t('profile.enterGamerTag')}
              placeholderTextColor="#666"
              value={kingdomGuardName}
              onChangeText={setKingdomGuardName}
            />
            
            <TextInput
              style={styles.nameInput}
              placeholder={t('navigation.enterDiscordName')}
              placeholderTextColor="#666"
              value={discordName}
              onChangeText={setDiscordName}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowNameModal(false);
                  setKingdomGuardName('');
                  setDiscordName('');
                  setShowContactModal(true); // Go back to message modal
                }}
              >
                <Text style={styles.modalButtonText}>{t('common.back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton, sending && styles.buttonDisabled]}
                onPress={sendToDiscord}
                disabled={sending}
              >
                <Text style={styles.modalButtonText}>
                  {sending ? t('common.loading') : t('common.submit')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Overlay */}
      <Animated.View style={[styles.navOverlay, overlayStyle]}>
        <TouchableOpacity 
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={toggleNav}
        />
      </Animated.View>

      {/* Main Navigation */}
      <Animated.View style={[styles.container, navStyle]}>
        {renderParticles()}
        
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('navigation.title')}</Text>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => {
                router.push('/(tabs)');
                toggleNav();
              }}
            >
              <Home size={20} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Utilities Collapsible Button - Moved to Top */}
          <TouchableOpacity 
            style={[styles.utilitiesHeader, utilitiesExpanded && styles.utilitiesHeaderExpanded]} 
            onPress={toggleUtilities}
          >
            <View style={styles.utilitiesHeaderContent}>
              <Settings size={18} color="#ffcc00" />
              <Text style={styles.utilitiesHeaderText}>{t('navigation.utilities')}</Text>
              {utilitiesExpanded ? (
                <ChevronDown size={18} color="#ffcc00" />
              ) : (
                <ChevronRight size={18} color="#ffcc00" />
              )}
            </View>
          </TouchableOpacity>

          {/* MK Days Section */}
          <View style={styles.ultimateDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.sectionHeaderText}>MK Days</Text>
            <View style={styles.dividerLine} />
          </View>

          {mainNavItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.navItem,
                pathname.includes(item.route) && styles.activeNavItem,
                { borderColor: `${item.color}60` }
              ]}
              onPress={() => {
                router.push(item.route as any);
                toggleNav();
              }}
            >
              <View style={styles.navItemContent}>
                <item.icon size={20} color={pathname.includes(item.route) ? item.color : '#ffffff'} />
                <Text
                  style={[
                    styles.navText,
                    pathname.includes(item.route) && { color: item.color }
                  ]}
                >
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.ultimateDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.sectionHeaderText}>{t('specialEvents.title')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {ultimateNavItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.navItem,
                pathname.includes(item.route) && styles.activeNavItem,
                { borderColor: `${item.color}60` }
              ]}
              onPress={() => {
                router.push(item.route as any);
                toggleNav();
              }}
            >
              <View style={styles.navItemContent}>
                <item.icon size={20} color={pathname.includes(item.route) ? item.color : '#ffffff'} />
                <Text
                  style={[
                    styles.navText,
                    pathname.includes(item.route) && { color: item.color }
                  ]}
                >
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Utilities Side Panel */}
        <Animated.View style={[
          styles.utilitiesSidePanel, 
          utilitiesContainerStyle,
          { height: utilitiesPanelHeight }
        ]}>
          <View style={styles.utilitiesPanelContent}>
            {utilityItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.utilityItem, { borderColor: `${item.color}60` }]}
                onPress={() => {
                  if (item.isAction) {
                    setShowContactModal(true);
                  } else {
                    router.push(item.route as any);
                  }
                  toggleNav();
                }}
              >
                <View style={styles.utilityItemContent}>
                  <item.icon size={16} color={item.color} />
                  <Text style={[styles.utilityText, { color: item.color }]}>
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Dragon Toggle Button */}
      <Animated.View style={[styles.toggleButton, buttonStyle]}>
        <TouchableOpacity
          style={[styles.toggleButtonInner, { borderColor: `${getCurrentDayColor()}80` }]}
          onPress={toggleNav}
        >
          <Animated.View style={dragonStyle}>
            <Image 
              source={{ uri: 'https://iili.io/3WiP5QI.png' }} 
              style={styles.dragonIcon}
            />
          </Animated.View>
          
          {/* Dragon Fire Breath - only show when closed */}
          {!isOpen && (
            <View style={styles.fireBreath}>
              <View style={styles.fireParticle} />
              <View style={[styles.fireParticle, styles.fireParticle2]} />
              <View style={[styles.fireParticle, styles.fireParticle3]} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: NAV_WIDTH,
    backgroundColor: 'rgba(18, 18, 18, 0.95)', // Solid dark background
    borderRightWidth: 1,
    borderRightColor: 'rgba(238, 199, 71, 0.4)', // Golden border to match theme
    zIndex: 1000,
    ...Platform.select({
      web: {
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
      },
      default: {
        elevation: 3,
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
    }),
  },
  navOverlay: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  content: {
    flex: 1,
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingLeft: 40,
  },
  title: {
    fontFamily: 'MedievalSharp',
    fontSize: 20,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  homeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  navItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  activeNavItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  navText: {
    fontFamily: 'MedievalSharp',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ultimateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  dividerText: {
    color: '#ffffff',
    fontFamily: 'MedievalSharp',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sectionHeaderText: {
    color: '#ffcc00',
    fontFamily: 'MedievalSharp',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontWeight: 'bold',
  },
  utilitiesHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 204, 0, 0.3)',
  },
  utilitiesHeaderExpanded: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 204, 0, 0.6)',
  },
  utilitiesHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  utilitiesHeaderText: {
    fontFamily: 'MedievalSharp',
    fontSize: 14,
    color: '#ffcc00',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  utilitiesContainer: {
    overflow: 'hidden',
  },
  utilitiesSidePanel: {
    position: 'absolute',
    left: NAV_WIDTH,
    top: DRAGON_BUTTON_TOP_POSITION + 50, // Position below dragon button
    width: UTILITIES_WIDTH,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(238, 199, 71, 0.4)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: 'rgba(238, 199, 71, 0.4)',
    borderBottomColor: 'rgba(238, 199, 71, 0.4)',
    borderRadius: 8,
    zIndex: 999,
    ...Platform.select({
      web: {
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
      },
      default: {
        elevation: 3,
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
    }),
  },
  utilitiesPanelContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'flex-start',
  },
  utilityItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  utilityItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  utilityText: {
    fontFamily: 'MedievalSharp',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  toggleButton: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    left: 0,
    top: DRAGON_BUTTON_TOP_POSITION,
    transform: [{ translateY: -15 }],
    zIndex: 1001,
  },
  toggleButtonInner: {
    width: 40,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderLeftWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'visible',
    ...Platform.select({
      web: {
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(5px)',
      },
      default: {
        elevation: 3,
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
    }),
  },
  dragonIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: '#ff0000',
  },
  fireBreath: {
    position: 'absolute',
    right: -15,
    top: '50%',
    marginTop: -3,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: -1,
  },
  fireParticle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff9500',
    marginRight: 2,
    opacity: 0.8,
  },
  fireParticle2: {
    width: 4,
    height: 4,
    backgroundColor: '#ffcc00',
    borderRadius: 2,
  },
  fireParticle3: {
    width: 3,
    height: 3,
    backgroundColor: '#ffffaa',
    borderRadius: 1.5,
  },
  magicParticle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    zIndex: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  modalTitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalSubtitle: {
    fontFamily: 'MedievalSharp',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 15,
  },
  messageInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(102, 102, 102, 0.8)',
  },
  sendButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'MedievalSharp',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});