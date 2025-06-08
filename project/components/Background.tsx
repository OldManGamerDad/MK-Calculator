import { View, StyleSheet, Platform } from 'react-native';

interface BackgroundProps {
  children: React.ReactNode;
}

export default function Background({ children }: BackgroundProps) {
  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    ...(Platform.OS === 'web' && {
      position: 'absolute' as any, // Fixed: Cast to any for web-specific styles
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }),
  },
  overlay: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      minHeight: '100%' as any, // Fixed: Use 100% instead of 100vh and cast to any
      position: 'relative' as any, // Fixed: Cast to any for web-specific styles
      zIndex: 1,
    }),
  },
});