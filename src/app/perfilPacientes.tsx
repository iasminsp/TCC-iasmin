import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '../components/Header';
import { FunçoesCard } from '@/src/components/Funções';


export default function PerfilScreen( { status = "Ativo" }: { status?: string }) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#151718' : '#fff';
  const textColor = colorScheme === 'dark' ? '#f2f3f4' : '#11181C';

  // Resgata os parâmetros vindos da navegação
  const { id, nome, condicao, idade } = useLocalSearchParams<{
    id?: string;
    nome?: string;
    condicao?: string;
    idade?: string;
  }>();

  return (
    
    <View style={[styles.container, { backgroundColor }]}>
      <View style={{  flexDirection: 'row', alignItems: 'center', marginTop: 40 }}>
        <Ionicons name="person-circle-sharp" size={100} color={textColor} />
        <View style={{ flexDirection: 'column', marginLeft: 20, flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginTop: 10 }}>
            {nome || "Nome do Paciente"}
          </Text>
          <Text style={{ fontSize: 15, color: textColor, marginTop: 6 }}>
            Idade: {idade || "Não informada"}
          </Text>
          <Text style={{ fontSize: 15, color: textColor, marginTop: 6 }}>
            Condição: {condicao || "Não informada"}
          </Text>
        </View>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
      <FunçoesCard iconFamily="FontAwesome5" iconName="folder-open" iconSize={20} title="Evolução SOAP" onPress={() => router.push('/Soap')} /> 
      <FunçoesCard iconFamily="MaterialCommunityIcons" iconName="file-document-plus-outline" iconSize={20} title="Ficha de Admissão/Elegiabilidade" onPress={() => router.push('/elegiabilidade')}  />  
      <FunçoesCard iconFamily="MaterialCommunityIcons" iconName="folder-home-outline"iconSize={20}  title="Ficha de Atendimento Domiciliar" onPress={() => router.push('/atendimentoDomiciliar')} /> 
      <FunçoesCard iconFamily="MaterialCommunityIcons" iconName="home-group" iconSize={20}  title="Cadastro Domiciliar" onPress={() => {}} />
      <FunçoesCard iconFamily="Ionicons" iconName="document-attach-outline" iconSize={20} title="Documentos/historico" onPress={() => {}}/>
    
    </View>  
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft:"90%",
    marginTop:'-15%',
    backgroundColor: 'blue'
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
})