import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CircularProgress from "../components/CircularProgress";
import { useTheme } from "../components/ThemeContext";

import {
  Bell,
  Brain,
  CalendarDays,
  Flame,
  Heart,
  LayoutGrid, LucideIcon, Moon, Pill,
  Sun,
  TrendingUp
} from "lucide-react-native";

// ============================================
// TYPES
// ============================================
interface CalendarItem {
  day: string;
  date: number;
  subject: string;
  icon: LucideIcon;
  iconColor: string;
  progress: number;
  completedBlocks: number;
  totalBlocks: number;
  isLibre?: boolean;
}

// ============================================
// STATIC DATA - Defined outside component to prevent recreation
// ============================================
const USER_DATA = {
  name: "Juan Carlos",
  avatar: "https://i.pravatar.cc/150?img=3"
} as const;

const METRICS_DATA = {
  streak: 12,
  accuracy: 78
} as const;

const CALENDAR_DATA: CalendarItem[] = [
  { day: "LUN", date: 16, subject: "Cardiología", icon: Heart, iconColor: "#ef4444", progress: 0, completedBlocks: 0, totalBlocks: 5 },
  { day: "MAR", date: 17, subject: "Pediatría", icon: Brain, iconColor: "#8b5cf6", progress: 60, completedBlocks: 3, totalBlocks: 5 },
  { day: "MIÉ", date: 18, subject: "Farmacología", icon: Pill, iconColor: "#f97316", progress: 40, completedBlocks: 2, totalBlocks: 5 },
  { day: "JUE", date: 19, subject: "Neurología", icon: Brain, iconColor: "#06b6d4", progress: 80, completedBlocks: 4, totalBlocks: 5 },
  { day: "VIE", date: 20, subject: "Cirugía", icon: LayoutGrid, iconColor: "#ec4899", progress: 100, completedBlocks: 5, totalBlocks: 5 },
  { day: "SÁB", date: 21, subject: "Repaso", icon: TrendingUp, iconColor: "#22c55e", progress: 20, completedBlocks: 1, totalBlocks: 5 },
  { day: "DOM", date: 22, subject: "Libre", icon: CalendarDays, iconColor: "#64748b", progress: 0, completedBlocks: 0, totalBlocks: 0, isLibre: true },
];

// ============================================
// MEMOIZED DAY CARD COMPONENT
// ============================================
interface DayCardProps {
  item: typeof CALENDAR_DATA[number];
  colors: ReturnType<typeof useTheme>["colors"];
  onPress: (date: number, isLibre: boolean) => void;
}

const DayCard = memo<DayCardProps>(function DayCard({ item, colors, onPress }) {
  const handlePress = useCallback(() => {
    onPress(item.date, !!item.isLibre);
  }, [onPress, item.date, item.isLibre]);

  const progressColor = item.progress >= 70 ? "#22c55e" : item.progress >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <Pressable
      style={[styles.dayCard, { backgroundColor: colors.card }]}
      onPress={handlePress}
    >
      <View style={[styles.dayIconContainer, { backgroundColor: item.iconColor + "20" }]}>
        <item.icon size={20} color={item.iconColor} />
      </View>
      <View style={styles.dayContent}>
        <View style={styles.dayHeader}>
          <Text style={[styles.dayText, { color: colors.subtitle }]}>
            {item.day}
          </Text>
          <Text style={[styles.dayNumber, { color: colors.text }]}>
            {item.date}
          </Text>
        </View>
        <Text style={[styles.daySubject, { color: colors.text }]}>
          {item.subject}
        </Text>
      </View>
      <CircularProgress 
        percentage={item.progress}
        size={48}
        strokeWidth={5}
        color={progressColor}
        backgroundColor="#e2e8f0"
        showLabel={false}
      />
    </Pressable>
  );
});

