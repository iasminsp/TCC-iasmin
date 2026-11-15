import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig'; // Ajuste o caminho se necessário
import { FunçoesCard } from '@/src/components/Funções';

export default function PerfilScreen({ status = "Ativo" }: { status?: string }) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';
  const cardBgColor = colorScheme === 'dark' ? '#3A3D42' : '#f3f4f6';

  const { id, nome: nomeParam, condicao: condicaoParam, DN: dnParam, endereco: enderecoParam } = useLocalSearchParams<{
    id?: string;
    nome?: string;
    condicao?: string;
    DN?: string;
    endereco?: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [pacienteData, setPacienteData] = useState({
    nome: nomeParam || '',
    DN: dnParam || '',
    condicao: condicaoParam || '',
    endereco: enderecoParam || '',
  });

  useEffect(() => {
    const fetchPaciente = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const pacienteRef = doc(db, 'pacientes', id);
        const pacienteSnap = await getDoc(pacienteRef);

        if (pacienteSnap.exists()) {
          const data = pacienteSnap.data();

          let enderecoFormatado = data.endereco || '';

          if (!enderecoFormatado && (data.logradouro || data.rua)) {
            const rua = data.logradouro || data.rua || '';
            const num = data.imovelSemNumero ? 'S/N' : (data.numero || data.numeroImovel || '');
            const bairro = data.bairro ? ` - ${data.bairro}` : '';
            const municipio = data.municipio ? `, ${data.municipio}` : '';

            enderecoFormatado = `${rua}${num ? `, Nº ${num}` : ''}${bairro}${municipio}`;
          }

          setPacienteData({
            nome: data.nome || nomeParam || 'Nome do Paciente',
            DN: data.DN || dnParam || 'Não informada',
            condicao: data.condicao || condicaoParam || 'Não informada',
            endereco: enderecoFormatado || enderecoParam || 'Nenhum endereço cadastrado.',
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados do paciente no perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaciente();
  }, [id, nomeParam, dnParam, condicaoParam, enderecoParam]);

  const { nome, DN, condicao, endereco } = pacienteData;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 40 }}>
        <Ionicons name="person-circle-sharp" size={100} color={textColor} />
        <View style={{ flexDirection: 'column', marginLeft: 20, flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginTop: 10 }}>
            {nome || "Nome do Paciente"}
          </Text>
          <Text style={{ fontSize: 15, color: textColor, marginTop: 6 }}>
            DN: {DN || "Não informada"}
          </Text>
          <Text style={{ fontSize: 15, color: textColor, marginTop: 6 }}>
            Condição: {condicao || "Não informada"}
          </Text>
        </View>
      </View>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <View style={[styles.enderecoCard, { backgroundColor: cardBgColor }]}>
        {loading ? (
          <ActivityIndicator color="#0055A5" />
        ) : (
          <Text style={[styles.enderecoValue, { color: textColor }]}>
            {endereco || "Nenhum endereço cadastrado."}
          </Text>
        )}
      </View>
      <FunçoesCard
        iconFamily="MaterialCommunityIcons"
        iconName="file-document-plus-outline"
        iconSize={20}
        title="Ficha de Admissão/Elegiabilidade"
        onPress={() => router.push({ pathname: '/elegiabilidade', params: { id, nome, DN, endereco } })}
      />  
      <FunçoesCard
        iconFamily="FontAwesome5"
        iconName="folder-open"
        iconSize={20}
        title="Evolução SOAP"
        onPress={() => router.push({ pathname: '/Soap', params: { id, nome, DN, endereco } })}
      />
      <FunçoesCard
        iconFamily="MaterialCommunityIcons"
        iconName="folder-home-outline"
        iconSize={20}
        title="Ficha de Atendimento Domiciliar"
        onPress={() => router.push({ pathname: '/atendimentoDomiciliar', params: { id, nome, DN, endereco } })}
      /> 
      <FunçoesCard
        iconFamily="MaterialCommunityIcons"
        iconName="home-group"
        iconSize={20}
        title="Cadastro Domiciliar"
        onPress={() => router.push({ pathname: '/cadastroDomiciliar', params: { id, nome, DN, endereco } })}
      /> 
      <FunçoesCard
        iconFamily="Ionicons"
        iconName="document-attach-outline"
        iconSize={20}
        title="Documentos/historico"
        onPress={() => router.push({ pathname: '/historicoDocumentos', params: { id, nome, DN } })}
      /> 
    </View>   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2564eb4b',
    borderWidth: 1,
    width: 100,
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 25,
    borderRadius: 6,
    margin: 20,
  },
  statusText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '600',
  },
  enderecoCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    minHeight: 80,
    justifyContent: 'center',
  },
  enderecoValue: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
});