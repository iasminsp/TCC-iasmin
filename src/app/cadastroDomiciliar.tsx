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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Opções para os seletores / radio buttons
const SITUACAO_MORADIA_OPCOES = [
  'Próprio',
  'Financiado',
  'Alugado',
  'Arrendado',
  'Cedido',
  'Ocupação',
  'Temporária',
  'Outra',
];

const LOCALIZACAO_OPCOES = ['Urbana', 'Rural', 'Periurbana'];

const TIPO_DOMICILIO_OPCOES = [
  'Casa',
  'Apartamento',
  'Cômodo',
  'Maloca',
  'Improvisado',
  'Outro',
];

const POSSE_TERRA_OPCOES = [
  'Proprietário',
  'Parceiro(a) / Meeiro(a)',
  'Assentado(a)',
  'Posseiro',
  'Arrendatário(a)',
  'Comodatário(a)',
  'Beneficiário(a) do banco da terra',
  'Terra indígena demarcada',
  'Terra não demarcada',
  'Não se aplica',
];

export default function CadastroDomiciliar() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    nome?: string;
    DN?: string;
    endereco?: string;
    atendimentoId?: string;
  }>();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#121212' : '#F4F6F8';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#F2F3F4' : '#11181C';
  const borderColor = isDark ? '#333333' : '#E0E0E0';
  const placeholderColor = isDark ? '#888888' : '#999999';

  const [loadingPaciente, setLoadingPaciente] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [saving, setSaving] = useState(false);

  // State unificado do formulário
  const [formData, setFormData] = useState({
    // Paciente
    pacienteNome: params.nome || '',
    dataNascimento: params.DN || '',
    numCartaoSus: '',
    sexo: '',
    telefone: '',

    // Endereço
    municipio: 'Patos de Minas',
    bairro: '',
    logradouro: params.endereco || '',
    numeroImovel: '',
    imovelSemNumero: false,
    complemento: '',
    pontoReferencia: '',
    cep: '',

    // Tipo de Imóvel
    tipoImovel: 'Domicílio',

    // Telefones
    telefoneResidencial: '',
    telefoneContato: '',

    // Condições de Moradia
    situacaoMoradia: '',
    localizacao: '',
    tipoDomicilio: '',
    numeroComodos: '',
    posseTerra: '',
  });

  // Função para buscar dados do CEP via ViaCEP
  const handleCepChange = async (cepValue: string) => {
    handleChange('cep', cepValue);

    const cleanCep = cepValue.replace(/\D/g, '');

    if (cleanCep.length === 8) {
      try {
        setLoadingCep(true);
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (data.erro) {
          Alert.alert('CEP não encontrado', 'Verifique o número do CEP digitado.');
        } else {
          setFormData((prev) => ({
            ...prev,
            logradouro: data.logradouro || prev.logradouro,
            bairro: data.bairro || prev.bairro,
            municipio: data.localidade || prev.municipio,
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  useEffect(() => {
    const fetchPacienteData = async () => {
      try {
        setLoadingPaciente(true);

        // SE VEIO DO HISTÓRICO: Carrega o cadastro salvo diretamente da coleção principal 'atendimentos'
        if (params.atendimentoId) {
          const docRef = doc(db, 'atendimentos', params.atendimentoId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.formData) {
              setFormData(data.formData);
            }
          }
          return;
        }

        // SE FOR NOVO CADASTRO: Busca dados básicos do paciente
        if (params.id) {
          const pacienteDocRef = doc(db, 'pacientes', params.id);
          const pacienteSnap = await getDoc(pacienteDocRef);

          if (pacienteSnap.exists()) {
            const data = pacienteSnap.data();

            setFormData((prev) => ({
              ...prev,
              // Paciente
              pacienteNome: data.nome || params.nome || '',
              dataNascimento: data.DN || params.DN || '',
              numCartaoSus: data.numCartaoSus || data.cpf || '',
              sexo: data.sexo || '',
              telefone: data.telefone || '',

              // Endereço
              municipio: data.municipio || 'Patos de Minas',
              bairro: data.bairro || prev.bairro,
              logradouro: data.logradouro || data.endereco || params.endereco || prev.logradouro,
              numeroImovel: data.numero || data.numeroImovel || prev.numeroImovel,
              imovelSemNumero: data.imovelSemNumero || prev.imovelSemNumero,
              complemento: data.complemento || prev.complemento,
              pontoReferencia: data.pontoReferencia || prev.pontoReferencia,
              cep: data.cep || prev.cep,
            }));

            // Se já possuir CEP no Firestore, busca as informações do logradouro/bairro
            if (data.cep && data.cep.replace(/\D/g, '').length === 8) {
              const cleanCep = data.cep.replace(/\D/g, '');
              try {
                const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const viaCepData = await res.json();

                if (!viaCepData.erro) {
                  setFormData((prev) => ({
                    ...prev,
                    logradouro: prev.logradouro || viaCepData.logradouro || '',
                    bairro: prev.bairro || viaCepData.bairro || '',
                    municipio: prev.municipio || viaCepData.localidade || 'Patos de Minas',
                  }));
                }
              } catch (err) {
                console.error('Erro ao consultar ViaCEP no carregamento inicial:', err);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do paciente para cadastro domiciliar:', error);
      } finally {
        setLoadingPaciente(false);
      }
    };

    fetchPacienteData();
  }, [params.id, params.atendimentoId, params.nome, params.DN, params.endereco]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!params.id) {
      Alert.alert('Atenção', 'Não foi possível identificar o cadastro deste paciente.');
      return;
    }

    setSaving(true);
    try {
      const numDisplay = formData.imovelSemNumero ? 'S/N' : formData.numeroImovel;
      let enderecoFormatado = formData.logradouro;

      if (numDisplay) {
        enderecoFormatado += `, Nº ${numDisplay}`;
      }
      if (formData.bairro) {
        enderecoFormatado += ` - ${formData.bairro}`;
      }
      if (formData.municipio) {
        enderecoFormatado += `, ${formData.municipio}`;
      }

      // 1. Atualiza os dados do paciente no cadastro principal (usado no Perfil)
      const pacienteRef = doc(db, 'pacientes', params.id);
      await updateDoc(pacienteRef, {
        nome: formData.pacienteNome,
        DN: formData.dataNascimento,
        numCartaoSus: formData.numCartaoSus,
        sexo: formData.sexo,
        telefone: formData.telefone,
        endereco: enderecoFormatado,
        logradouro: formData.logradouro,
        bairro: formData.bairro,
        numero: formData.numeroImovel,
        imovelSemNumero: formData.imovelSemNumero,
        municipio: formData.municipio,
        complemento: formData.complemento,
        pontoReferencia: formData.pontoReferencia,
        cep: formData.cep,
      });

      // 2. Salva o Cadastro Domiciliar na coleção principal 'atendimentos' vinculando o pacienteId
      await addDoc(collection(db, 'atendimentos'), {
        pacienteId: params.id,
        tipo: 'Cadastro Domiciliar',
        codigoFicha: formData.cep ? `CEP-${formData.cep.replace(/\D/g, '')}` : 'CAD-DOM',
        formData,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Sucesso', 'Cadastro Domiciliar salvo e dados do paciente atualizados!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Erro ao salvar Cadastro Domiciliar:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados do Cadastro Domiciliar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* PACIENTE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PACIENTE</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          {loadingPaciente ? (
            <ActivityIndicator color="#0055A5" style={{ marginVertical: 10 }} />
          ) : (
            <>
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
            </>
          )}
        </View>

        {/* ENDEREÇO / LOCAL DE PERMANÊNCIA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ENDEREÇO / LOCAL DE PERMANÊNCIA</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Município de Residência</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Município"
                placeholderTextColor={placeholderColor}
                value={formData.municipio}
                onChangeText={(v) => handleChange('municipio', v)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Bairro</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Nome do Bairro"
                placeholderTextColor={placeholderColor}
                value={formData.bairro}
                onChangeText={(v) => handleChange('bairro', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Logradouro / Endereço Completo</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Rua / Avenida / Alameda"
                placeholderTextColor={placeholderColor}
                value={formData.logradouro}
                onChangeText={(v) => handleChange('logradouro', v)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Nº Imóvel</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="123"
                placeholderTextColor={placeholderColor}
                editable={!formData.imovelSemNumero}
                value={formData.imovelSemNumero ? 'S/N' : formData.numeroImovel}
                onChangeText={(v) => handleChange('numeroImovel', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.label, { color: textColor }]}>CEP</Text>
                {loadingCep && <ActivityIndicator size="small" color="#0055A5" />}
              </View>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="38700-000"
                placeholderTextColor={placeholderColor}
                keyboardType="numeric"
                maxLength={9}
                value={formData.cep}
                onChangeText={handleCepChange}
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: textColor }]}>Imóvel sem número?</Text>
            <Switch
              value={formData.imovelSemNumero}
              onValueChange={(val) => handleChange('imovelSemNumero', val)}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Complemento</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Apto, Bloco..."
                placeholderTextColor={placeholderColor}
                value={formData.complemento}
                onChangeText={(v) => handleChange('complemento', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Ponto de referência</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="Próximo a..."
                placeholderTextColor={placeholderColor}
                value={formData.pontoReferencia}
                onChangeText={(v) => handleChange('pontoReferencia', v)}
              />
            </View>
          </View>
        </View>

        {/* TIPO DO IMÓVEL */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TIPO DO IMÓVEL</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.label, { color: textColor }]}>Tipo do Imóvel</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Domicílio, Comercial, etc."
            placeholderTextColor={placeholderColor}
            value={formData.tipoImovel}
            onChangeText={(v) => handleChange('tipoImovel', v)}
          />
        </View>

        {/* TELEFONES PARA CONTATO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TELEFONES PARA CONTATO</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Telefone Residencial</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="(34) 0000-0000"
                placeholderTextColor={placeholderColor}
                keyboardType="phone-pad"
                value={formData.telefoneResidencial}
                onChangeText={(v) => handleChange('telefoneResidencial', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Telefone de Contato</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="(34) 90000-0000"
                placeholderTextColor={placeholderColor}
                keyboardType="phone-pad"
                value={formData.telefoneContato}
                onChangeText={(v) => handleChange('telefoneContato', v)}
              />
            </View>
          </View>
        </View>

        {/* CONDIÇÕES DE MORADIA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CONDIÇÕES DE MORADIA</Text>
        </View>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          
          {/* Situação de Moradia */}
          <Text style={[styles.groupTitle, { color: textColor }]}>Situação de Moradia / Posse da Terra</Text>
          <View style={styles.optionsContainer}>
            {SITUACAO_MORADIA_OPCOES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chipOption,
                  { borderColor },
                  formData.situacaoMoradia === item && styles.chipOptionSelected,
                ]}
                onPress={() => handleChange('situacaoMoradia', item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: formData.situacaoMoradia === item ? '#FFF' : textColor },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Localização */}
          <Text style={[styles.groupTitle, { color: textColor, marginTop: 16 }]}>Localização</Text>
          <View style={styles.optionsContainer}>
            {LOCALIZACAO_OPCOES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chipOption,
                  { borderColor },
                  formData.localizacao === item && styles.chipOptionSelected,
                ]}
                onPress={() => handleChange('localizacao', item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: formData.localizacao === item ? '#FFF' : textColor },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tipo do Domicílio */}
          <Text style={[styles.groupTitle, { color: textColor, marginTop: 16 }]}>Tipo do Domicílio</Text>
          <View style={styles.optionsContainer}>
            {TIPO_DOMICILIO_OPCOES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chipOption,
                  { borderColor },
                  formData.tipoDomicilio === item && styles.chipOptionSelected,
                ]}
                onPress={() => handleChange('tipoDomicilio', item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: formData.tipoDomicilio === item ? '#FFF' : textColor },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Número de Cômodos */}
          <View style={[styles.inputGroup, { marginTop: 16 }]}>
            <Text style={[styles.label, { color: textColor }]}>Número de Cômodos</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Ex: 5"
              placeholderTextColor={placeholderColor}
              keyboardType="numeric"
              value={formData.numeroComodos}
              onChangeText={(v) => handleChange('numeroComodos', v)}
            />
          </View>

          {/* Condição de Posse e Uso da Terra */}
          <Text style={[styles.groupTitle, { color: textColor, marginTop: 16 }]}>
            Condição de Posse e Uso da Terra
          </Text>
          <View style={styles.optionsContainer}>
            {POSSE_TERRA_OPCOES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chipOption,
                  { borderColor },
                  formData.posseTerra === item && styles.chipOptionSelected,
                ]}
                onPress={() => handleChange('posseTerra', item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: formData.posseTerra === item ? '#FFF' : textColor },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
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
              <Text style={styles.saveButtonText}>Salvar Cadastro Domiciliar</Text>
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
  groupTitle: {
    fontSize: 13,
    fontWeight: 'bold',
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipOption: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipOptionSelected: {
    backgroundColor: '#0055A5',
    borderColor: '#0055A5',
  },
  chipText: {
    fontSize: 12,
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