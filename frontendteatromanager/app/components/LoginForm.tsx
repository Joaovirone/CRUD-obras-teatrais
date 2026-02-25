import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { LabeledInput } from './LabeledInput';
import { Colors, elevations } from '@/app/constants/colors';
import Feedback, { FeedbackType } from './Feedback';

interface LoginFormProps {
  email: string;
  senha: string;
  onEmailChange: (text: string) => void;
  onSenhaChange: (text: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  senha,
  onEmailChange,
  onSenhaChange,
  onSubmit,
  loading,
  error,
}) => {
  const slideAnimation = useRef(new Animated.Value(-20)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.formContainer,
        {
          transform: [{ translateY: slideAnimation }],
          opacity: fadeAnimation,
        },
      ]}
    >
      <View style={styles.headerContainer}>
        <View style={styles.theaterIcon}>
          <Text style={styles.theaterEmoji}>🎭</Text>
        </View>
        <Text style={styles.title}>Bem-vindo</Text>
        <Text style={styles.subtitle}>Faça login na sua conta</Text>
      </View>

      <View style={styles.fieldsContainer}>
        <LabeledInput
          label="Usuário"
          placeholder="seu usuário"
          value={email}
          onChangeText={onEmailChange}
          editable={!loading}
          autoCapitalize="none"
          error={error}
        />
        <LabeledInput
          label="Senha"
          placeholder="sua senha"
          value={senha}
          onChangeText={onSenhaChange}
          editable={!loading}
          secureTextEntry
          error={error}
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, elevations['5']]}
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>ENTRAR</Text>
            <Text style={styles.buttonIcon}>→</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  theaterIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...elevations['5'],
  },
  theaterEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  fieldsContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  buttonIcon: {
    marginLeft: 8,
    fontSize: 16,
    opacity: 0.6,
  },
});
