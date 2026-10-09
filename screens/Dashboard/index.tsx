import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardHeader from "../../common/DashboardHeader";
import Modal from "../../common/Modal";
import { useTheme } from "../../common/ThemeContext";
import { getFCMToken } from "../../FirebaseConfig";
import { useLogoutMutation } from "../../services/auth/logout.rtkq";
import { styles } from "./styles";

import {
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  LucideIcon,
} from "lucide-react-native";
import { useLazySmartReviewBlocksQuery, useLazySmartReviewDueAllQuery } from "../../services/adaptiveReview/smart-review.rtkq";

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
  adaptiveReviews?: number;
  adaptiveThemes?: number;
  isPosttest?: boolean;
  posttestAvailable?: boolean;
  studyBlockId?: number;
}

function getLimaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

// ============================================
// MEMOIZED DAY CARD COMPONENT
// ============================================
interface DayCardProps {
  item: CalendarItem;
  colors: ReturnType<typeof useTheme>["colors"];
  darkMode: boolean;
  onPress: (item: CalendarItem) => void;
  isPressed: boolean;
}

const DayCard = memo<DayCardProps>(function DayCard({ item, colors, darkMode, onPress, isPressed }) {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [onPress, item]);

  const progressColor = item.progress >= 70 ? "#16a34a" : item.progress >= 40 ? "#f59e0b" : "#0284c7";
  const safeDate = typeof item.date === "string" ? item.date : "";
  const numericDay = /^\d{4}-\d{2}-\d{2}$/.test(safeDate)
    ? String(Number(item.date.split("-")[2]))
    : safeDate.match(/\d{1,2}/)?.[0] ?? "—";
  const isAdaptiveOnly = Boolean(item.adaptiveReviews && item.subject.startsWith("Repaso adaptativo"));
  const adaptiveLabel = `${item.adaptiveThemes ?? 0} ${item.adaptiveThemes === 1 ? "tema" : "temas"} · ${item.adaptiveReviews} ${item.adaptiveReviews === 1 ? "repaso" : "repasos"}`;

  return (
    <Pressable
      style={[
        styles.dayCard,
        { backgroundColor: colors.card, borderColor: colors.inputBorder },
        item.isPosttest && styles.dayCardPosttest,
        item.isPosttest && darkMode && { backgroundColor: "#0c2436", borderColor: "#075985" },
        item.isToday && styles.dayCardToday,
        item.isLibre && styles.dayCardDisabled,
        isPressed && styles.dayCardPressed,
        isPressed && darkMode && { backgroundColor: "#17243a" }
      ]}
      onPress={handlePress}
      disabled={item.isLibre || !safeDate}
    >
      <View style={[styles.dayDateBadge, item.isPosttest && styles.dayDateBadgePosttest, item.isPosttest && darkMode && { backgroundColor: "#082f49" }, item.isToday && styles.dayDateBadgeToday]}>
        <Text style={[styles.dayText, item.isPosttest && styles.dayTextPosttest, item.isToday && styles.dayTextToday]}>{item.day}</Text>
        <Text style={[styles.dayDateNumber, item.isPosttest && styles.dayDateNumberPosttest, item.isToday && styles.dayDateNumberToday]}>{numericDay}</Text>
      </View>
      <View style={styles.dayContent}>
        <View style={styles.daySubjectRow}>
          <View style={[styles.dayIconContainer, { backgroundColor: item.iconColor + "18" }]}>
            <item.icon size={16} color={item.iconColor} />
          </View>
          <Text style={[styles.daySubject, { color: colors.text }]} numberOfLines={2}>
            {item.subject}
          </Text>
          {item.isPosttest && <View style={[styles.calendarTypeBadge, item.posttestAvailable && styles.calendarTypeBadgeAvailable]}><Text style={[styles.calendarTypeBadgeText, item.posttestAvailable && styles.calendarTypeBadgeTextAvailable]}>{item.posttestAvailable ? "DISPONIBLE" : "PRÓXIMA"}</Text></View>}
        </View>
        <View style={styles.dayMetaRow}>
          <Text style={[styles.dayMetaText, { color: colors.subtitle }]}>
            {item.isLibre
              ? `${item.isToday ? "Hoy · " : ""}Sin actividades programadas`
              : item.isPosttest
                ? `${item.isToday ? "Hoy · " : ""}${item.posttestAvailable ? "Disponible para rendir" : "Programada para este día"}`
              : `${item.isToday ? "Hoy · " : ""}${isAdaptiveOnly
                ? adaptiveLabel
                : `${item.completedBlocks} de ${item.totalBlocks} temas${item.adaptiveReviews ? ` · ${adaptiveLabel}` : ""}`}`}
          </Text>
          {!item.isLibre && !isAdaptiveOnly && !item.isPosttest && (
            <Text style={[styles.dayProgressText, { color: progressColor }]}>{item.progress}%</Text>
          )}
        </View>
        {!item.isLibre && !isAdaptiveOnly && !item.isPosttest && (
          <View style={styles.dayProgressTrack}>
            <View style={[styles.dayProgressFill, { width: `${item.progress}%`, backgroundColor: progressColor }]} />
          </View>
        )}
      </View>
      {!item.isLibre && <ChevronRight size={18} color={colors.subtitle} />}
    </Pressable>
  );
});

