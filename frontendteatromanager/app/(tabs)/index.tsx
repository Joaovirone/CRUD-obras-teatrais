import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import Feedback, { FeedbackType } from '../components/Feedback';
import { Colors } from '../constants/colors';

const API_BASE = 'http://localhost:5002/api/v1/usuarios';

/**
 * Limpa token extraindo de JSON se necessário e removendo aspas
 */
const cleanTokenFromResponse = (rawToken: string): string => {
  try {
    // Tentar parsear como JSON primeiro
    const parsed = JSON.parse(rawToken);
    const token = typeof parsed === 'object' ? parsed.token : parsed;
    // Remover aspas e espaços em branco
    return String(token).replace(/^"|"$/g, '').trim();
  } catch {
    // Se não for JSON válido, limpar direto
    return String(rawToken).replace(/^"|"$/g, '').trim();
  }
};

export default function AuthScreen() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type?: FeedbackType } | null>(null);
  const [switchAnim] = useState(new Animated.Value(0));

  /**
   * Effect: Validar token e redirecionar para /obras se autenticado
   * Usa useRootNavigationState para garantir que o Root Layout está 100% montado
   */
  useEffect(() => {
    if (!navigationState?.key) return;

    // setTimeout garante execução APÓS o Root Layout estar totalmente pronto
    const navigationTimer = setTimeout(() => {
      const token = localStorage.getItem('userToken');
      const isValidToken = token && token !== 'undefined' && token !== 'null' && token.length > 0;
      
      if (isValidToken) {
        console.log('[AUTH] Token válido encontrado. Redirecionando para /obras');
        router.replace('/obras');
      }
    }, 100);

    return () => clearTimeout(navigationTimer);
  }, [navigationState?.key]);

  const handleSwitchMode = () => {
    Animated.timing(switchAnim, {
      toValue: isLogin ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsLogin(!isLogin);
    setEmail('');
    setSenha('');
    setSenhaConfirm('');
    setFeedback(null);
  };

  const validateForm = (): boolean => {
    if (!email?.trim() || !senha?.trim()) {
      setFeedback({
        message: 'Preencha todos os campos obrigatórios.',
        type: 'error',
      });
      return false;
    }

    if (!isLogin && senha !== senhaConfirm) {
      setFeedback({
        message: 'As senhas não correspondem.',
        type: 'error',
      });
      return false;
    }

    if (senha.length < 4) {
      setFeedback({
        message: 'A senha deve ter pelo menos 4 caracteres.',
        type: 'error',
      });
      return false;
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/cadastrar';
      const payload = { username: email.trim(), password: senha };

      console.log(`[AUTH] Enviando ${endpoint}:`, { username: email.trim(), password: '***' });

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const rawData = await response.text();
        const cleanToken = cleanTokenFromResponse(rawData);

        console.log('[AUTH] Sucesso. Token limpo e armazenado.');

        // Limpar storage e gravar novo token
        localStorage.clear();
        localStorage.setItem('userToken', cleanToken);

        setFeedback({
          message: isLogin ? '✓ Bem-vindo de volta!' : '✓ Conta criada com sucesso!',
          type: 'success',
        });

        // Aguardar 1s antes de navegar para dar feedback visual
        setTimeout(() => {
          if (navigationState?.key) {
            router.replace('/obras');
          }
        }, 1000);
      } else {
        const errorData = await response.text();
        console.error(`[AUTH ERROR] Status ${response.status}:`, errorData);

        let errorMsg = 'Erro ao processar solicitação.';
        if (response.status === 400 || response.status === 409) {
          errorMsg = isLogin
            ? 'Credenciais inválidas.'
            : 'Usuário já existe.';
        } else if (response.status === 401) {
          errorMsg = 'Acesso não autorizado.';
        } else if (response.status === 500) {
          errorMsg = 'Erro no servidor. Tente novamente.';
        }

        setFeedback({ message: errorMsg, type: 'error' });
      }
    } catch (error) {
      console.error('[AUTH NETWORK ERROR]', error);
      setFeedback({
        message: 'Erro de conexão. Verifique se o backend está rodando.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const gradient = isLogin ? Colors.gradients.login : Colors.gradients.register;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {feedback && (
        <Feedback
          message={feedback.message}
          type={feedback.type}
          onHide={() => setFeedback(null)}
        />
      )}

      <LinearGradient
        colors={[gradient.start, gradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLogin ? (
            <LoginForm
              email={email}
              senha={senha}
              onEmailChange={setEmail}
              onSenhaChange={setSenha}
              onSubmit={handleAuth}
              loading={loading}
            />
          ) : (
            <RegisterForm
              email={email}
              senha={senha}
              senhaConfirm={senhaConfirm}
              onEmailChange={setEmail}
              onSenhaChange={setSenha}
              onSenhaConfirmChange={setSenhaConfirm}
              onSubmit={handleAuth}
              loading={loading}
            />
          )}

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>
              {isLogin ? 'Ainda não tem conta? ' : 'Já possui uma conta? '}
            </Text>
            <TouchableOpacity onPress={handleSwitchMode}>
              <Text style={styles.switchLink}>
                {isLogin ? 'Criar conta' : 'Fazer login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  switchLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  switchLink: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});