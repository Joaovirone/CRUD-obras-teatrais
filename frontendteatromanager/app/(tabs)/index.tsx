import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:5002/api/v1/usuarios';

  const handleAuth = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos para continuar.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/cadastrar';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: senha }),
      });

      if (response.ok) {
        const data = await response.text();
        localStorage.setItem('userToken', data);
        Alert.alert('Sucesso', isLogin ? 'Bem-vindo de volta!' : 'Conta criada com sucesso!');
        router.replace('/obras');
      } else {
        Alert.alert('Erro', 'Credenciais inválidas ou usuário já existe.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Certifique-se que o backend (5002) está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>🎭 Teatro</Text>
          <Text style={styles.welcome}>{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</Text>
          <Text style={styles.subtitle}>Gerencie suas obras e produções</Text>
        </View>

        <View style={styles.form}>
          <TextInput 
            style={styles.input} 
            placeholder="Usuario" 
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Senha" 
            placeholderTextColor="#999"
            secureTextEntry 
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity style={styles.mainButton} onPress={handleAuth} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <Text style={styles.mainButtonText}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? 'Ainda não tem conta? Clique aqui' : 'Já possui conta? Faça login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  innerContainer: { flex: 1, padding: 30, justifyContent: 'center' },
  header: { marginBottom: 40, alignItems: 'center' },
  logo: { fontSize: 50, marginBottom: 10 },
  welcome: { fontSize: 28, fontWeight: '800', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  form: { width: '100%' },
  input: { 
    backgroundColor: '#F5F5F5', 
    padding: 18, 
    borderRadius: 15, 
    marginBottom: 15, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  mainButton: { 
    backgroundColor: '#6200EE', 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#6200EE',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  mainButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  switchButton: { marginTop: 25, alignItems: 'center' },
  switchText: { color: '#6200EE', fontWeight: '600', fontSize: 14 }
});