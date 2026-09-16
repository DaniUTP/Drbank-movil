import { useTheme } from "@/common/ThemeContext";
import { useRouter } from "expo-router";
import { Brain, Calendar, Headphones, HeartPulse, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AddScreen() {
  const { colors, darkMode } = useTheme();
  const router = useRouter();

  const handleOptionPress = (option: string) => {
    switch (option) {
      case "support":
        router.push("/support");
        break;
      case "calendar":
        router.push("/calendar-detail");
        break;
      case "download":
        router.push("/download-exams");
        break;
      case "medical-assistance":
        router.push("/request-medical-assistance");
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
              <View style={[styles.drbankitoLabel, darkMode && { backgroundColor: "#164e63" }]}>
                <Text style={[styles.drbankitoLabelText, darkMode && { color: "#e0f2fe" }]}>DRBANKITO</Text>
              </View>

              <TouchableOpacity
              style={[styles.option, { backgroundColor: darkMode ? "#102b28" : colors.background, borderColor: colors.inputBorder }]}
              onPress={() => handleOptionPress("calendar")}
            >
              <View style={[styles.iconContainer, { backgroundColor: darkMode ? "#14532d" : "#dcfce7" }]}>
                <Calendar size={24} color={darkMode ? "#4ade80" : "#16a34a"} />
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
              style={[styles.option, { backgroundColor: darkMode ? "#112b45" : colors.background, borderColor: colors.inputBorder }]}
              onPress={() => handleOptionPress("download")}
            >
              <View style={[styles.iconContainer, { backgroundColor: darkMode ? "#164e63" : "#dbeafe" }]}>
                <Brain size={24} color={darkMode ? "#38bdf8" : "#0284c7"} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Descarga de exámenes
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.subtitle }]}>
                  Descarga exámenes para practicar
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { backgroundColor: darkMode ? "#342038" : colors.background, borderColor: colors.inputBorder }]}
              onPress={() => handleOptionPress("support")}
            >
              <View style={[styles.iconContainer, { backgroundColor: darkMode ? "#831843" : "#fce7f3" }]}>
                <Headphones size={24} color={darkMode ? "#f472b6" : "#db2777"} />
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
              style={[styles.option, { backgroundColor: darkMode ? "#392126" : colors.background, borderColor: colors.inputBorder }]}
              onPress={() => handleOptionPress("medical-assistance")}
            >
              <View style={[styles.iconContainer, { backgroundColor: darkMode ? "#7f1d1d" : "#fee2e2" }]}>
                <HeartPulse size={24} color={darkMode ? "#f87171" : "#dc2626"} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Solicitar asistencia médica
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.subtitle }]}>
                  Solicita ayuda de nuestro equipo médico
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
    borderWidth: 1,
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
