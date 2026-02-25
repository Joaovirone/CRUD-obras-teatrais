import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors, elevations } from '@/app/constants/colors';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  size = 'large',
  color = Colors.primary,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  
  const sizeConfig = {
    small: { width: 48, height: 48, fontSize: 22 },
    medium: { width: 56, height: 56, fontSize: 26 },
    large: { width: 64, height: 64, fontSize: 30 },
  };
  
  const config = sizeConfig[size];
  
  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.fab,
          {
            width: config.width,
            height: config.height,
            backgroundColor: color,
          },
          elevations['8'],
        ]}
      >
        <Text style={[styles.icon, { fontSize: config.fontSize }]}>{icon}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

import { Text } from 'react-native';

const styles = StyleSheet.create({
  fab: {
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});
