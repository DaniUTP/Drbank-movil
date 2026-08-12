import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularProgress from "../../common/CircularProgress";
import StatCard from "../../common/StatCard";
import { useTheme } from "../../common/ThemeContext";
import { useProfileQuery } from "../../services/profile/profile.rtkq";
import { styles } from "./styles";

import {
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

  // Fetch user profile data
  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useProfileQuery();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={{ uri: "https://i.pravatar.cc/150?img=3" }} 
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
                {profileData ? `${profileData.name} ${profileData.last_name}` : 'Cargando...'}
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
          <StatCard
            icon={Flame}
            iconColor="#f97316"
            iconBgColor="#f9731620"
            value={`${METRICS_DATA.streak} Días`}
            label="Racha"
            colors={colors}
          />
          <StatCard
            icon={TrendingUp}
            iconColor="#22c55e"
            iconBgColor="#22c55e20"
            value={`${METRICS_DATA.accuracy}%`}
            label="Precisión"
            colors={colors}
          />
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
    </SafeAreaView>
  );
}

// Add display name for debugging
DashboardScreenComponent.displayName = "DashboardScreen";

export default memo(DashboardScreenComponent);
