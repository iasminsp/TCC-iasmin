import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { CheckboxOption } from '@/src/components/Checkbox';
import { Seletor } from '@/src/components/Seletor';
import { CID10_SAD_OPCOES } from '@/src/data/cidData';
import { CONDICOES_OPCOES, CUIDADOR_GRAU_OPCOES, MODALIDADE_AD_OPCOES, PROCEDENCIA_OPCOES } from '@/src/data/elegibilidadeData';

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
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    codigoFicha: gerarCodigoFicha(),
    uuid: '',
    data: '',
    turno: 'Manhã',
    municipio: 'Patos de Minas',
    cbo: '',
    codigoIne: '',
    cnesUnidade: '',
    unidade: 'Melhor em Casa - SAD',
    cnsProfissional: '',
    profissional: '',
    pacienteNome: params.nome || '',
    dataNascimento: params.DN || '',
    numCartaoSus: '',
    sexo: '',
    telefone: '',
    procedencia: '',
    cid: '',
    modalidadeAd: '',
    cuidadorGrau: '',
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
                cboText = `${userData.cbo.codigo || ''} ${userData.cbo.descricao ? '- ' + userData.cbo.descricao : ''}`.trim();
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

    if (!formData.modalidadeAd) {
      Alert.alert('Atenção', 'Selecione a conclusão / modalidade AD antes de salvar.');
      return;
    }

    setSaving(true);
    try {
      const modalidadeUpper = formData.modalidadeAd.toUpperCase();
      const isAdmitidoSad =
        modalidadeUpper.includes('AD1') ||
        modalidadeUpper.includes('AD2') ||
        modalidadeUpper.includes('AD3');

      const novoStatus = isAdmitidoSad ? 'Ativo' : 'Inativo - Não elegível';

      const pacienteRef = doc(db, 'pacientes', params.id);
      await updateDoc(pacienteRef, {
        nome: formData.pacienteNome,
        DN: formData.dataNascimento,
        numCartaoSus: formData.numCartaoSus,
        sexo: formData.sexo,
        telefone: formData.telefone,
        modalidadeAd: formData.modalidadeAd,
        status: novoStatus,
      });

      await addDoc(collection(db, 'pacientes', params.id, 'atendimentos'), {
        tipo: 'Elegibilidade',
        codigoFicha: formData.codigoFicha,
        formData: {
          ...formData,
          condicoesSelecionadas,
        },
        createdAt: serverTimestamp(),
      });

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.back();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar Elegibilidade:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados da ficha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {showToast && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>Ficha salva com sucesso!</Text>
        </View>
      )}

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
                style={[
                  styles.input,
                  { color: textColor, borderColor, backgroundColor: isDark ? '#2A2A2A' : '#EAEAEA' },
                ]}
                placeholder="Código"
                placeholderTextColor={placeholderColor}
                value={formData.codigoFicha}
                editable={false}
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
          <Text style={styles.sectionTitle}>PROCEDÊNCIA*</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Seletor
            label="Procedência*"
            value={formData.procedencia}
            options={PROCEDENCIA_OPCOES}
            onSelect={(item) => handleChange('procedencia', `${item.codigo} - ${item.descricao}`)}
            placeholder="Selecione..."
            isDark={isDark}
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
          <Text style={styles.sectionTitle}>CID*</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Seletor
            label="CID*"
            value={formData.cid}
            options={CID10_SAD_OPCOES}
            allowCustomText={true}
            onCustomTextChange={(text) => handleChange('cid', text)}
            onSelect={(item) => handleChange('cid', `${item.codigo} - ${item.descricao}`)}
            placeholder="Selecione ou digite..."
            isDark={isDark}
          />
        </View>

        {/* CONCLUSÃO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CONCLUSÃO*</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Seletor
            label="Modalidade AD*"
            value={formData.modalidadeAd}
            options={MODALIDADE_AD_OPCOES}
            onSelect={(item) => handleChange('modalidadeAd', `${item.codigo} - ${item.descricao}`)}
            placeholder="Selecione..."
            isDark={isDark}
          />
        </View>

        {/* CUIDADOR */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CUIDADOR</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Seletor
            label="Grau de Parentesco / Vínculo"
            value={formData.cuidadorGrau}
            options={CUIDADOR_GRAU_OPCOES}
            onSelect={(item) => handleChange('cuidadorGrau', `${item.codigo} - ${item.descricao}`)}
            placeholder="Selecione..."
            isDark={isDark}
          />

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
  toastContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 9999,
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  toastText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});