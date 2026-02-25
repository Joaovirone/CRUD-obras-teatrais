import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface GradientBackgroundProps {
  type: 'login' | 'register';
  children: React.ReactNode;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ type, children }) => {
  const gradient = type === 'login' ? Colors.gradients.login : Colors.gradients.register;
  
  return (
    <LinearGradient
      colors={[gradient.start, gradient.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
