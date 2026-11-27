import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { CheckboxOption } from '@/src/components/Checkbox';
import { Seletor } from '@/src/components/Seletor';
import { CIAP2_SAD_OPCOES } from '@/src/data/ciapData';
import { CID10_SAD_OPCOES } from '@/src/data/cidData';
import { PROCEDIMENTOS_SAD_OPCOES } from '@/src/data/procedimentosSigtapData';
import { CONDICOES_OPCOES, CONDICOES_OPCOES2, MODALIDADE_AD_ATENDIMENTO_OPCOES, TIPO_ATENDIMENTO_OPCOES } from '@/src/data/atendimentoData';

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
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    municipio: 'Patos de Minas',
    cbo: '',
    unidade: 'Melhor em Casa - SAD',
    profissional: '',
    data: '',
    pacienteNome: params.nome || '',
    localAtendimento: params.endereco || 'Domicílio',
    dataNascimento: params.DN || '',
    numCartaoSus: '',
    sexo: '',
    modalidadeAd: '',
    tipoAtendimento: '',
    ciap: '',
    cid: '',
    procedimentoSia: '',
    procedimentoCid: '',
  });

  const [condicoesSelecionadas, setCondicoesSelecionadas] = useState<string[]>([]);
  const [condutaSelecionada, setCondutaSelecionada] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingUserData(true);

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

        const user = auth.currentUser;
        const now = new Date();
        const dataFormatted = now.toLocaleDateString('pt-BR');

        let profissionalData: Partial<typeof formData> = { 
          data: dataFormatted 
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
      const pacienteRef = doc(db, 'pacientes', params.id);
      await updateDoc(pacienteRef, {
        nome: formData.pacienteNome,
        DN: formData.dataNascimento,
        numCartaoSus: formData.numCartaoSus,
        sexo: formData.sexo,
      });

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

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.back();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar Atendimento Domiciliar:', error);
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MODALIDADE AD</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Seletor
            label="Modalidade AD"
            value={formData.modalidadeAd}
            options={MODALIDADE_AD_ATENDIMENTO_OPCOES}
            onSelect={(item) => handleChange('modalidadeAd', `${item.codigo} - ${item.descricao}`)}
            placeholder="Selecione a Modalidade AD..."
            isDark={isDark}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TIPO DE ATENDIMENTO</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Seletor
            label="Tipo Atendimento"
            value={formData.tipoAtendimento}
            options={TIPO_ATENDIMENTO_OPCOES}
            onSelect={(item) => handleChange('tipoAtendimento', `${item.codigo} - ${item.descricao}`)}
            placeholder="Selecione o Tipo de Atendimento..."
            isDark={isDark}
          />
        </View>

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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CIAP / CID</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Seletor
                label="CIAP"
                value={formData.ciap}
                options={CIAP2_SAD_OPCOES}
                allowCustomText={true}
                onCustomTextChange={(text) => handleChange('ciap', text)}
                onSelect={(item) => handleChange('ciap', `${item.codigo} - ${item.descricao}`)}
                placeholder="Selecione CIAP..."
                isDark={isDark}
              />
            </View>
            <View style={styles.inputGroup}>
              <Seletor
                label="CID"
                value={formData.cid}
                options={CID10_SAD_OPCOES}
                allowCustomText={true}
                onCustomTextChange={(text) => handleChange('cid', text)}
                onSelect={(item) => handleChange('cid', `${item.codigo} - ${item.descricao}`)}
                placeholder="Selecione CID..."
                isDark={isDark}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PROCEDIMENTOS SIA</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Seletor
            label="Procedimento"
            value={formData.procedimentoSia}
            options={PROCEDIMENTOS_SAD_OPCOES}
            allowCustomText={true}
            onCustomTextChange={(text) => handleChange('procedimentoSia', text)}
            onSelect={(item) => handleChange('procedimentoSia', `${item.codigo} - ${item.descricao}`)}
            placeholder="Selecione o procedimento..."
            isDark={isDark}
          />

          <Seletor
            label="CID"
            value={formData.procedimentoCid}
            options={CID10_SAD_OPCOES}
            allowCustomText={true}
            onCustomTextChange={(text) => handleChange('procedimentoCid', text)}
            onSelect={(item) => handleChange('procedimentoCid', item.codigo)}
            placeholder="Selecione o CID..."
            isDark={isDark}
          />
        </View>

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