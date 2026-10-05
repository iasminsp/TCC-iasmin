import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Interface do item do histórico retornado do Firestore
interface HistoricoItem {
  id: string;
  numeroAtendimento: string;
  tipoDocumento: string;
  dataHora: string;
  rawDate?: Date | null;
  rota: string;
  formData?: any;
}

// Mapeamento do tipo de ficha salvo no banco para a rota de visualização/edição
const ROTA_POR_TIPO: Record<string, string> = {
  SOAP: '/Soap',
  'Atendimento SOAP': '/Soap',
  Elegibilidade: '/elegiabilidade',
  'Ficha de Admissão': '/elegiabilidade',
  'Atendimento Domiciliar': '/atendimentoDomiciliar',
  'Cadastro Domiciliar': '/cadastroDomiciliar',
};

export default function HistoricoAtendimentos() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#121212' : '#F4F6F8';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#F2F3F4' : '#11181C';
  const borderColor = isDark ? '#333333' : '#E0E0E0';
  const placeholderColor = isDark ? '#888888' : '#999999';

  // ID do paciente vindo da navegação do Perfil
  const { id: pacienteId, nome: pacienteNome, DN: pacienteDn } = useLocalSearchParams<{
    id?: string;
    nome?: string;
    DN?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');

  const [todosDocumentos, setTodosDocumentos] = useState<HistoricoItem[]>([]);
  const [historicoList, setHistoricoList] = useState<HistoricoItem[]>([]);

  // Busca atendimentos do paciente no Firestore (na coleção principal 'atendimentos')
  useEffect(() => {
    const fetchHistorico = async () => {
      if (!pacienteId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Consulta apenas com where('pacienteId', '==', pacienteId) sem orderBy
        // para evitar a exigência de índice composto no Firestore
        const atendimentosRef = collection(db, 'atendimentos');
        const q = query(
          atendimentosRef,
          where('pacienteId', '==', pacienteId)
        );
        const querySnapshot = await getDocs(q);

        const lista: HistoricoItem[] = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const tipo = data.tipo || 'Atendimento';
          
          // Trata carimbo de data/hora
          let dataHoraStr = 'Data não informada';
          let dateObj: Date | null = null;

          if (data.createdAt?.toDate) {
            dateObj = data.createdAt.toDate();
            if (dateObj) {
              dataHoraStr = `${dateObj.toLocaleDateString('pt-BR')} às ${dateObj.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}`;
            }
          } else if (data.formData?.data || data.formData?.inicioAtendimento) {
            dataHoraStr = data.formData.inicioAtendimento || data.formData.data;
          }

          // Número/Código do atendimento ou ficha
          const numAtendimento =
            data.codigoFicha ||
            data.formData?.codigoFicha ||
            data.formData?.numeroAtendimento ||
            docSnap.id.substring(0, 8).toUpperCase();

          lista.push({
            id: docSnap.id,
            numeroAtendimento: numAtendimento,
            tipoDocumento: tipo,
            dataHora: dataHoraStr,
            rawDate: dateObj,
            rota: ROTA_POR_TIPO[tipo] || '/Soap',
            formData: data.formData,
          });
        });

        // Ordena em memória pela data mais recente (decrescente)
        lista.sort((a, b) => {
          const timeA = a.rawDate ? a.rawDate.getTime() : 0;
          const timeB = b.rawDate ? b.rawDate.getTime() : 0;
          return timeB - timeA;
        });

        setTodosDocumentos(lista);
        setHistoricoList(lista);
      } catch (error) {
        console.error('Erro ao buscar histórico de atendimentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, [pacienteId]);

  // Função para converter string DD/MM/AAAA em Date para comparação
  const parseDateBR = (dateStr: string): Date | null => {
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return null;
  };

  // Função para filtrar localmente os itens retornados do banco por tipo e intervalo de datas
  const handleSearch = () => {
    let filtrado = [...todosDocumentos];

    // Filtro por Tipo de Documento
    if (tipoFiltro.trim()) {
      filtrado = filtrado.filter((item) =>
        item.tipoDocumento.toLowerCase().includes(tipoFiltro.toLowerCase())
      );
    }

    // Filtro por Data Início
    if (dataInicio.trim()) {
      const startDate = parseDateBR(dataInicio);
      if (startDate) {
        startDate.setHours(0, 0, 0, 0);
        filtrado = filtrado.filter((item) => {
          if (!item.rawDate) return false;
          return item.rawDate.getTime() >= startDate.getTime();
        });
      }
    }

    // Filtro por Data Fim
    if (dataFim.trim()) {
      const endDate = parseDateBR(dataFim);
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
        filtrado = filtrado.filter((item) => {
          if (!item.rawDate) return false;
          return item.rawDate.getTime() <= endDate.getTime();
        });
      }
    }

    setHistoricoList(filtrado);
  };

  const handleOpenDocument = (item: HistoricoItem) => {
    try {
      router.push({
        pathname: item.rota as any,
        params: {
          id: pacienteId,
          nome: pacienteNome,
          DN: pacienteDn,
          atendimentoId: item.id,
          mode: 'view',
        },
      });
    } catch (e) {
      Alert.alert('Erro ao Navegar', `Não foi possível abrir o documento: ${item.tipoDocumento}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* TÍTULO DO HISTÓRICO */}
        <View style={styles.titleRow}>
          <Ionicons name="list-outline" size={22} color={textColor} style={{ marginRight: 8 }} />
          <Text style={[styles.mainTitle, { color: textColor }]}>Histórico(s) - Atendimento</Text>
        </View>

        {/* CARD DE FILTROS */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: textColor }]}>Nº Atendimentos</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                value={String(historicoList.length)}
                editable={false}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: textColor }]}>Data início</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={placeholderColor}
                value={dataInicio}
                onChangeText={setDataInicio}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: textColor }]}>Data fim</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor }]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={placeholderColor}
                value={dataFim}
                onChangeText={setDataFim}
              />
            </View>
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={[styles.label, { color: textColor }]}>Histórico tipo atendimentos</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Digite: SOAP, Elegibilidade..."
              placeholderTextColor={placeholderColor}
              value={tipoFiltro}
              onChangeText={setTipoFiltro}
            />
          </View>

          {/* BOTÃO BUSCAR */}
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.7}>
            <Ionicons name="search" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* LISTA DE DOCUMENTOS ENCONTRADOS */}
        <Text style={[styles.sectionSubtitle, { color: textColor }]}>Documentos Registrados</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0055A5" style={{ marginTop: 20 }} />
        ) : historicoList.length > 0 ? (
          historicoList.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.documentCard, { backgroundColor: cardBg, borderColor: '#0055A5' }]}
              onPress={() => handleOpenDocument(item)}
              activeOpacity={0.6}
            >
              <View style={styles.documentHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.documentTitle, { color: textColor }]}>
                    {item.numeroAtendimento} - {item.tipoDocumento}
                  </Text>
                  <Text style={[styles.documentDate, { color: placeholderColor }]}>
                    {item.dataHora}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#0055A5" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          /* ESTADO VAZIO / NENHUM DOCUMENTO SALVO */
          <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor }]}>
            <Ionicons name="document-text-outline" size={48} color={placeholderColor} style={{ marginBottom: 10 }} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>Nenhum documento encontrado</Text>
            <Text style={[styles.emptySubText, { color: placeholderColor }]}>
              Ainda não existem fichas salvas ou o filtro pesquisado não retornou resultados.
            </Text>
          </View>
        )}

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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
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
    paddingVertical: 7,
    fontSize: 13,
  },
  searchButton: {
    backgroundColor: '#31708F',
    width: 60,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  documentCard: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  documentDate: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    textAlign: 'center',
  },
});