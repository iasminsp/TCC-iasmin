import { CheckboxOption } from '@/src/components/Checkbox';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { auth, db } from '../config/firebaseConfig';

const CONDICOES_OPCOES = [
  { id: 'acamado', label: 'Acamado' },
  { id: 'domiciliado', label: 'Domiciliado' },
  { id: 'ulceras', label: 'Úlceras / Feridas (grau III ou IV)' },
  { id: 'nutricional', label: 'Acompanhamento nutricional' },
  { id: 'sng', label: 'Uso de sonda naso-gástrica - SNG' },
  { id: 'sne', label: 'Uso de sonda naso-enteral - SNE' },
  { id: 'gastrostomia', label: 'Uso de gastrostomia' },
  { id: 'colostomia', label: 'Uso de colostomia' },
  { id: 'cistostomia', label: 'Uso de cistostomia' },
  { id: 'svd', label: 'Uso de sonda vesical de demora - SVD' },
  { id: 'pre_operatorio', label: 'Acompanhamento pré-operatório' },
  { id: 'pos_operatorio', label: 'Acompanhamento pós-operatório' },
  { id: 'ortese_protese', label: 'Adaptação ao uso de órtese / prótese' },
  { id: 'reabilitacao_domiciliar', label: 'Reabilitação domiciliar' },
  { id: 'paliativos_oncologico', label: 'Cuidados paliativos oncológico' },
  { id: 'paliativos_nao_oncologico', label: 'Cuidados paliativos não-oncológico' },
  { id: 'oxigenoterapia', label: 'Oxigenoterapia domiciliar' },
  { id: 'traqueostomia', label: 'Uso de traqueostomia' },
  { id: 'aspirador_vias_aereas', label: 'Uso de aspirador de vias aéreas para higiene brônquica' },
  { id: 'ventilatorio_cpap', label: 'Suporte ventilatório não invasivo, CPAP' },
  { id: 'ventilatorio_bipap', label: 'Suporte ventilatório não invasivo, BiPAP' },
  { id: 'dialise_peritoneal', label: 'Diálise peritoneal' },
  { id: 'paracentese', label: 'Paracentese' },
  { id: 'medicacao_parenteral', label: 'Medicação parenteral' },
];

// Função utilitária para gerar código de ficha único (ex: ADM-20261004-8492)
const gerarCodigoFicha = () => {
  const now = new Date();
  const dataStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const aleatorio = Math.floor(1000 + Math.random() * 9000);
  return `ADM-${dataStr}-${aleatorio}`;
};