// ============================================
// MAIN DASHBOARD SCREEN - Optimized with memo
// ============================================
function DashboardScreenComponent() {
  const { colors, darkMode } = useTheme();
  const router = useRouter();
  const isDashboardFocused = useIsFocused();
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const [dismissedSmartReviewNotices, setDismissedSmartReviewNotices] = useState<string[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [logoutMutation] = useLogoutMutation();
  const [loadSmartReviewBlocks, {
    data: smartReviewBlocksData,
    isLoading: isSmartReviewBlocksLoading,
    isFetching: isSmartReviewBlocksFetching,
    isError: isSmartReviewBlocksError,
  }] = useLazySmartReviewBlocksQuery();
  const [loadSmartReviewDue, {
    data: smartReviewDueData,
    isLoading: isSmartReviewDueLoading,
    isFetching: isSmartReviewDueFetching,
    isError: isSmartReviewDueError,
  }] = useLazySmartReviewDueAllQuery();
  const reviewableSmartReviewBlockIds = useMemo(() => (smartReviewBlocksData?.data?.blocks ?? [])
    .filter(block => Boolean(block.pretest_completed_at))
    .map(block => block.id_study_block)
    .sort((first, second) => first - second), [smartReviewBlocksData]);

  const refreshStudyCalendar = useCallback(async () => {
    if (!isDashboardFocused) return;
    setIsCalendarLoading(true);
    try {
      const blocksResponse = await loadSmartReviewBlocks(undefined, false).unwrap();
      const blockIds = (blocksResponse.data.blocks ?? [])
        .filter(block => Boolean(block.pretest_completed_at))
        .map(block => block.id_study_block)
        .sort((first, second) => first - second);
      if (blockIds.length > 0) {
        await loadSmartReviewDue(blockIds, false).unwrap();
      }
    } catch (error) {
      console.error("Error loading study calendar:", error);
    } finally {
      setIsCalendarLoading(false);
    }
  }, [isDashboardFocused, loadSmartReviewBlocks, loadSmartReviewDue]);

  useEffect(() => {
    void refreshStudyCalendar();
  }, [refreshStudyCalendar]);

  const isCalendarRefreshing = isCalendarLoading
    || isSmartReviewBlocksLoading
    || isSmartReviewBlocksFetching
    || Boolean(reviewableSmartReviewBlockIds.length > 0 && (isSmartReviewDueLoading || isSmartReviewDueFetching));
  const hasDueErrorForActiveBlock = Boolean(reviewableSmartReviewBlockIds.length > 0 && isSmartReviewDueError);
  const hasCalendarError = isSmartReviewBlocksError || hasDueErrorForActiveBlock;

  const smartReviewNotices = useMemo(() => {
    const blocks = smartReviewBlocksData?.data?.blocks ?? [];
    const notices: { type: "pretest" | "posttest" | "overdue" | "active"; block?: typeof blocks[number]; count?: number }[] = [];
    const pendingPretest = blocks.find(block => block.status === "active" && !block.pretest_completed_at);
    if (pendingPretest) notices.push({ type: "pretest", block: pendingPretest });
    const availablePosttest = blocks.find(block => block.status === "active" && block.posttest_available);
    if (availablePosttest) notices.push({ type: "posttest", block: availablePosttest });
    const dueData = smartReviewDueData?.data;
    if (dueData?.has_overdue_reviews) notices.push({ type: "overdue", count: dueData.overdue_reviews });
    if (dueData?.has_active_reviews) notices.push({ type: "active", count: dueData.active_reviews });
    return notices;
  }, [smartReviewBlocksData, smartReviewDueData]);
  const getNoticeKey = (notice: typeof smartReviewNotices[number]) => `${notice.type}-${notice.block?.id_study_block ?? "reviews"}-${notice.count ?? 0}`;
  const smartReviewNotice = smartReviewNotices.find(notice => !dismissedSmartReviewNotices.includes(getNoticeKey(notice)));
  const smartReviewNoticeKey = smartReviewNotice ? getNoticeKey(smartReviewNotice) : undefined;
  const showSmartReviewNotice = isDashboardFocused && Boolean(smartReviewNoticeKey);

  const handleSmartReviewNotice = () => {
    if (!smartReviewNotice || !smartReviewNoticeKey) return;
    if (smartReviewNotice.type === "pretest") {
      setDismissedSmartReviewNotices(current => [...current, smartReviewNoticeKey]);
      router.push({ pathname: "/adaptive-review", params: { studyBlockId: String(smartReviewNotice.block?.id_study_block ?? ""), resumePretest: "true" } });
      return;
    }
    setDismissedSmartReviewNotices(current => [...current, smartReviewNoticeKey]);
  };

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

  // Transform API data to calendar format
  const calendarData = useMemo(() => {
    const reviews = smartReviewDueData?.data?.reviews ?? [];
    const todayInLima = getLimaDateKey();
    const blockNumberById = new Map(
      [...(smartReviewBlocksData?.data?.blocks ?? [])]
        .sort((first, second) => first.id_study_block - second.id_study_block)
        .map((block, index) => [block.id_study_block, index + 1]),
    );
    const counts = reviews.reduce<Record<string, { date: string; studyBlockId: number; reviews: number; themes: Set<string> }>>((result, review) => {
      const key = `${review.scheduled_for}-${review.id_study_block}`;
      result[key] ??= { date: review.scheduled_for, studyBlockId: review.id_study_block, reviews: 0, themes: new Set<string>() };
      result[key].reviews += 1;
      result[key].themes.add(review.theme);
      return result;
    }, {});
    const reviewItems: CalendarItem[] = Object.values(counts).map(group => {
      const date = group.date;
      const parsed = new Date(`${date}T12:00:00`);
      const day = Number.isNaN(parsed.getTime()) ? "DÍA" : parsed.toLocaleDateString("es-PE", { weekday: "short" }).replace(".", "").toUpperCase();
      const blockNumber = blockNumberById.get(group.studyBlockId);
      return { day, date, subject: `Repaso adaptativo · Bloque ${blockNumber ?? group.studyBlockId}`, icon: ClipboardCheck, iconColor: "#0284c7", progress: 0, completedBlocks: 0, totalBlocks: 0, adaptiveReviews: group.reviews, adaptiveThemes: group.themes.size, isLibre: false, isToday: date === todayInLima, studyBlockId: group.studyBlockId };
    });
    const posttestItems: CalendarItem[] = (smartReviewBlocksData?.data?.blocks ?? [])
      // posttest_completed_at describes the latest completed post-test. A block
      // may still expose posttest_available_at for its following evaluation.
      .filter(block => Boolean(block.posttest_available_at))
      .map(block => {
        const date = String(block.posttest_available_at).slice(0, 10);
        const parsed = new Date(`${date}T12:00:00`);
        const day = Number.isNaN(parsed.getTime()) ? "DÍA" : parsed.toLocaleDateString("es-PE", { weekday: "short" }).replace(".", "").toUpperCase();
        const blockNumber = blockNumberById.get(block.id_study_block);
        return {
          day,
          date,
          subject: `Evaluación de progreso · Bloque ${blockNumber ?? block.id_study_block}`,
          icon: ClipboardCheck,
          iconColor: block.posttest_available ? "#16a34a" : "#0284c7",
          progress: 0,
          completedBlocks: 0,
          totalBlocks: 0,
          isLibre: false,
          isToday: date === todayInLima,
          isPosttest: true,
          posttestAvailable: block.posttest_available,
          studyBlockId: block.id_study_block,
        };
      });
    return [...reviewItems, ...posttestItems].sort((first, second) => first.date.localeCompare(second.date) || Number(first.isPosttest) - Number(second.isPosttest));
  }, [smartReviewBlocksData, smartReviewDueData]);

  const reviewOverview = useMemo(() => {
    const data = smartReviewDueData?.data;
    const total = data?.total ?? 0;
    const available = data?.active_reviews ?? 0;
    const overdue = data?.overdue_reviews ?? 0;
    const upcoming = data?.upcoming_reviews ?? 0;
    const availablePercentage = total > 0 ? (available / total) * 100 : 0;
    const overduePercentage = total > 0 ? (overdue / total) * 100 : 0;
    return { total, available, overdue, upcoming, availablePercentage, overduePercentage };
  }, [smartReviewDueData]);

  const calendarSections = useMemo(() => {
    const sections = new Map<string, { title: string; items: CalendarItem[] }>();
    calendarData.forEach(item => {
      const parsed = new Date(`${item.date}T12:00:00`);
      const key = /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date.slice(0, 7) : "sin-fecha";
      const title = Number.isNaN(parsed.getTime())
        ? "Próximas actividades"
        : parsed.toLocaleDateString("es-PE", { month: "long", year: "numeric" }).replace(/^./, letter => letter.toUpperCase());
      const section = sections.get(key) ?? { title, items: [] };
      section.items.push(item);
      sections.set(key, section);
    });
    return Array.from(sections.values());
  }, [calendarData]);

  // Memoized navigation handler
  const handleDayPress = useCallback((item: CalendarItem) => {
    setPressedCard(`${item.date}-${item.isPosttest ? "posttest" : "review"}`);
    if (!item.isLibre) {
      if (item.isPosttest) {
        router.push({ pathname: "/calendar-detail", params: { day: item.date, posttestBlockId: String(item.studyBlockId ?? "") } });
      } else {
        router.push({ pathname: "/calendar-detail", params: { day: item.date, studyBlockId: String(item.studyBlockId ?? "") } });
      }
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
          {isCalendarRefreshing ? (
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                Plan de Estudio
              </Text>
              <Text style={styles.progressSubtitle}>
                Cargando calendario adaptativo...
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
                  -- revisiones
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
                {reviewOverview.total} {reviewOverview.total === 1 ? "revisión programada" : "revisiones programadas"}
              </Text>
              <View style={styles.progressBarContainer}>
                {reviewOverview.availablePercentage > 0 && <View
                  style={[styles.progressBarSegment, {
                    width: `${reviewOverview.availablePercentage}%`,
                    backgroundColor: "#22c55e",
                  }]}
                />}
                {reviewOverview.overduePercentage > 0 && <View
                  style={[styles.progressBarSegment, {
                    width: `${reviewOverview.overduePercentage}%`,
                    backgroundColor: "#ef4444",
                  }]}
                />}
              </View>
              <View style={styles.progressStats}>
                <Text style={styles.progressStat}>
                  {reviewOverview.available} disponibles · {reviewOverview.overdue} vencidas
                </Text>
                <Text style={styles.progressStat}>
                  {reviewOverview.upcoming} próximas
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

          {isCalendarRefreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#0284c7" />
              <Text style={[styles.loadingText, { color: colors.subtitle }]}>Cargando calendario...</Text>
            </View>
          ) : hasCalendarError ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No pudimos cargar el calendario</Text>
              <Text style={[styles.emptyText, { color: colors.subtitle }]}>Intenta actualizar nuevamente el calendario.</Text>
              <Pressable onPress={() => void refreshStudyCalendar()} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : calendarData.length > 0 ? (
            <View style={styles.calendarList}>
              {calendarSections.map(section => (
                <View key={section.title} style={styles.calendarMonthSection}>
                  <View style={styles.calendarMonthHeader}>
                    <Text style={[styles.calendarMonthTitle, { color: colors.text }]}>{section.title}</Text>
                    <View style={[styles.calendarMonthLine, { backgroundColor: colors.inputBorder }]} />
                  </View>
                  <View style={styles.calendarMonthItems}>
                    {section.items.map((item, index) => (
                      <DayCard
                        key={`${item.date}-${item.isPosttest ? `posttest-${item.studyBlockId}` : `review-${index}`}`}
                        item={item}
                        colors={colors}
                        darkMode={darkMode}
                        onPress={handleDayPress}
                        isPressed={pressedCard === `${item.date}-${item.isPosttest ? "posttest" : "review"}`}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Activa tu plan personalizado</Text>
              <Text style={[styles.emptyText, { color: colors.subtitle }]}>
                Realiza un pretest en Repaso Adaptativo para que cuentes con un plan de repaso adaptado a tu avance.
              </Text>
              <Pressable onPress={() => router.push("/adaptive-review")} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Ir a Repaso Adaptativo</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
      <Modal
        visible={showSmartReviewNotice}
        onClose={handleSmartReviewNotice}
        title={smartReviewNotice?.type === "pretest" ? "Tienes una evaluación inicial pendiente" : smartReviewNotice?.type === "posttest" ? "Tienes un posttest disponible" : smartReviewNotice?.type === "overdue" ? "Tienes revisiones vencidas" : "Tienes un repaso activo"}
        icon={<ClipboardCheck size={48} color="#0284c7" />}
        footerText={smartReviewNotice?.type === "pretest" ? "Rendir" : "Entendido"}
      >
        <Text style={[styles.smartReviewModalText, { color: colors.subtitle }]}>
          {smartReviewNotice?.type === "pretest"
            ? "Tu bloque de Repaso Adaptativo está listo. Rinde la evaluación inicial para comenzar tu plan."
            : smartReviewNotice?.type === "posttest"
              ? "Cuentas con un posttest para rendir y conocer cuánto has mejorado en este ciclo."
              : smartReviewNotice?.type === "overdue"
                ? `Tienes ${smartReviewNotice.count ?? 0} ${smartReviewNotice.count === 1 ? "revisión vencida" : "revisiones vencidas"} en tu Repaso Adaptativo.`
                : `Cuentas con ${smartReviewNotice?.count ?? 0} ${smartReviewNotice?.count === 1 ? "repaso activo" : "repasos activos"} disponibles para continuar estudiando.`}
        </Text>
      </Modal>
    </SafeAreaView>
  );
}

// Add display name for debugging
DashboardScreenComponent.displayName = "DashboardScreen";

export default memo(DashboardScreenComponent);
