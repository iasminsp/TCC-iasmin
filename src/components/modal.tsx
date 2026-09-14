import React from 'react';
import { 
  Modal, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  View 
} from 'react-native';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
}

export function BaseModal({
  visible,
  onClose,
  title,
  children,
  animationType = 'slide',
}: BaseModalProps) {
  return (
    <Modal
      animationType={animationType}
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPressOut={onClose}
      >
        {/* Impede que o clique dentro do card feche o modal */}
        <TouchableWithoutFeedback>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{title}</Text>
            
            <View style={styles.modalBody}>
              {children}
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeButtonText: {
    color: '#666',
    fontWeight: '600',
  },
});