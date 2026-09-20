import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardHeader from "../../common/DashboardHeader";
import { useTheme } from "../../common/ThemeContext";
import { getFCMToken } from "../../FirebaseConfig";
import { useLogoutMutation } from "../../services/auth/logout.rtkq";
import { styles } from "./styles";

import {
  BookOpen,
  Brain,
  CalendarDays,
  ChevronRight,
  Heart,
  LayoutGrid, LucideIcon,
  Pill,
  TrendingUp
} from "lucide-react-native";
import { useStudentProgressQuery } from "../../services/studentProgress/student-progress.rtkq";

// ============================================
// TYPES
// ============================================
interface CalendarItem {
  day: string;
  date: string;
  subject: string;
  icon: LucideIcon;
  iconColor: string;
  progress: number;
  completedBlocks: number;
  totalBlocks: number;
  isLibre?: boolean;
  isToday?: boolean;
}

// ============================================
// STATIC DATA - Defined outside component to prevent recreation
// ============================================
const METRICS_DATA = {
  streak: 12,
  accuracy: 78
} as const;

// Helper function to get icon based on topic
const getIconForTopic = (topic: string): LucideIcon => {
  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes("cardio") || lowerTopic.includes("corazón")) return Heart;
  if (lowerTopic.includes("pediatría") || lowerTopic.includes("niño")) return Brain;
  if (lowerTopic.includes("farma") || lowerTopic.includes("medicamento")) return Pill;
  if (lowerTopic.includes("neuro") || lowerTopic.includes("cerebro")) return Brain;
  if (lowerTopic.includes("cirugía") || lowerTopic.includes("operación")) return LayoutGrid;
  if (lowerTopic.includes("repaso") || lowerTopic.includes("repaso")) return TrendingUp;
  return BookOpen;
};

// Helper function to get color based on topic
const getColorForTopic = (topic: string): string => {
  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes("cardio") || lowerTopic.includes("corazón")) return "#ef4444";
  if (lowerTopic.includes("pediatría") || lowerTopic.includes("niño")) return "#8b5cf6";
  if (lowerTopic.includes("farma") || lowerTopic.includes("medicamento")) return "#f97316";
  if (lowerTopic.includes("neuro") || lowerTopic.includes("cerebro")) return "#06b6d4";
  if (lowerTopic.includes("cirugía") || lowerTopic.includes("operación")) return "#ec4899";
  if (lowerTopic.includes("repaso") || lowerTopic.includes("repaso")) return "#22c55e";
  return "#64748b";
};

// Function to transform API data to calendar format
const transformCalendarData = (apiData: any[]): CalendarItem[] => {
  if (!apiData || apiData.length === 0) return [];

  return apiData.map((dayData) => {
    const firstTopic = dayData.topics && dayData.topics.length > 0 ? dayData.topics[0].theme : "Sin temas";
    const icon = getIconForTopic(firstTopic);
    const iconColor = getColorForTopic(firstTopic);

    return {
      day: dayData.day_name.substring(0, 3).toUpperCase(),
      date: dayData.date,
      subject: dayData.topics && dayData.topics.length > 0 ? firstTopic : (dayData.is_completed ? "Completado" : "Libre"),
      icon: icon,
      iconColor: iconColor,
      progress: dayData.percentage || 0,
      completedBlocks: dayData.completed_topics || 0,
      totalBlocks: dayData.total_topics || 0,
      isLibre: dayData.total_topics === 0,
      isToday: dayData.is_today || false
    };
  });
};

// ============================================
// MEMOIZED DAY CARD COMPONENT
// ============================================
interface DayCardProps {
  item: CalendarItem;
  colors: ReturnType<typeof useTheme>["colors"];
  darkMode: boolean;
  onPress: (date: string, isLibre: boolean) => void;
  isPressed: boolean;
}

const DayCard = memo<DayCardProps>(function DayCard({ item, colors, darkMode, onPress, isPressed }) {
  const handlePress = useCallback(() => {
    onPress(item.date, !!item.isLibre);
  }, [onPress, item.date, item.isLibre]);

  const progressColor = item.progress >= 70 ? "#16a34a" : item.progress >= 40 ? "#f59e0b" : "#0284c7";
  const numericDay = /^\d{4}-\d{2}-\d{2}$/.test(item.date)
    ? String(Number(item.date.split("-")[2]))
    : item.date.match(/\d{1,2}/)?.[0] ?? item.date;

  return (
    <Pressable
      style={[
        styles.dayCard,
        { backgroundColor: colors.card, borderColor: colors.inputBorder },
        item.isToday && styles.dayCardToday,
        isPressed && styles.dayCardPressed,
        isPressed && darkMode && { backgroundColor: "#17243a" }
      ]}
      onPress={handlePress}
    >
      <View style={[styles.dayDateBadge, item.isToday && styles.dayDateBadgeToday]}>
        <Text style={[styles.dayText, item.isToday && styles.dayTextToday]}>{item.day}</Text>
        <Text style={[styles.dayDateNumber, item.isToday && styles.dayDateNumberToday]}>{numericDay}</Text>
      </View>
      <View style={styles.dayContent}>
        <View style={styles.daySubjectRow}>
          <View style={[styles.dayIconContainer, { backgroundColor: item.iconColor + "18" }]}>
            <item.icon size={16} color={item.iconColor} />
          </View>
          <Text style={[styles.daySubject, { color: colors.text }]} numberOfLines={2}>
            {item.subject}
          </Text>
        </View>
        <View style={styles.dayMetaRow}>
          <Text style={[styles.dayMetaText, { color: colors.subtitle }]}>
            {item.isToday ? "Hoy · " : ""}{item.completedBlocks} de {item.totalBlocks} temas
          </Text>
          <Text style={[styles.dayProgressText, { color: progressColor }]}>{item.progress}%</Text>
        </View>
        <View style={styles.dayProgressTrack}>
          <View style={[styles.dayProgressFill, { width: `${item.progress}%`, backgroundColor: progressColor }]} />
        </View>
      </View>
      <ChevronRight size={18} color={item.isLibre ? colors.inputBorder : colors.subtitle} />
    </Pressable>
  );
});

