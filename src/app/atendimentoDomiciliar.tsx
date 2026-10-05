import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CheckboxOption } from '@/src/components/Checkbox';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
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

const CONDICOES_OPCOES2 = [
  { id: 'permanencia', label: 'Permanência' },
  { id: 'alta_administrativa', label: 'Alta administrativa' },
  { id: 'alta_clinica', label: 'Alta clínica' },
  { id: 'obito', label: 'Óbito' },
  { id: 'ad1', label: 'Atenção Básica (AD1)' },
  { id: 'urgencia_emergencia', label: 'Serviço de urgência e emergência' },
  { id: 'internacao_hospitalar', label: 'Serviço de internação hospitalar' },
];

export default function AtendimentoDomiciliar() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    nome?: string;
    DN?: string;
    endereco?: string;
    mode?: string;
    atendimentoId?: string;
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
    // Profissional
    municipio: 'Patos de Minas',
    cbo: '',
    unidade: 'Melhor em Casa - SAD',
    profissional: '',
    data: '',

    // Dados do Paciente
    pacienteNome: params.nome || '',
    localAtendimento: params.endereco || 'Domicílio',
    dataNascimento: params.DN || '',
    numCartaoSus: '',
    sexo: '',

    // Modalidade AD & Atendimento
    modalidadeAd: '',
    tipoAtendimento: '',

    // CIAP / CID
    ciap: '',
    cid: '',

    // Procedimentos SIA
    procedimentoSia: '',
    procedimentoCid: '',
    quantidadeSia: '',
  });

  const [condicoesSelecionadas, setCondicoesSelecionadas] = useState<string[]>([]);
  const [condutaSelecionada, setCondutaSelecionada] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingUserData(true);

        // SE VEIO DO HISTÓRICO: Carrega o atendimento salvo diretamente da coleção principal 'atendimentos'
        if (params.atendimentoId) {
          const docRef = doc(db, 'atendimentos', params.atendimentoId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.formData) {
              setFormData(data.formData);
              if (data.formData.condicoesSelecionadas) {
                setCondicoesSelecionadas(data.formData.condicoesSelecionadas);
              }
              if (data.formData.condutaSelecionada) {
                setCondutaSelecionada(data.formData.condutaSelecionada);
              }
            }
          }
          return;
        }

        // SE FOR NOVO ATENDIMENTO: Carrega dados do profissional logado e do paciente
        const user = auth.currentUser;
        const now = new Date();
        const dataFormatted = now.toLocaleDateString('pt-BR');

        let profissionalData: Partial<typeof formData> = { data: dataFormatted };

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
          localAtendimento: params.endereco || 'Domicílio',
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
              localAtendimento: data.endereco || params.endereco || 'Domicílio',
            };
          }
        }

        setFormData((prev) => ({
          ...prev,
          ...profissionalData,
          ...pacienteData,
        }));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchData();
  }, [params.id, params.atendimentoId, params.nome, params.DN, params.endereco]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCondicao = (id: string) => {
    setCondicoesSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleConduta = (id: string) => {
    setCondutaSelecionada((prev) =>
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
      // 1. Atualiza dados do paciente na coleção principal
      const pacienteRef = doc(db, 'pacientes', params.id);
      await updateDoc(pacienteRef, {
        nome: formData.pacienteNome,
        DN: formData.dataNascimento,
        numCartaoSus: formData.numCartaoSus,
        sexo: formData.sexo,
      });

      // 2. Salva a Ficha de Atendimento Domiciliar na coleção principal 'atendimentos'
      await addDoc(collection(db, 'atendimentos'), {
        pacienteId: params.id,
        tipo: 'Atendimento Domiciliar',
        codigoFicha: `ATD-${Date.now().toString().slice(-6)}`,
        formData: {
          ...formData,
          condicoesSelecionadas,
          condutaSelecionada,
        },
        createdAt: serverTimestamp(),
      });

      Alert.alert('Sucesso', 'Ficha de Atendimento Domiciliar salva com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Erro ao salvar Atendimento Domiciliar:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados da ficha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
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

              <View style={styles.row}>
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
            </>
          )}
        </View>

        {/* DADOS DO PACIENTE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DADOS DO PACIENTE</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Paciente</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Nome do paciente"
                placeholderTextColor={placeholderColor}
                value={formData.pacienteNome}
                onChangeText={(v) => handleChange('pacienteNome', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Local de Atendimento</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Ex: Domicílio, UBS..."
                placeholderTextColor={placeholderColor}
                value={formData.localAtendimento}
                onChangeText={(v) => handleChange('localAtendimento', v)}
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
          </View>
        </View>

        {/* MODALIDADE AD */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MODALIDADE AD</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Modalidade AD</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Selecione a Modalidade AD..."
            placeholderTextColor={placeholderColor}
            value={formData.modalidadeAd}
            onChangeText={(v) => handleChange('modalidadeAd', v)}
          />
        </View>

        {/* TIPO DE ATENDIMENTO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TIPO DE ATENDIMENTO</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Tipo Atendimento</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Selecione o Tipo de Atendimento..."
            placeholderTextColor={placeholderColor}
            value={formData.tipoAtendimento}
            onChangeText={(v) => handleChange('tipoAtendimento', v)}
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

        {/* CIAP / CID */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CIAP / CID</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>CIAP</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Código ou Descrição CIAP"
                placeholderTextColor={placeholderColor}
                value={formData.ciap}
                onChangeText={(v) => handleChange('ciap', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>CID</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Código ou Descrição CID"
                placeholderTextColor={placeholderColor}
                value={formData.cid}
                onChangeText={(v) => handleChange('cid', v)}
              />
            </View>
          </View>
        </View>

        {/* PROCEDIMENTOS SIA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PROCEDIMENTOS SIA</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <Text style={[styles.label, { color: textColor }]}>Procedimento</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Código do procedimento"
                placeholderTextColor={placeholderColor}
                value={formData.procedimentoSia}
                onChangeText={(v) => handleChange('procedimentoSia', v)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: textColor }]}>CID</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="CID"
                placeholderTextColor={placeholderColor}
                value={formData.procedimentoCid}
                onChangeText={(v) => handleChange('procedimentoCid', v)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: textColor }]}>Qtd.</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="1"
                placeholderTextColor={placeholderColor}
                keyboardType="numeric"
                value={formData.quantidadeSia}
                onChangeText={(v) => handleChange('quantidadeSia', v)}
              />
            </View>
          </View>
        </View>

        {/* CONDUTA / MOTIVOS SAÍDA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CONDUTA / MOTIVOS SAÍDA</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          {CONDICOES_OPCOES2.map((item) => (
            <CheckboxOption
              key={item.id}
              label={item.label}
              checked={condutaSelecionada.includes(item.id)}
              onPress={() => toggleConduta(item.id)}
            />
          ))}
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
              <Text style={styles.saveButtonText}>Salvar Ficha de Atendimento</Text>
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