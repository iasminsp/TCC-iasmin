import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { registerUser } from '../../services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [cpfOrEmail, setCpfOrEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nome || !cpfOrEmail || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({ nome, cpfOrEmail, senha });
      Alert.alert('Sucesso', 'Conta criada!');
      router.back();
    } catch (err: any) {
      Alert.alert('Erro no Cadastro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1d4ed8', '#9a6010']} style={styles.container}>
      <Text style={styles.brandTitle}>VIVER Sistemas</Text>

      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>Crie sua</Text>
        <Text style={styles.headerTitle}>conta!</Text>
      </View>

      <View style={styles.card}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Nome completo</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="00011122255@gmailouCPF" placeholderTextColor="#a1a1aa" value={nome} onChangeText={setNome} />
            <Ionicons name="checkmark" size={18} color="#a1a1aa" />
          </View>

          <Text style={styles.label}>CPF ou email p/ login</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="00011122255@gmailouCPF" placeholderTextColor="#a1a1aa" value={cpfOrEmail} onChangeText={setCpfOrEmail} autoCapitalize="none" />
            <Ionicons name="checkmark" size={18} color="#a1a1aa" />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="••••••••••" placeholderTextColor="#a1a1aa" secureTextEntry={!showPassword} value={senha} onChangeText={setSenha} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye" : "eye-outline"} size={18} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar Senha</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="••••••••••" placeholderTextColor="#a1a1aa" secureTextEntry={!showConfirmPassword} value={confirmarSenha} onChangeText={setConfirmarSenha} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? "eye" : "eye-outline"} size={18} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity disabled={loading} onPress={handleRegister}>
            <LinearGradient colors={['#0052cc', '#d97706']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.button}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enter</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  brandTitle: { color: '#ffffff', fontSize: 14, fontWeight: 'bold', fontStyle: 'italic', paddingHorizontal: 24 },
  headerArea: { marginTop: 40, marginBottom: 40, paddingHorizontal: 32 },
  headerTitle: { color: '#ffffff', fontSize: 32, fontWeight: '400', lineHeight: 38 },
  card: { flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 50, borderTopRightRadius: 50, paddingHorizontal: 32, paddingTop: 40 },
  label: { fontSize: 14, fontStyle: 'italic', fontWeight: '600', color: '#1e1b4b', marginTop: 16, marginBottom: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#d1d5db', paddingBottom: 4, marginBottom: 12 },
  input: { flex: 1, fontSize: 12, fontStyle: 'italic', color: '#374151' },
  button: { borderRadius: 25, paddingVertical: 12, alignItems: 'center', marginTop: 32 },
  buttonText: { color: '#ffffff', fontSize: 16, fontStyle: 'italic', fontWeight: 'bold' },
});