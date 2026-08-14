import DashboardHeader from "@/common/DashboardHeader";
import { useTheme } from "@/common/ThemeContext";
import { useRouter } from "expo-router";
import { Calendar, LayoutGrid, Settings } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles";

export default function SimulacreScreen() {
 const { colors } = useTheme();
 const router = useRouter();
 const [pressedCard, setPressedCard] = useState<string | null>(null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <DashboardHeader />
      
      <Text style={[styles.title, { color: colors.text }]}>Simulacro</Text>
      <Text style={[styles.subtitle, { color: colors.subtitle }]}>
        Prepárate con nuestra base de datos especializada
      </Text>

      <View style={styles.optionsContainer}>
        <Pressable 
          style={[
            styles.optionCard, 
            { backgroundColor: colors.card },
            pressedCard === 'generator' && styles.optionCardPressed
          ]}
          onPress={() => router.push("/simulacre-generator")}
          onPressIn={() => setPressedCard('generator')}
          onPressOut={() => setPressedCard(null)}
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

        <Pressable 
          style={[
            styles.optionCard, 
            { backgroundColor: colors.card },
            pressedCard === 'year' && styles.optionCardPressed
          ]}
          onPress={()=>router.push("/simulacre-by-year")}
          onPressIn={() => setPressedCard('year')}
          onPressOut={() => setPressedCard(null)}
        >
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

        <Pressable 
          style={[
            styles.optionCard, 
            { backgroundColor: colors.card },
            pressedCard === 'theme' && styles.optionCardPressed
          ]}
          onPress={()=>router.push("/simulacre-by-theme")}
          onPressIn={() => setPressedCard('theme')}
          onPressOut={() => setPressedCard(null)}
        >
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
    </SafeAreaView>
  );
}
