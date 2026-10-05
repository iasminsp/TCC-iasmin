import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '../config/firebaseConfig';

export default function AtendimentoSOAP() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#121212' : '#F4F6F8';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#F2F3F4' : '#11181C';
  const borderColor = isDark ? '#333333' : '#E0E0E0';
  const placeholderColor = isDark ? '#888888' : '#999999';

  // Recebe os dados do paciente e o ID do atendimento (se vier do histórico)
  const { 
    id: pacienteId, 
    nome: pacienteNomeParam, 
    DN: pacienteDnParam,
    atendimentoId 
  } = useLocalSearchParams<{
    id?: string;
    nome?: string;
    DN?: string;
    atendimentoId?: string;
  }>();

  const [loadingUserData, setLoadingUserData] = useState(true);
  const [saving, setSaving] = useState(false);

  // State para os dados do formulário
  const [formData, setFormData] = useState({
    // Cabeçalho
    cbo: '',
    profissional: '',
    equipe: '',
    dataRecepcao: '',
    inicioAtendimento: '',
    recepcao: '',
    situacaoRecepcao: '',
    numeroAtendimento: '',
    escutaInicial: '',

    // Paciente
    pacienteNome: pacienteNomeParam || '',
    dataNascimento: pacienteDnParam || '',
    numCartaoSus: '',
    sexo: '',
    telefone: '',

    // Subjetivo
    subjetivo: '',
    motivoCIAP2: '',
    motivoObservacao: '',

    // Objetivo
    objetivo: '',
    peso: '',
    altura: '',
    perimetroCefalico: '',
    perimetroPanturrilha: '',
    circunferenciaAbdominal: '',
    massaCorporal: '',
    circunferenciaCintura: '',
    circunferenciaQuadril: '',
    icc: '',
    pressaoArterial: '',
    frequenciaRespiratoria: '',
    frequenciaCardiaca: '',
    temperatura: '',
    saturacaoO2: '',
    glicemiaCapilar: '',
    momentoColeta: '',
    vacinacaoEmDia: false,

    // Avaliação
    avaliacao: '',
    problemaCIAP2: '',
    problemaCID10: '',
    inserirListaAtivo: false,
    problemaObservacao: '',

    // Plano
    plano: '',
    intervencaoCIAP2: '',
    intervencaoObservacao: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingUserData(true);

        // SE VEIO DO HISTÓRICO: Carrega a ficha salva diretamente da coleção principal 'atendimentos'
        if (atendimentoId) {
          const docRef = doc(db, 'atendimentos', atendimentoId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.formData) {
              setFormData(data.formData);
            }
          }
          return;
        }

        // SE FOR NOVO ATENDIMENTO: Inicializa os dados do Profissional e do Paciente
        const user = auth.currentUser;
        const now = new Date();
        const dataFormatted = now.toLocaleDateString('pt-BR');
        const horaFormatted = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const inicio = `${dataFormatted} ${horaFormatted}`;

        let profissionalData: Partial<typeof formData> = { inicioAtendimento: inicio };

        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();

            let cboText = '';
            if (userData.cbo) {
              if (typeof userData.cbo === 'object') {
                cboText = `${userData.cbo.codigo || ''} ${
                  userData.cbo.descricao ? '- ' + userData.cbo.descricao : ''
                }`.trim();
              } else {
                cboText = String(userData.cbo);
              }
            }

            profissionalData = {
              ...profissionalData,
              profissional: userData.nome || user.displayName || user.email || '',
              cbo: cboText,
              equipe: userData.equipe || '',
            };
          } else {
            profissionalData = {
              ...profissionalData,
              profissional: user.displayName || user.email || '',
            };
          }
        }

        let pacienteData: Partial<typeof formData> = {
          pacienteNome: pacienteNomeParam || '',
          dataNascimento: pacienteDnParam || '',
        };

        if (pacienteId) {
          const pacienteDocRef = doc(db, 'pacientes', pacienteId);
          const pacienteSnap = await getDoc(pacienteDocRef);

          if (pacienteSnap.exists()) {
            const data = pacienteSnap.data();
            pacienteData = {
              pacienteNome: data.nome || pacienteNomeParam || '',
              dataNascimento: data.DN || pacienteDnParam || '',
              numCartaoSus: data.numCartaoSus || data.cpf || '',
              sexo: data.sexo || '',
              telefone: data.telefone || '',
            };
          }
        }

        setFormData((prev) => ({
          ...prev,
          ...profissionalData,
          ...pacienteData,
        }));
      } catch (error) {
        console.error('Erro ao carregar os dados:', error);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchData();
  }, [pacienteId, atendimentoId, pacienteNomeParam, pacienteDnParam]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!pacienteId) {
      Alert.alert('Atenção', 'Não foi possível identificar o cadastro deste paciente.');
      return;
    }

    setSaving(true);
    try {
      // 1. Atualiza os dados básicos do paciente no cadastro principal
      const pacienteRef = doc(db, 'pacientes', pacienteId);
      await updateDoc(pacienteRef, {
        nome: formData.pacienteNome,
        DN: formData.dataNascimento,
        numCartaoSus: formData.numCartaoSus,
        sexo: formData.sexo,
        telefone: formData.telefone,
      });

      // 2. Salva a ficha na coleção principal 'atendimentos' vinculada pelo pacienteId
      await addDoc(collection(db, 'atendimentos'), {
        pacienteId: pacienteId,
        tipo: 'Atendimento SOAP',
        codigoFicha: formData.numeroAtendimento || '',
        formData: formData,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Sucesso', 'Atendimento SOAP salvo com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Erro ao salvar atendimento SOAP:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados do atendimento. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CABEÇALHO DO ATENDIMENTO */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Informações do Atendimento
          </Text>

          {loadingUserData ? (
            <ActivityIndicator color="#0055A5" style={{ marginVertical: 12 }} />
          ) : (
            <>
              <View style={styles.row}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: textColor }]}>CBO</Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    placeholder="Ex: 225125 - Médico"
                    placeholderTextColor={placeholderColor}
                    value={formData.cbo}
                    onChangeText={(v) => handleChange('cbo', v)}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: textColor }]}>Profissional</Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    placeholder="Nome do Profissional"
                    placeholderTextColor={placeholderColor}
                    value={formData.profissional}
                    onChangeText={(v) => handleChange('profissional', v)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: textColor }]}>Equipe</Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    placeholder="Ex: EMAD 1"
                    placeholderTextColor={placeholderColor}
                    value={formData.equipe}
                    onChangeText={(v) => handleChange('equipe', v)}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: textColor }]}>
                    Início Atendimento
                  </Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    placeholder="DD/MM/AAAA HH:mm"
                    placeholderTextColor={placeholderColor}
                    value={formData.inicioAtendimento}
                    onChangeText={(v) => handleChange('inicioAtendimento', v)}
                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* PACIENTE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PACIENTE</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Nome do Paciente</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Nome completo"
                placeholderTextColor={placeholderColor}
                value={formData.pacienteNome}
                onChangeText={(v) => handleChange('pacienteNome', v)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                Data de Nascimento
              </Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={placeholderColor}
                value={formData.dataNascimento}
                onChangeText={(v) => handleChange('dataNascimento', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                Nº Cartão SUS / CPF
              </Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="000 0000 0000 0000"
                placeholderTextColor={placeholderColor}
                keyboardType="numeric"
                value={formData.numCartaoSus}
                onChangeText={(v) => handleChange('numCartaoSus', v)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Sexo</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Feminino / Masculino"
                placeholderTextColor={placeholderColor}
                value={formData.sexo}
                onChangeText={(v) => handleChange('sexo', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Telefone</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="(00) 00000-0000"
                placeholderTextColor={placeholderColor}
                keyboardType="phone-pad"
                value={formData.telefone}
                onChangeText={(v) => handleChange('telefone', v)}
              />
            </View>
          </View>
        </View>

        {/* SUBJETIVO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SUBJETIVO</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Subjetivo</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { color: textColor, borderColor }]}
            multiline
            numberOfLines={3}
            placeholder="Relato do paciente..."
            placeholderTextColor={placeholderColor}
            value={formData.subjetivo}
            onChangeText={(v) => handleChange('subjetivo', v)}
          />

          <Text style={[styles.subSectionTitle, { color: textColor }]}>
            Motivo da consulta
          </Text>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>CIAP2</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Código / Motivo"
                placeholderTextColor={placeholderColor}
                value={formData.motivoCIAP2}
                onChangeText={(v) => handleChange('motivoCIAP2', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Observação</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Observações..."
                placeholderTextColor={placeholderColor}
                value={formData.motivoObservacao}
                onChangeText={(v) => handleChange('motivoObservacao', v)}
              />
            </View>
          </View>
        </View>

        {/* OBJETIVO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>OBJETIVO</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Objetivo</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { color: textColor, borderColor }]}
            multiline
            numberOfLines={3}
            placeholder="Exame físico, observações do profissional..."
            placeholderTextColor={placeholderColor}
            value={formData.objetivo}
            onChangeText={(v) => handleChange('objetivo', v)}
          />

          <Text style={[styles.subSectionTitle, { color: textColor }]}>Antropometria</Text>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Peso (kg)</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                keyboardType="numeric"
                placeholder="00.0"
                placeholderTextColor={placeholderColor}
                value={formData.peso}
                onChangeText={(v) => handleChange('peso', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Altura (cm)</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                keyboardType="numeric"
                placeholder="000"
                placeholderTextColor={placeholderColor}
                value={formData.altura}
                onChangeText={(v) => handleChange('altura', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>IMC (Massa corp.)</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                keyboardType="numeric"
                placeholder="00.0"
                placeholderTextColor={placeholderColor}
                value={formData.massaCorporal}
                onChangeText={(v) => handleChange('massaCorporal', v)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                Perímetro Cefálico (cm)
              </Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                keyboardType="numeric"
                placeholder="00"
                placeholderTextColor={placeholderColor}
                value={formData.perimetroCefalico}
                onChangeText={(v) => handleChange('perimetroCefalico', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                Perímetro Panturrilha (cm)
              </Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                keyboardType="numeric"
                placeholder="00"
                placeholderTextColor={placeholderColor}
                value={formData.perimetroPanturrilha}
                onChangeText={(v) => handleChange('perimetroPanturrilha', v)}
              />
            </View>
          </View>

          <Text style={[styles.subSectionTitle, { color: textColor }]}>Sinais Vitais</Text>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>PA (mmHg)</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="120/80"
                placeholderTextColor={placeholderColor}
                value={formData.pressaoArterial}
                onChangeText={(v) => handleChange('pressaoArterial', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                Freq. Respiratória (rpm)
              </Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                keyboardType="numeric"
                placeholder="00"
                placeholderTextColor={placeholderColor}
                value={formData.frequenciaRespiratoria}
                onChangeText={(v) => handleChange('frequenciaRespiratoria', v)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                Freq. Cardíaca (bpm)
              </Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                keyboardType="numeric"
                placeholder="00"
                placeholderTextColor={placeholderColor}
                value={formData.frequenciaCardiaca}
                onChangeText={(v) => handleChange('frequenciaCardiaca', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Temperatura (°C)</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                keyboardType="numeric"
                placeholder="36.5"
                placeholderTextColor={placeholderColor}
                value={formData.temperatura}
                onChangeText={(v) => handleChange('temperatura', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Sat. O2 (%)</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                keyboardType="numeric"
                placeholder="98"
                placeholderTextColor={placeholderColor}
                value={formData.saturacaoO2}
                onChangeText={(v) => handleChange('saturacaoO2', v)}
              />
            </View>
          </View>

          <Text style={[styles.subSectionTitle, { color: textColor }]}>
            Glicemia & Vacinação
          </Text>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>
                Glicemia Capilar (mg/dL)
              </Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                keyboardType="numeric"
                placeholder="000"
                placeholderTextColor={placeholderColor}
                value={formData.glicemiaCapilar}
                onChangeText={(v) => handleChange('glicemiaCapilar', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Momento da coleta</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Jejum / Pós-prandial"
                placeholderTextColor={placeholderColor}
                value={formData.momentoColeta}
                onChangeText={(v) => handleChange('momentoColeta', v)}
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: textColor }]}>Vacinação em dia?</Text>
            <Switch
              value={formData.vacinacaoEmDia}
              onValueChange={(val) => handleChange('vacinacaoEmDia', val)}
            />
          </View>
        </View>

        {/* AVALIAÇÃO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AVALIAÇÃO</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Avaliação</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { color: textColor, borderColor }]}
            multiline
            numberOfLines={3}
            placeholder="Diagnóstico, análise e evolução clínica..."
            placeholderTextColor={placeholderColor}
            value={formData.avaliacao}
            onChangeText={(v) => handleChange('avaliacao', v)}
          />

          <Text style={[styles.subSectionTitle, { color: textColor }]}>
            Problemas e/ou Condições Detectadas
          </Text>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>CIAP2</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Código CIAP2"
                placeholderTextColor={placeholderColor}
                value={formData.problemaCIAP2}
                onChangeText={(v) => handleChange('problemaCIAP2', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>CID-10</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Código CID-10"
                placeholderTextColor={placeholderColor}
                value={formData.problemaCID10}
                onChangeText={(v) => handleChange('problemaCID10', v)}
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: textColor }]}>
              Inserir na lista de problemas/condição ativo?
            </Text>
            <Switch
              value={formData.inserirListaAtivo}
              onValueChange={(val) => handleChange('inserirListaAtivo', val)}
            />
          </View>

          <Text style={[styles.label, { color: textColor, marginTop: 10 }]}>
            Observação do Problema
          </Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Observações..."
            placeholderTextColor={placeholderColor}
            value={formData.problemaObservacao}
            onChangeText={(v) => handleChange('problemaObservacao', v)}
          />
        </View>

        {/* PLANO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PLANO</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Plano de Conduta</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { color: textColor, borderColor }]}
            multiline
            numberOfLines={3}
            placeholder="Metas, orientações, prescrições e condutas..."
            placeholderTextColor={placeholderColor}
            value={formData.plano}
            onChangeText={(v) => handleChange('plano', v)}
          />

          <Text style={[styles.subSectionTitle, { color: textColor }]}>
            Intervenções e/ou Procedimentos
          </Text>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>CIAP2 / Procedimento</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Código do procedimento"
                placeholderTextColor={placeholderColor}
                value={formData.intervencaoCIAP2}
                onChangeText={(v) => handleChange('intervencaoCIAP2', v)}
              />
            </View>
          </View>

          <Text style={[styles.label, { color: textColor, marginTop: 10 }]}>
            Observação da Intervenção
          </Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Detalhes adicionais..."
            placeholderTextColor={placeholderColor}
            value={formData.intervencaoObservacao}
            onChangeText={(v) => handleChange('intervencaoObservacao', v)}
          />
        </View>

        {/* BOTÃO SALVAR */}
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Salvar Atendimento SOAP</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionHeader: {
    backgroundColor: '#0055A5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: '#0055A5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});