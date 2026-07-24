import DashboardHeader from "@/components/DashboardHeader";
import { useTheme } from "@/components/ThemeContext";
import { useRouter } from "expo-router";
import { Calendar, LayoutGrid, Settings } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SimulacreScreen() {
 const { colors } = useTheme();
 const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <DashboardHeader />
      
      <Text style={[styles.title, { color: colors.text }]}>Simulacro</Text>
      <Text style={[styles.subtitle, { color: colors.subtitle }]}>
        Prepárate con nuestra base de datos especializada
      </Text>

      <View style={styles.optionsContainer}>
        <Pressable 
          style={[styles.optionCard, { backgroundColor: colors.card }]}
          onPress={() => router.push("/simulacre-generator")}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#e0f2fe" }]}>
            <Settings size={28} color="#0284c7" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Generador</Text>
            <Text style={[styles.optionSubtitle, { color: colors.subtitle }]}>
              Personaliza tu examen
            </Text>
          </View>
        </Pressable>

        <Pressable style={[styles.optionCard, { backgroundColor: colors.card }]}
         onPress={()=>router.push("/simulacre-by-year")}>
          <View style={[styles.iconContainer, { backgroundColor: "#f0fdf4" }]}>
            <Calendar size={28} color="#22c55e" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Por año</Text>
            <Text style={[styles.optionSubtitle, { color: colors.subtitle }]}>
              Exámenes históricos
            </Text>
          </View>
        </Pressable>

        <Pressable style={[styles.optionCard, { backgroundColor: colors.card }]}
         onPress={()=>router.push("/simulacre-by-theme")}>
          <View style={[styles.iconContainer, { backgroundColor: "#fef3c7" }]}>
            <LayoutGrid size={28} color="#d97706" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Por tema</Text>
            <Text style={[styles.optionSubtitle, { color: colors.subtitle }]}>
              Temas específicos
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 35,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#64748b",
    marginTop: 5,
    marginBottom: 25,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  optionSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
});