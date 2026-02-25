import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Feedback, { FeedbackType } from './components/Feedback';
import ConfirmModal from './components/ConfirmModal';
import { FloatingActionButton } from './components/FloatingActionButton';
import { LabeledInput } from './components/LabeledInput';
import { apiFetch, getCleanToken } from './utils/apiFetch';
import { Colors, elevations } from '@/app/constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Obra {
  id: number;
  nome: string;
  diretor: string;
  data: string;
  local: string;
  elenco: string;
  descricao?: string;
  nota: number;
}

interface FormState {
  titulo: string;
  autor: string;
  data: string;
  descricao: string;
  local: string;
  elenco: string;
  nota: string;
}

const defaultForm: FormState = {
  titulo: '',
  autor: '',
  data: '',
  descricao: '',
  local: '',
  elenco: '',
  nota: '5',
};

export default function ObrasScreen() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'adicionar' | 'visualizar'>('visualizar');
  const [obras, setObras] = useState<Obra[]>([]);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editing, setEditing] = useState<Obra | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type?: FeedbackType } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Validar se a navegação raiz está pronta antes de navegar
    if (!navigationState?.key) return;
    
    const token = localStorage.getItem('userToken');
    if (!token || token === 'undefined' || token === '') {
      router.replace('/');
      return;
    }
    
    if (activeTab === 'visualizar') {
      fetchObras();
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [navigationState?.key, activeTab]);

  const fetchObras = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/obras');
      if (res.ok) {
        const data: Obra[] = await res.json();
        setObras(data);
      } else {
        const text = await res.text();
        console.error(`[FETCH OBRAS ERROR] ${res.status}:`, text);
        setFeedback({ message: 'Falha ao carregar obras.', type: 'error' });
      }
    } catch (e) {
      console.error('[FETCH OBRAS NETWORK ERROR]', e);
      setFeedback({ message: 'Erro de conexão ao buscar obras.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validação de campos obrigatórios
    if (!form.titulo?.trim() || !form.autor?.trim() || !form.data?.trim()) {
      setFeedback({
        message: 'Preencha campos obrigatórios: Nome, Diretor e Data.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    const operationType = editing ? 'UPDATE' : 'CREATE';
    
    try {
      // Formatar data com validação robusta
      let formattedDate = form.data.trim();
      
      if (formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD - OK
        console.log('[OBRA] Data já em formato válido:', formattedDate);
      } else if (formattedDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        // DD/MM/YYYY -> converter para YYYY-MM-DD
        const [day, month, year] = formattedDate.split('/');
        formattedDate = `${year}-${month}-${day}`;
        console.log('[OBRA] Data convertida para:', formattedDate);
      } else {
        throw new Error('Formato de data inválido. Use YYYY-MM-DD ou DD/MM/YYYY');
      }

      // Montar payload DTO conforme esperado pela API Java
      const payload = {
        nome: form.titulo.trim(),
        diretor: form.autor.trim(),
        data: formattedDate,
        descricao: form.descricao.trim() || 'Sem descrição adicional',
        local: form.local.trim() || 'Teatro Principal',
        elenco: form.elenco.trim() || 'Elenco a definir',
        nota: Math.min(10, Math.max(1, Number(form.nota) || 5)),
      };

      const endpoint = editing ? `/obras/${editing.id}` : '/obras';
      const httpMethod = editing ? 'PUT' : 'POST';

      console.log(`[OBRA ${operationType}] ${httpMethod} ${endpoint}`, payload);

      // Fazer requisição com apiFetch (centraliza headers e autorização)
      const response = await apiFetch(endpoint, {
        method: httpMethod,
        body: JSON.stringify(payload),
      });

      // Sucesso: resposta OK
      if (response.ok) {
        console.log(`[OBRA ${operationType}] Sucesso!`);
        setFeedback({
          message: editing ? '✓ Obra atualizada com sucesso!' : '✓ Obra criada com sucesso!',
          type: 'success',
        });
        
        // Limpar form e recarregar lista
        setForm(defaultForm);
        setEditing(null);
        setActiveTab('visualizar');
        
        // Recarregar obras com pequeno delay
        setTimeout(() => fetchObras(), 300);
        return;
      }

      // Erro: coletar resposta completa para debug
      let errorBody = '';
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType?.includes('application/json')) {
          errorBody = JSON.stringify(await response.json(), null, 2);
        } else {
          errorBody = await response.text();
        }
      } catch (parseError) {
        errorBody = '[Não foi possível parsear resposta]';
      }

      const statusCode = response.status;
      console.error(`[OBRA ${operationType} ERROR] Status ${statusCode}:`, errorBody);

      // Mensagens de erro específicas por status HTTP
      let userMessage = 'Erro ao salvar obra.';
      
      switch (statusCode) {
        case 400:
          userMessage = `Dados inválidos enviados para o servidor. Verifique os campos.`;
          break;
        case 401:
          userMessage = 'Sessão expirada. Faça login novamente.';
          // Redirecionar para login após 1.5s
          setTimeout(() => {
            localStorage.removeItem('userToken');
            router.replace('/');
          }, 1500);
          break;
        case 403:
          userMessage = 'Você não tem permissão para executar esta ação.';
          break;
        case 404:
          userMessage = 'Obra não encontrada.';
          break;
        case 409:
          userMessage = 'Conflito: Esta obra pode já estar sendo editada.';
          break;
        case 422:
          userMessage = 'Dados enviados são inválidos para o servidor.';
          break;
        case 500:
          userMessage = 'Erro no servidor. Tente novamente mais tarde.';
          break;
        default:
          userMessage = `Erro ${statusCode}: Não foi possível processar a requisição.`;
      }

      setFeedback({ message: userMessage, type: 'error' });

    } catch (error) {
      // Erro de rede ou parse
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[OBRA ${operationType} EXCEPTION]`, errorMessage);
      
      setFeedback({
        message: `Erro de conexão: ${errorMessage}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const prepareEdit = (obra: Obra) => {
    setEditing(obra);
    setForm({
      titulo: obra.nome,
      autor: obra.diretor,
      data: obra.data,
      descricao: obra.descricao || '',
      local: obra.local,
      elenco: obra.elenco,
      nota: String(obra.nota),
    });
    setActiveTab('adicionar');
  };

  const confirmDelete = (obra: Obra) => {
    setSelectedObra(obra);
    setConfirmVisible(true);
  };

  const deleteObra = async () => {
    if (!selectedObra) return;
    setConfirmVisible(false);
    setLoading(true);
    try {
      const res = await apiFetch(`/obras/${selectedObra.id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ message: '✓ Obra removida.', type: 'success' });
        fetchObras();
      } else {
        const text = await res.text();
        console.error(`[DELETE ERROR] ${res.status}:`, text);
        setFeedback({ message: 'Falha ao apagar obra.', type: 'error' });
      }
    } catch (e) {
      console.error('[DELETE NETWORK ERROR]', e);
      setFeedback({ message: 'Erro de conexão.', type: 'error' });
    } finally {
      setLoading(false);
      setSelectedObra(null);
    }
  };

  const filtered = obras.filter((o) =>
    o.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.diretor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {feedback && (
        <Feedback
          message={feedback.message}
          type={feedback.type}
          onHide={() => setFeedback(null)}
        />
      )}

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <Text style={styles.headerLogo}>🎭</Text>
            <View>
              <Text style={styles.headerMainText}>Teatro Manager</Text>
              <Text style={styles.headerSubText}>Gestão de Produções</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutButton, elevations['3']]}
          >
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'visualizar' && styles.tabActive]}
          onPress={() => setActiveTab('visualizar')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={[styles.tabLabel, activeTab === 'visualizar' && styles.tabLabelActive]}>
            Obras
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'adicionar' && styles.tabActive]}
          onPress={() => {
            setActiveTab('adicionar');
            setEditing(null);
            setForm(defaultForm);
          }}
        >
          <Text style={styles.tabIcon}>➕</Text>
          <Text style={[styles.tabLabel, activeTab === 'adicionar' && styles.tabLabelActive]}>
            Nova Obra
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {activeTab === 'adicionar' ? (
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={[styles.card, elevations['3']]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{editing ? '✏️ Editar Obra' : '✨ Nova Obra'}</Text>
              </View>

              <View style={styles.formGroup}>
                <LabeledInput
                  label="Nome da Obra *"
                  placeholder="ex: Romeu e Julieta"
                  value={form.titulo}
                  onChangeText={(t) => setForm({ ...form, titulo: t })}
                  editable={!loading}
                />

                <LabeledInput
                  label="Diretor *"
                  placeholder="ex: Shakespeare"
                  value={form.autor}
                  onChangeText={(t) => setForm({ ...form, autor: t })}
                  editable={!loading}
                />

                <LabeledInput
                  label="Data (YYYY-MM-DD) *"
                  placeholder="2024-12-25"
                  value={form.data}
                  onChangeText={(t) => setForm({ ...form, data: t })}
                  editable={!loading}
                />

                <LabeledInput
                  label="Local"
                  placeholder="ex: Teatro Municipal"
                  value={form.local}
                  onChangeText={(t) => setForm({ ...form, local: t })}
                  editable={!loading}
                />

                <LabeledInput
                  label="Elenco"
                  placeholder="ex: João, Maria, Pedro"
                  value={form.elenco}
                  onChangeText={(t) => setForm({ ...form, elenco: t })}
                  editable={!loading}
                />

                <LabeledInput
                  label="Descrição"
                  placeholder="Resumo e detalhes sobre a obra"
                  value={form.descricao}
                  onChangeText={(t) => setForm({ ...form, descricao: t })}
                  editable={!loading}
                  multiline
                  numberOfLines={4}
                />

                <LabeledInput
                  label="Nota (1-10)"
                  placeholder="7"
                  value={form.nota}
                  onChangeText={(t) => setForm({ ...form, nota: t })}
                  editable={!loading}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, elevations['5'], loading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.saveButtonText}>{editing ? '💾 ATUALIZAR' : '✅ SALVAR'}</Text>
                  </>
                )}
              </TouchableOpacity>

              {editing && (
                <TouchableOpacity
                  style={[styles.cancelButton, elevations['3']]}
                  onPress={() => {
                    setEditing(null);
                    setForm(defaultForm);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar Edição</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, elevations['2']]}
                placeholder="🔍 Buscar por nome ou diretor"
                placeholderTextColor={Colors.textLighter}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            {loading && <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />}

            {!loading && filtered.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🎪</Text>
                <Text style={styles.emptyText}>Nenhuma obra encontrada</Text>
                <Text style={styles.emptySubtext}>Crie sua primeira obra clicando no botão "Nova Obra"</Text>
              </View>
            )}

            {filtered.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.obraCard, elevations['3']]}
                onPress={() => {
                  setSelectedObra(item);
                  setModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.obraCardContent}>
                  <Text style={styles.obraCardTitle}>{item.nome}</Text>
                  <Text style={styles.obraCardDirector}>👤 {item.diretor}</Text>
                  <View style={styles.obraCardMeta}>
                    <Text style={styles.obraCardDate}>📅 {item.data}</Text>
                    <View style={styles.obraCardRating}>
                      <Text style={styles.obraCardRatingText}>⭐ {item.nota}/10</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.obraCardArrow}>›</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.spacer} />
          </ScrollView>
        )}
      </Animated.View>

      {/* Modal de Detalhes */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, elevations['5']]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Detalhes da Obra</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {selectedObra && (
                <View style={styles.modalBody}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>📌 Nome</Text>
                    <Text style={styles.detailValue}>{selectedObra.nome}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>👤 Diretor</Text>
                    <Text style={styles.detailValue}>{selectedObra.diretor}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>📅 Data</Text>
                    <Text style={styles.detailValue}>{selectedObra.data}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>📍 Local</Text>
                    <Text style={styles.detailValue}>{selectedObra.local}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>🎭 Elenco</Text>
                    <Text style={styles.detailValue}>{selectedObra.elenco}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>⭐ Nota</Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingValue}>{selectedObra.nota}</Text>
                      <Text style={styles.ratingMax}>/10</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>📝 Descrição</Text>
                    <Text style={styles.detailDescription}>
                      {selectedObra.descricao || 'Sem descrição'}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalEditButton, elevations['3']]}
                onPress={() => {
                  if (selectedObra) prepareEdit(selectedObra);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalEditButtonText}>✏️ EDITAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDeleteButton, elevations['3']]}
                onPress={() => {
                  if (selectedObra) confirmDelete(selectedObra);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalDeleteButtonText}>🗑️ APAGAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        visible={confirmVisible}
        message={`Tem certeza que deseja apagar "${selectedObra?.nome}"?`}
        onConfirm={deleteObra}
        onCancel={() => setConfirmVisible(false)}
      />

      {/* FAB */}
      {activeTab === 'visualizar' && (
        <FloatingActionButton
          onPress={() => setActiveTab('adicionar')}
          icon="+"
          size="large"
          color={Colors.primary}
          style={styles.fab}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    fontSize: 36,
  },
  headerMainText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  headerSubText: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLighter,
  },
  tabLabelActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  cardHeader: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    paddingBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  formGroup: {
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: Colors.gray100,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  obraCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  obraCardContent: {
    flex: 1,
  },
  obraCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  obraCardDirector: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 8,
  },
  obraCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  obraCardDate: {
    fontSize: 12,
    color: Colors.textLighter,
  },
  obraCardRating: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  obraCardRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  obraCardArrow: {
    fontSize: 24,
    color: Colors.textLighter,
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    maxWidth: 280,
  },
  spacer: {
    height: 100,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseIcon: {
    fontSize: 24,
    color: Colors.text,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalScroll: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textLighter,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  detailDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  ratingMax: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  modalEditButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalEditButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: Colors.error,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalDeleteButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
});
