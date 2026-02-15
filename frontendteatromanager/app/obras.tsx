import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function ObrasScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'adicionar' | 'visualizar'>('adicionar');
  const [obras, setObras] = useState<any[]>([]);
  
  const [form, setForm] = useState({ titulo: '', autor: '', data: '', descricao: '' });

  const API_URL = 'http://localhost:5002/api/obras';

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) router.replace('/');
    if (activeTab === 'visualizar') fetchObras();
  }, [activeTab]);

  const fetchObras = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setObras(data);
      }
    } catch (e) {
      console.error("Erro ao carregar:", e);
    }
  };

  const handleSave = async () => {
    if (!form.titulo || !form.autor || !form.data) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios (*)');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Obra salva no banco de dados!');
        setForm({ titulo: '', autor: '', data: '', descricao: '' });
        setActiveTab('visualizar'); // Muda para a lista após salvar
      } else {
        const errorMsg = await response.text();
        Alert.alert('Erro do Servidor', errorMsg || 'Verifique o console do backend.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Conexão recusada. O Docker está rodando na 5002?');
    } finally {
      setLoading(false);
    }
  };

  const deleteObra = async (id: number) => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchObras();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível apagar.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>🎭 Teatro Manager</Text>
        <TouchableOpacity onPress={() => { localStorage.removeItem('userToken'); router.replace('/'); }}>
          <Text style={styles.logoutText}>SAIR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuTab}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'adicionar' && styles.tabActive]} 
          onPress={() => setActiveTab('adicionar')}
        >
          <Text style={[styles.tabText, activeTab === 'adicionar' && styles.tabTextActive]}>ADICIONAR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'visualizar' && styles.tabActive]} 
          onPress={() => setActiveTab('visualizar')}
        >
          <Text style={[styles.tabText, activeTab === 'visualizar' && styles.tabTextActive]}>VISUALIZAR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'adicionar' ? (
          <View style={styles.card}>
            <Text style={styles.label}>Título da Obra *</Text>
            <TextInput style={styles.input} value={form.titulo} onChangeText={(t) => setForm({...form, titulo: t})} placeholder="Ex: O Fantasma da Ópera" />

            <Text style={styles.label}>Autor / Diretor *</Text>
            <TextInput style={styles.input} value={form.autor} onChangeText={(t) => setForm({...form, autor: t})} placeholder="Ex: Andrew Lloyd Webber" />

            <Text style={styles.label}>Data da Apresentação *</Text>
            <input 
              type="date" 
              style={webInputStyle} 
              value={form.data} 
              onChange={(e) => setForm({...form, data: e.target.value})} 
            />

            <Text style={styles.label}>Descrição (Opcional)</Text>
            <TextInput style={[styles.input, styles.textArea]} value={form.descricao} onChangeText={(t) => setForm({...form, descricao: t})} multiline placeholder="Conte um pouco sobre a peça..." />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>SALVAR OBRA NO BANCO</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {obras.length === 0 ? <Text style={{textAlign: 'center', marginTop: 20, color: '#999'}}>Nenhuma obra cadastrada.</Text> : 
              obras.map((item) => (
                <View key={item.id} style={styles.obraCard}>
                  <View style={{flex: 1}}>
                    <Text style={styles.obraTitle}>{item.titulo}</Text>
                    <Text style={styles.obraInfo}>{item.autor} • {item.data}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteObra(item.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>APAGAR</Text>
                  </TouchableOpacity>
                </View>
              ))
            }
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const webInputStyle = {
  padding: '15px',
  borderRadius: '12px',
  border: '1px solid #DDD',
  marginBottom: '20px',
  fontSize: '16px',
  outline: 'none',
  backgroundColor: '#F8F9FA'
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  topBar: { paddingTop: 60, padding: 25, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  topBarTitle: { fontSize: 20, fontWeight: '800', color: '#6200EE' },
  logoutText: { color: '#FF4757', fontWeight: 'bold', fontSize: 14 },
  menuTab: { flexDirection: 'row', backgroundColor: '#FFF' },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#6200EE' },
  tabText: { fontWeight: 'bold', color: '#999', fontSize: 13 },
  tabTextActive: { color: '#6200EE' },
  content: { padding: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#DDD' },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#6200EE', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  obraCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 15, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  obraTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  obraInfo: { color: '#666', fontSize: 13, marginTop: 4 },
  deleteBtn: { backgroundColor: '#FFE5E5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  deleteBtnText: { color: '#FF4757', fontWeight: 'bold', fontSize: 11 }
});