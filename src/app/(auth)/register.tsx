import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { registerUser } from '../../services/authService';
import { CBOS_SAUDE, CBOItem } from '@/src/data/CBO';

const EQUIPES_OPCOES = ['EMAD 1', 'EMAD 2'];

export default function RegisterScreen() {
  const router = useRouter();

  // API CBO
  const [cboQuery, setCboQuery] = useState('');
  const [cboResults, setCboResults] = useState<CBOItem[]>([]);
  const [selectedCBO, setSelectedCBO] = useState<CBOItem | null>(null);

  const [nome, setNome] = useState('');
  const [cpfOrEmail, setCpfOrEmail] = useState('');
  const [equipe, setEquipe] = useState('');
  const [turno, setTurno] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearchCBO = (text: string) => {
    setCboQuery(text);
    setSelectedCBO(null);

    if (text.trim().length < 1) {
      setCboResults([]);
      return;
    }

    const cleanSearch = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const filtered = CBOS_SAUDE.filter((item) => {
      const cleanName = item.no_cbo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return cleanName.includes(cleanSearch) || item.co_cbo.includes(cleanSearch);
    });

    setCboResults(filtered);
  };

  const handleSelectCBO = (item: CBOItem) => {
    setSelectedCBO(item);
    setCboQuery(`${item.co_cbo} - ${item.no_cbo}`);
    setCboResults([]);
  };

  const handleRegister = async () => {
    if (!nome || !cpfOrEmail || !selectedCBO || !equipe || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        nome,
        cpfOrEmail,
        senha,
        cbo: {
          codigo: selectedCBO.co_cbo,
          descricao: selectedCBO.no_cbo,
        },
        equipe,
        turno: turno || 'Integral',
      });
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      router.back();
    } catch (err: any) {
      Alert.alert('Erro no Cadastro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.brandTitle}>VIVER Sistemas</Text>

      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>Crie sua</Text>
        <Text style={styles.headerTitle}>conta!</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nome completo</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Dr. Nome Exemplo"
            placeholderTextColor="#a1a1aa"
            value={nome}
            onChangeText={setNome}
          />
          <Ionicons name="checkmark" size={18} color="#a1a1aa" />
        </View>

        <Text style={styles.label}>CPF ou email p/ login</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="@gmail"
            placeholderTextColor="#a1a1aa"
            value={cpfOrEmail}
            onChangeText={setCpfOrEmail}
            autoCapitalize="none"
          />
          <Ionicons name="checkmark" size={18} color="#a1a1aa" />
        </View>

        {/* Busca CBO */}
        <Text style={styles.label}>CBO / Ocupação</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite para buscar (ex: Enfermeiro, Medico)"
            placeholderTextColor="#a1a1aa"
            value={cboQuery}
            onChangeText={handleSearchCBO}
          />
          {selectedCBO ? (
            <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
          ) : (
            <Ionicons name="search" size={18} color="#a1a1aa" />
          )}
        </View>

        {cboResults.length > 0 && (
          <View style={styles.dropdownList}>
            {cboResults.slice(0, 5).map((item) => (
              <TouchableOpacity
                key={item.co_cbo}
                style={styles.dropdownItem}
                onPress={() => handleSelectCBO(item)}
              >
                <Text style={styles.cboCode}>{item.co_cbo}</Text>
                <Text style={styles.cboText} numberOfLines={1}>
                  {item.no_cbo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Equipe</Text>
        <View style={styles.optionsGroup}>
          {EQUIPES_OPCOES.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                equipe === option && styles.optionButtonSelected,
              ]}
              onPress={() => setEquipe(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  equipe === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="••••••••••"
            placeholderTextColor="#a1a1aa"
            secureTextEntry={!showPassword}
            value={senha}
            onChangeText={setSenha}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye' : 'eye-outline'} size={18} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar Senha</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="••••••••••"
            placeholderTextColor="#a1a1aa"
            secureTextEntry={!showConfirmPassword}
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons name={showConfirmPassword ? 'eye' : 'eye-outline'} size={18} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity disabled={loading} onPress={handleRegister}>
          <LinearGradient
            colors={['#0052cc', '#d97706']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.button}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <LinearGradient colors={['#1d4ed8', '#9a6010']} style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {Platform.OS === 'web' ? (
            content
          ) : (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              {content}
            </TouchableWithoutFeedback>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 10,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontStyle: 'italic',
    paddingHorizontal: 24,
    marginTop: 10,
  },
  headerArea: {
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 32,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '400',
    lineHeight: 36,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 32,
    paddingTop: 25,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#1e1b4b',
    marginTop: 12,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 4,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 12,
    fontStyle: 'italic',
    color: '#374151',
  },
  optionsGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  optionButtonSelected: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  dropdownList: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: -4,
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cboCode: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginRight: 8,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cboText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
});