import React, { memo } from "react";
import { Dimensions, Image, Pressable, Modal as RNModal, StyleSheet, Text, View } from "react-native";
import { useTheme } from "./ThemeContext";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  logoSource?: any;
  showFooter?: boolean;
  footerText?: string;
}

const { width } = Dimensions.get('window');

const Modal = memo<ModalProps>(function Modal({
  visible,
  onClose,
  title,
  children,
  icon,
  logoSource,
  showFooter = true,
  footerText = "Aceptar",
}) {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
          
          {/* HEADER REDISEÑADO: Logo arriba, título abajo */}
          <View style={styles.headerContainer}>
            {logoSource && (
              <Image source={logoSource} style={styles.logo} resizeMode="contain" />
            )}
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <Text style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {children}
          </View>

          {/* Footer con acción principal */}
          {showFooter && (
            <View style={styles.footer}>
              <Pressable 
                style={[styles.primaryButton, { backgroundColor: colors.buttonBg }]} 
                onPress={onClose}
              >
                <Text style={[styles.primaryButtonText, { color: colors.buttonText }]}>
                  {footerText}
                </Text>
              </Pressable>
            </View>
          )}

        </View>
      </View>
    </RNModal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  
  // --- ESTILOS NUEVOS DEL HEADER ---
  headerContainer: {
    alignItems: 'center', // Centra todo horizontalmente
    marginBottom: 16,     // Un poco menos de margen porque ya no hay X
    paddingTop: 8,
  },
  logo: {
    width: 120,  // Aumenté un poco más (a 64px) porque ahora tiene espacio arriba
    height: 120
  },
  iconWrapper: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center", // Asegura que el título esté centrado
    color: "#000", // Se sobreescribe con el color del tema
  },
  // --------------------------------

  body: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 16,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

Modal.displayName = "Modal";

export default Modal;