export default function Elegibilidade() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    nome?: string;
    DN?: string;
    endereco?: string;
  }>();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#121212' : '#F4F6F8';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#F2F3F4' : '#11181C';
  const borderColor = isDark ? '#333333' : '#E0E0E0';
  const placeholderColor = isDark ? '#888888' : '#999999';

  const [loadingUserData, setLoadingUserData] = useState(true);
  const [saving, setSaving] = useState(false);

  // State unificado do formulário
  const [formData, setFormData] = useState({
    // Dados da ficha
    codigoFicha: gerarCodigoFicha(),
    uuid: '',
    data: '',
    turno: 'Manhã',

    // Profissional
    municipio: 'Patos de Minas',
    cbo: '',
    codigoIne: '',
    cnesUnidade: '',
    unidade: 'Melhor em Casa - SAD',
    cnsProfissional: '',
    profissional: '',

    // Paciente
    pacienteNome: params.nome || '',
    dataNascimento: params.DN || '',
    numCartaoSus: '',
    sexo: '',
    telefone: '',

    // Procedência
    procedencia: '',

    // CID & Conclusão & Cuidador
    cid: '',
    modalidadeAd: '',
    cuidadorNome: '',
    cnsCuidador: '',
  });

  const [condicoesSelecionadas, setCondicoesSelecionadas] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        const now = new Date();
        const dataFormatted = now.toLocaleDateString('pt-BR');

        let profissionalData: Partial<typeof formData> = { 
          data: dataFormatted,
        };

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
              unidade: userData.unidade || 'Melhor em Casa - SAD',
            };
          } else {
            profissionalData = {
              ...profissionalData,
              profissional: user.displayName || user.email || '',
            };
          }
        }

        let pacienteData: Partial<typeof formData> = {
          pacienteNome: params.nome || '',
          dataNascimento: params.DN || '',
        };

        if (params.id) {
          const pacienteDocRef = doc(db, 'pacientes', params.id);
          const pacienteSnap = await getDoc(pacienteDocRef);

          if (pacienteSnap.exists()) {
            const data = pacienteSnap.data();
            pacienteData = {
              pacienteNome: data.nome || params.nome || '',
              dataNascimento: data.DN || params.DN || '',
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
        console.error('Erro ao carregar dados na elegibilidade:', error);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchData();
  }, [params.id, params.nome, params.DN]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCondicao = (id: string) => {
    setCondicoesSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!params.id) {
      Alert.alert('Atenção', 'Não foi possível identificar o cadastro deste paciente.');
      return;
    }

    setSaving(true);
    try {
      // 1. Atualiza dados do paciente
      const pacienteRef = doc(db, 'pacientes', params.id);
      await updateDoc(pacienteRef, {
        nome: formData.pacienteNome,
        DN: formData.dataNascimento,
        numCartaoSus: formData.numCartaoSus,
        sexo: formData.sexo,
        telefone: formData.telefone,
      });

      // 2. Salva a ficha de Elegibilidade/Admissão na subcoleção 'atendimentos'
      await addDoc(collection(db, 'pacientes', params.id, 'atendimentos'), {
        tipo: 'Elegibilidade',
        codigoFicha: formData.codigoFicha,
        formData: {
          ...formData,
          condicoesSelecionadas,
        },
        createdAt: serverTimestamp(),
      });

      Alert.alert('Sucesso', `Ficha de Admissão ${formData.codigoFicha} salva com sucesso!`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Erro ao salvar Elegibilidade:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados da ficha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* DADOS DA FICHA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DADOS DA FICHA</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Código da Ficha (Gerado)</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor, backgroundColor: isDark ? '#2A2A2A' : '#EAEAEA' }]}
                placeholder="Código"
                placeholderTextColor={placeholderColor}
                value={formData.codigoFicha}
                editable={false} // Mantém como leitura para não ser alterado manualmente
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Data</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={placeholderColor}
                value={formData.data}
                onChangeText={(v) => handleChange('data', v)}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Turno</Text>
              <View style={styles.radioGroup}>
                {['Manhã', 'Tarde', 'Noite'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.radioButton,
                      { borderColor },
                      formData.turno === t && styles.radioButtonSelected,
                    ]}
                    onPress={() => handleChange('turno', t)}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        { color: formData.turno === t ? '#FFF' : textColor },
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* PROFISSIONAL */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PROFISSIONAL</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          {loadingUserData ? (
            <ActivityIndicator color="#0055A5" style={{ marginVertical: 10 }} />
          ) : (
            <>
              <View style={styles.row}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: textColor }]}>Município</Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    placeholder="Município"
                    placeholderTextColor={placeholderColor}
                    value={formData.municipio}
                    onChangeText={(v) => handleChange('municipio', v)}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: textColor }]}>Unidade (CNES)</Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    placeholder="CNES / Nome Unidade"
                    placeholderTextColor={placeholderColor}
                    value={formData.unidade}
                    onChangeText={(v) => handleChange('unidade', v)}
                  />
                </View>
              </View>
              <View style={styles.row}>
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
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: textColor }]}>CBO</Text>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    placeholder="Código CBO"
                    placeholderTextColor={placeholderColor}
                    value={formData.cbo}
                    onChangeText={(v) => handleChange('cbo', v)}
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
              <Text style={[styles.label, { color: textColor }]}>Data de Nascimento</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={placeholderColor}
                value={formData.dataNascimento}
                onChangeText={(v) => handleChange('dataNascimento', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Nº Cartão SUS / CPF</Text>
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

        {/* PROCEDÊNCIA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PROCEDÊNCIA</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Procedência</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Selecione ou digite a procedência..."
            placeholderTextColor={placeholderColor}
            value={formData.procedencia}
            onChangeText={(v) => handleChange('procedencia', v)}
          />
        </View>

        {/* CONDIÇÃO(ÕES) AVALIADA(S) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CONDIÇÃO(ÕES) AVALIADA(S)</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          {CONDICOES_OPCOES.map((item) => (
            <CheckboxOption
              key={item.id}
              label={item.label}
              checked={condicoesSelecionadas.includes(item.id)}
              onPress={() => toggleCondicao(item.id)}
            />
          ))}
        </View>

        {/* CID */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CID</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Código / Descrição do CID</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Pesquisar ou inserir CID..."
            placeholderTextColor={placeholderColor}
            value={formData.cid}
            onChangeText={(v) => handleChange('cid', v)}
          />
        </View>

        {/* CONCLUSÃO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CONCLUSÃO</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Modalidade AD</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Selecione a Modalidade AD (ex: AD1, AD2, AD3)..."
            placeholderTextColor={placeholderColor}
            value={formData.modalidadeAd}
            onChangeText={(v) => handleChange('modalidadeAd', v)}
          />
        </View>

        {/* CUIDADOR */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CUIDADOR</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Nome do Cuidador</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Nome do cuidador responsável"
                placeholderTextColor={placeholderColor}
                value={formData.cuidadorNome}
                onChangeText={(v) => handleChange('cuidadorNome', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>CNS do Cuidador</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Número do CNS"
                placeholderTextColor={placeholderColor}
                keyboardType="numeric"
                value={formData.cnsCuidador}
                onChangeText={(v) => handleChange('cnsCuidador', v)}
              />
            </View>
          </View>
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
              <Text style={styles.saveButtonText}>Salvar Ficha de Elegibilidade</Text>
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
  radioGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  radioButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#0055A5',
    borderColor: '#0055A5',
  },
  radioText: {
    fontSize: 13,
    fontWeight: '600',
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