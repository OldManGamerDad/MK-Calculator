import { Stack } from 'expo-router';
import CalculatorScreen from '@/components/Calculator';

export default function CalculatorLayout() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Calculator',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontFamily: 'MedievalSharp',
          },
        }} 
      />
      <CalculatorScreen />
    </>
  );
}