// ============================================
// MAIN DASHBOARD SCREEN - Optimized with memo
// ============================================
function DashboardScreenComponent() {
  const { colors, darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();

  // Memoized navigation handler
  const handleDayPress = useCallback((date: number, isLibre: boolean) => {
    if (!isLibre) {
      router.push({ pathname: "/calendar-detail", params: { day: date } });
    }
  }, [router]);

  // Memoize container styles
  const containerStyle = useMemo(() => [
    styles.container, 
    { backgroundColor: colors.background }
  ], [colors.background]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={{ uri: USER_DATA.avatar }} 
              style={styles.avatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <View>
              <Text style={[styles.greeting, { color: colors.subtitle }]}>
                Buenos días,
              </Text>
              <Text style={[styles.username, { color: colors.text }]}>
                {USER_DATA.name}
              </Text>
            </View>
          </View>
          <Pressable onPress={toggleDarkMode} style={styles.notification}>
            {darkMode ? (
              <Sun size={22} color={colors.text} />
            ) : (
              <Moon size={22} color={colors.text} />
            )}
          </Pressable>
        </View>

        {/* IA CARD */}
        <View style={styles.aiCard}>
          <Text style={styles.aiLabel}>
            RECOMENDACIÓN DE IA
          </Text>
          <Text style={styles.aiTitle}>
            Refuerzo Personalizado
          </Text>
          <Text style={styles.aiText}>
            Hoy reforzaremos
          </Text>
          <Text style={styles.aiTopic}>
            Insuficiencia Cardíaca
          </Text>
          <Pressable style={styles.aiButton}>
            <Text style={styles.aiButtonText}>
              Comenzar Repaso
            </Text>
          </Pressable>
        </View>

        {/* MÉTRICAS */}
        <View style={styles.metricsContainer}>
          <View style={[styles.metricCard,{backgroundColor:colors.card}]}>
            <Flame size={20} color="#f97316" />
            <Text style={[styles.metricNumber,{color:colors.text}]}>
              {METRICS_DATA.streak} Días
            </Text>
            <Text style={[styles.metricLabel,{color:colors.subtitle}]}>
              Racha
            </Text>
          </View>
          <View style={[styles.metricCard,{backgroundColor:colors.card}]}>
            <TrendingUp size={20} color="#22c55e" />
            <Text style={[styles.metricNumber,{color:colors.text}]}>
              {METRICS_DATA.accuracy}%
            </Text>
            <Text style={[styles.metricLabel,{color:colors.subtitle}]}>
              Precisión
            </Text>
          </View>
        </View>

        {/* CALENDARIO - Vertical List */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <View style={styles.calendarTitleRow}>
              <CalendarDays size={18} color={colors.text} />
              <Text style={[styles.calendarTitle,{color:colors.text}]}>
                Calendario de Estudio
              </Text>
            </View>
          </View>

          <View style={styles.calendarList}>
            {CALENDAR_DATA.map((item, index) => (
              <DayCard 
                key={index} 
                item={item} 
                colors={colors} 
                onPress={handleDayPress}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Add display name for debugging
DashboardScreenComponent.displayName = "DashboardScreen";

export default memo(DashboardScreenComponent);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 35,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  notification: {
    padding: 8,
  },
  greeting: {
    fontSize: 14,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
  },
  aiCard: {
    backgroundColor: "#0f4c81",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  aiLabel: {
    color: "#93c5fd",
    fontSize: 12,
    marginBottom: 5,
  },
  aiTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  aiText: {
    color: "#cbd5f5",
  },
  aiTopic: {
    color: "white",
    fontWeight: "600",
    marginBottom: 15,
  },
  aiButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  aiButtonText: {
    color: "#0f4c81",
    fontWeight: "bold",
  },
  metricsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  metricLabel: {
    fontSize: 12,
  },
  calendarSection: {
    marginBottom: 100,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  calendarTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  calendarList: {
    gap: 16,
  },
  dayCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    minHeight: 72,
  },
  dayIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dayContent: {
    flex: 1,
    marginLeft: 12,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  daySubject: {
    fontSize: 14,
    marginTop: 2,
  },
  dayProgress: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  circularProgress: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