// ============================================
// MAIN DASHBOARD SCREEN - Optimized with memo
// ============================================
function DashboardScreenComponent() {
  const { colors, darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  const {
    data: studentProgressData,
    isLoading: isStudentProgressQueryLoading,
    isFetching: isStudentProgressFetching,
    isError: isStudentProgressError,
    refetch: refetchStudentProgress,
  } = useStudentProgressQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
  });
  const isStudentProgressLoading = isStudentProgressQueryLoading;
  const hasProgressRequestFailed = isStudentProgressError;
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      const fcmToken = await getFCMToken();
      await logoutMutation({ token_fcm: fcmToken || '' }).unwrap();
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('token_expiration');
      await AsyncStorage.removeItem('remember_me');
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still clear tokens and navigate even if API call fails
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('token_expiration');
      await AsyncStorage.removeItem('remember_me');
      router.replace('/login');
    }
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Transform API data to calendar format
  const calendarData = useMemo(() => {
    if (studentProgressData?.calendar) {
      return transformCalendarData(studentProgressData.calendar);
    }
    return [];
  }, [studentProgressData]);

  // Calculate study plan progress
  const studyProgress = useMemo(() => {
    if (calendarData.length === 0) {
      return {
        completed: 0,
        total: 0,
        percentage: 0
      };
    }

    const completed = calendarData.filter(item => item.progress === 100).length;
    const total = calendarData.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      percentage
    };
  }, [calendarData]);

  // Memoized navigation handler
  const handleDayPress = useCallback((date: string, isLibre: boolean) => {
    setPressedCard(date);
    if (!isLibre) {
      router.push({ pathname: "/calendar-detail", params: { day: date } });
      // Clear pressed state after navigation
      setTimeout(() => setPressedCard(null), 500);
    }
  }, [router]);

  // Memoize container styles
  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: colors.background }
  ], [colors.background]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView style={containerStyle} contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <DashboardHeader onLogout={handleLogout} />

        {/* CALENDARIO - Vertical List */}
        <View style={styles.calendarSection}>
          {/* Progress Header */}
          {isStudentProgressLoading ? (
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                Plan de Estudio
              </Text>
              <Text style={styles.progressSubtitle}>
                Cargando progreso...
              </Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: "0%",
                      backgroundColor: "#e2e8f0"
                    }
                  ]}
                />
              </View>
              <View style={styles.progressStats}>
                <Text style={styles.progressStat}>
                  -- completados
                </Text>
                <Text style={styles.progressStat}>
                  --%
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                Plan de Estudio
              </Text>
              <Text style={styles.progressSubtitle}>
                Tu progreso actual
              </Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${studyProgress.percentage}%`,
                      backgroundColor: studyProgress.percentage >= 70 ? "#22c55e" :
                        studyProgress.percentage >= 40 ? "#f59e0b" : "#ef4444"
                    }
                  ]}
                />
              </View>
              <View style={styles.progressStats}>
                <Text style={styles.progressStat}>
                  {studyProgress.completed} completados
                </Text>
                <Text style={styles.progressStat}>
                  {studyProgress.percentage}%
                </Text>
              </View>
            </View>
          )}

          <View style={styles.calendarHeader}>
            <View style={styles.calendarTitleRow}>
              <CalendarDays size={18} color={colors.text} />
              <Text style={[styles.calendarTitle, { color: colors.text }]}>
                Calendario de Estudio
              </Text>
            </View>
          </View>

          {isStudentProgressLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#0284c7" />
              <Text style={[styles.loadingText, { color: colors.subtitle }]}>Cargando calendario...</Text>
            </View>
          ) : hasProgressRequestFailed ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>¡Bienvenido a Drbank!</Text>
              <Text style={[styles.emptyText, { color: colors.subtitle }]}>Realiza tus simulacros para que cada lunes se arme un plan de estudio adaptado a ti.</Text>
              <Pressable
                onPress={() => router.push("/(dashboard)/simulacre")}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Ir a simulacros</Text>
              </Pressable>
            </View>
          ) : calendarData.length > 0 ? (
            <View style={styles.calendarList}>
              {calendarData.map((item, index) => (
                <DayCard
                  key={index}
                  item={item}
                  colors={colors}
                  darkMode={darkMode}
                  onPress={handleDayPress}
                  isPressed={pressedCard === item.date}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.subtitle }]}>
                No tienes un plan de estudios disponible
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Add display name for debugging
DashboardScreenComponent.displayName = "DashboardScreen";

export default memo(DashboardScreenComponent);
