import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,ActivityIndicator,Alert,ScrollView,KeyboardAvoidingView,TouchableWithoutFeedback,Keyboard,Platform}from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { loginUser } from '../../services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const [loginInput, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginInput || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      await loginUser(loginInput, senha);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Erro no Login', err.message);
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
        <Text style={styles.headerTitle}>Seja</Text>
        <Text style={styles.headerTitle}>Bem vindoo!!</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Login</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="00011122255@gmail.com"
            placeholderTextColor="#a1a1aa"
            value={loginInput}
            onChangeText={setLoginInput}
            autoCapitalize="none"
          />
          <Ionicons name="checkmark" size={18} color="#a1a1aa" />
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
            <Ionicons name={showPassword ? "eye" : "eye-outline"} size={18} color="#a1a1aa" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity disabled={loading} onPress={handleLogin}>
          <LinearGradient
            colors={['#0052cc', '#d97706']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.button}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.footerText}>
            Não tem uma conta? <Text style={styles.underlineText}>cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <LinearGradient colors={['#1d4ed8', '#9a6010']} style={styles.container}>
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
  container: { flex: 1, paddingTop: 50 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  brandTitle: { 
    color: '#ffffff', 
    fontSize: 14, 
    fontWeight: 'bold', 
    fontStyle: 'italic', 
    paddingHorizontal: 24 
  },
  headerArea: { 
    flex:1, 
    marginTop: 20, 
    marginBottom: 40, 
    paddingHorizontal: 32 
  },
  headerTitle: { 
    color: '#ffffff', 
    fontSize: 32, 
    fontWeight: '400', 
    lineHeight: 38 
  },
  card: { 
    backgroundColor: '#f8f8f8', 
    borderTopLeftRadius: 50, 
    borderTopRightRadius: 50, 
    paddingHorizontal: 32, 
    paddingTop: 52,
    paddingBottom: 88,
  },
  label: { 
    fontSize: 14, 
    fontStyle: 'italic', 
    fontWeight: '600', 
    color: '#1e1b4b', 
    marginTop: 16, 
    marginBottom: 4 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#d5d4d4', 
    paddingBottom: 4, 
    marginBottom: 22 
  },
  input: { 
    flex: 1, fontSize: 12, fontStyle: 'italic', color: '#374151' 
  },
  button: { 
    borderRadius: 25, 
    paddingVertical: 12, 
    alignItems: 'center', 
    marginTop: 32 
  },
  buttonText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontStyle: 'italic', 
    fontWeight: 'bold' 
  },
  footerLink: { 
    marginTop: 24, 
    alignItems: 'flex-end' 
  },
  footerText: { 
    fontSize: 11, 
    fontStyle: 'italic', 
    color: '#6b7280' 
  },
  underlineText: { 
    textDecorationLine: 'underline' 
  },
})