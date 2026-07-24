import { useTheme } from "@/components/ThemeContext";
import { useRouter } from "expo-router";
import { Calendar, FileText, Headphones, MessageCircle, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AddScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleOptionPress = (option: string) => {
    switch (option) {
      case "chat":
        // Navigate to chat with Drbankito
        router.push("/chat-agent");
        break;
      case "support":
        // Navigate to support screen
        router.push("/support");
        break;
      case "simulacre":
        // Navigate to personalized simulacro screen
        router.push("/simulacro-personalizado");
        break;
      case "calendar":
        router.push("/calendar-detail");
        break;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Modal
        visible={true}
        transparent
        animationType="fade"
        onRequestClose={() => router.back()}
      >
        <Pressable style={styles.modalOverlay} onPress={() => router.back()}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Agregar</Text>
              <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.drbankitoLabel}>
                <Text style={styles.drbankitoLabelText}>DRBANKITO</Text>
              </View>

              <TouchableOpacity
              style={[styles.option, { backgroundColor: colors.background }]}
              onPress={() => handleOptionPress("chat")}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#e0e7ff" }]}>
                <MessageCircle size={24} color="#4f46e5" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Chatea con Drbankito
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.subtitle }]}>
                  Resuelve tus dudas con IA
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { backgroundColor: colors.background }]}
              onPress={() => handleOptionPress("calendar")}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#dcfce7" }]}>
                <Calendar size={24} color="#16a34a" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Calendario de actividades
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.subtitle }]}>
                  Ver y agregar eventos al calendario
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { backgroundColor: colors.background }]}
              onPress={() => handleOptionPress("support")}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#fce7f3" }]}>
                <Headphones size={24} color="#db2777" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Soporte
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.subtitle }]}>
                  Contacta con nuestro equipo de ayuda
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { backgroundColor: colors.background }]}
              onPress={() => handleOptionPress("simulacre")}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#dbeafe" }]}>
                <FileText size={24} color="#0284c7" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Genera simulacro por Drbankito
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.subtitle }]}>
                  Crea un nuevo simulacro inteligente
                </Text>
              </View>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 400,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 80,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  drbankitoLabel: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  drbankitoLabelText: {
    color: '#0284c7',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
