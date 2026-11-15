import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export interface ItemSeletor {
  codigo: string;
  descricao: string;
}

interface SeletorProps {
  label?: string;
  value: string;
  options: ItemSeletor[];
  onSelect: (item: ItemSeletor) => void;
  allowCustomText?: boolean;
  onCustomTextChange?: (text: string) => void;
  placeholder?: string;
  isDark: boolean;
}

export const Seletor = ({
  label,
  value,
  options,
  onSelect,
  allowCustomText = false,
  onCustomTextChange,
  placeholder = 'Selecione...',
  isDark,
}: SeletorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [topPos, setTopPos] = useState(0);
  const buttonRef = useRef<React.ElementRef<typeof View>>(null);

  const filteredOptions = options.filter(
    (item) =>
      item.codigo.toLowerCase().includes(search.toLowerCase()) ||
      item.descricao.toLowerCase().includes(search.toLowerCase())
  );

  const textColor = isDark ? '#F2F3F4' : '#11181C';
  const borderColor = isDark ? '#333333' : '#E0E0E0';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const dropdownBg = isDark ? '#252525' : '#FFFFFF';

  const handleOpen = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setTopPos(y + height + 2);
      setIsOpen(true);
    });
  };

  return (
    <View style={{ marginBottom: 10 }}>
      {label ? <Text style={[styles.label, { color: textColor }]}>{label}</Text> : null}

      <View ref={buttonRef} collapsable={false}>
        <TouchableOpacity
          style={[styles.selectBox, { borderColor, backgroundColor: cardBg }]}
          onPress={handleOpen}
          activeOpacity={0.7}
        >
          <Text style={{ color: value ? textColor : '#888', flex: 1, fontSize: 13 }} numberOfLines={1}>
            {value || placeholder}
          </Text>
          <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={isDark ? '#AAA' : '#666'} />
        </TouchableOpacity>
      </View>

      <Modal visible={isOpen} transparent animationType="none" onRequestClose={() => setIsOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.dropdownFullWidth, { top: topPos, backgroundColor: dropdownBg, borderColor }]}>
                <TextInput
                  style={[styles.searchInput, { color: textColor, borderColor }]}
                  placeholder={allowCustomText ? 'Digite código ou busque...' : 'Buscar...'}
                  placeholderTextColor="#888"
                  value={search}
                  onChangeText={(text) => {
                    setSearch(text);
                    if (allowCustomText && onCustomTextChange) {
                      onCustomTextChange(text);
                    }
                  }}
                />

                <View style={[styles.tableHeader, { backgroundColor: '#0055A5' }]}>
                  <Text style={[styles.tableHeaderText, { width: 85 }]}>Código</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Descrição</Text>
                </View>

                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((item) => (
                      <TouchableOpacity
                        key={item.codigo}
                        style={[styles.tableRow, { borderColor }]}
                        onPress={() => {
                          onSelect(item);
                          setIsOpen(false);
                          setSearch('');
                        }}
                      >
                        <Text style={[styles.rowCode, { width: 85, color: textColor }]}>{item.codigo}</Text>
                        <Text style={[styles.rowDesc, { flex: 1, color: textColor }]}>{item.descricao}</Text>
                      </TouchableOpacity>
                    ))
                  ) : allowCustomText ? (
                    <TouchableOpacity style={styles.customOptionBtn} onPress={() => setIsOpen(false)}>
                      <Text style={{ color: '#0055A5', fontWeight: 'bold', fontSize: 13 }}>
                        Usar valor digitado: "{search}"
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ textAlign: 'center', padding: 12, color: '#888', fontSize: 12 }}>
                      Nenhum item encontrado.
                    </Text>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: { 
    fontSize: 12, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  selectBox: { 
    borderWidth: 1, 
    borderRadius: 6, 
    paddingHorizontal: 10, 
    paddingVertical: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  modalOverlay: { 
    flex: 1 
  },
  dropdownFullWidth: { 
    position: 'absolute', 
    left: 16, 
    right: 16, 
    borderWidth: 1, 
    borderRadius: 6, 
    padding: 8, 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 5 
  },
  searchInput: { 
    borderWidth: 1, 
    borderRadius: 6, 
    paddingHorizontal: 8, 
    paddingVertical: 6, 
    fontSize: 12, 
    marginBottom: 6 
  },
  tableHeader: { 
    flexDirection: 'row', 
    paddingVertical: 6, 
    paddingHorizontal: 8, 
    borderRadius: 4 
  },
  tableHeaderText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 12 
  },
  tableRow: { 
    flexDirection: 'row', 
    paddingVertical: 8, 
    paddingHorizontal: 8, 
    borderBottomWidth: 1 
  },
  rowCode: { 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  rowDesc: { 
    fontSize: 12 
  },
  customOptionBtn: { 
    padding: 10, 
    alignItems: 'center' 
  },
});