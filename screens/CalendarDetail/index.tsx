import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "../../common/Modal";
import ThemeToggle from "../../common/ThemeToggle";
import { useTheme } from "../../common/ThemeContext";
import { useLazyQuestionByThemeQuery } from "../../services/question/question.rtkq";
import { useStudentProgressQuery } from "../../services/studentProgress/student-progress.rtkq";
import { useLazySmartReviewDueQuestionsQuery, useSmartReviewBlocksQuery, useSmartReviewDueQuery } from "../../services/adaptiveReview/smart-review.rtkq";
import { styles } from "./styles";

import {
  ArrowLeft,
  Brain,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Heart,
  LayoutGrid,
  Lock,
  Pill,
  Play,
  TrendingUp
} from "lucide-react-native";

export default function CalendarDetailScreen() {

  const { colors, darkMode } = useTheme();
  const router = useRouter();
  const { day, posttestBlockId, studyBlockId } = useLocalSearchParams();
  const parsedStudyBlockId = Number(Array.isArray(studyBlockId) ? studyBlockId[0] : studyBlockId);
  const hasStudyBlockId = Number.isInteger(parsedStudyBlockId) && parsedStudyBlockId > 0;
  const { data: studentProgressData } = useStudentProgressQuery();
  const { data: smartReviewDueData, isLoading: smartReviewDueLoading, isFetching: smartReviewDueFetching, isError: smartReviewDueError, refetch: refetchSmartReviewDue } = useSmartReviewDueQuery(parsedStudyBlockId, { skip: !hasStudyBlockId, refetchOnMountOrArgChange: true });
  const { data: smartReviewBlocksData, isLoading: smartReviewBlocksLoading, refetch: refetchSmartReviewBlocks } = useSmartReviewBlocksQuery();
  const [fetchQuestionsByTheme] = useLazyQuestionByThemeQuery();
  const [fetchSmartReviewDueQuestions] = useLazySmartReviewDueQuestionsQuery();
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingModalTitle, setLoadingModalTitle] = useState("Generando el examen");
  const [openingReviewAssignmentId, setOpeningReviewAssignmentId] = useState<number | null>(null);
  const [isRetryingReviews, setIsRetryingReviews] = useState(false);
  const reviewRetryCountRef = useRef(0);

  useFocusEffect(useCallback(() => {
    void refetchSmartReviewBlocks();
  }, [refetchSmartReviewBlocks]));

  useEffect(() => {
    if (smartReviewDueData) {
      reviewRetryCountRef.current = 0;
      setIsRetryingReviews(false);
      return;
    }
    if (!smartReviewDueError || smartReviewDueFetching || reviewRetryCountRef.current >= 2) return;

    reviewRetryCountRef.current += 1;
    setIsRetryingReviews(true);
    const retryTimer = setTimeout(() => {
      void refetchSmartReviewDue().finally(() => setIsRetryingReviews(false));
    }, 800);
    return () => clearTimeout(retryTimer);
  }, [refetchSmartReviewDue, smartReviewDueData, smartReviewDueError, smartReviewDueFetching]);

  // Get current date
  const currentDate = new Date();
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Find the selected day data from API
  const selectedDayData = useMemo(() => {
    if (!studentProgressData?.calendar || !day) return null;
    return studentProgressData.calendar.find((d: any) => d.date === day);
  }, [studentProgressData, day]);
  const selectedDate = typeof day === "string" ? day : "";
  const selectedReviews = useMemo(() => (smartReviewDueData?.data?.reviews ?? []).filter(review => review.scheduled_for === selectedDate), [selectedDate, smartReviewDueData]);
  const reviewsByTheme = useMemo(() => {
    const groups = new Map<string, typeof selectedReviews>();
    selectedReviews.forEach(review => {
      const current = groups.get(review.theme) ?? [];
      current.push(review);
      groups.set(review.theme, current);
    });
    return Array.from(groups, ([theme, reviews]) => ({ theme, reviews }));
  }, [selectedReviews]);
  const selectedPosttestBlock = useMemo(() => {
    if (!posttestBlockId) return null;
    return (smartReviewBlocksData?.data?.blocks ?? []).find(block => String(block.id_study_block) === String(posttestBlockId)) ?? null;
  }, [posttestBlockId, smartReviewBlocksData]);
  const posttestThemes = selectedPosttestBlock?.themes ?? [];
  const parsedSelectedDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)
    ? new Date(`${selectedDate}T12:00:00`)
    : null;
  const hasValidSelectedDate = Boolean(parsedSelectedDate && !Number.isNaN(parsedSelectedDate.getTime()));
  const displayDate = hasValidSelectedDate ? parsedSelectedDate! : currentDate;
  const selectedDayNumber = displayDate.getDate();
  const dayOfWeek = selectedDayData?.day_name ?? dayNames[displayDate.getDay()];
  const currentMonth = monthNames[displayDate.getMonth()];
  const currentYear = displayDate.getFullYear();

  // Helper function to get icon based on topic
  const getIconForTopic = (topic: string) => {
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes("cardio") || lowerTopic.includes("corazón")) return Heart;
    if (lowerTopic.includes("pediatría") || lowerTopic.includes("niño")) return Brain;
    if (lowerTopic.includes("farma") || lowerTopic.includes("medicamento")) return Pill;
    if (lowerTopic.includes("neuro") || lowerTopic.includes("cerebro")) return Brain;
    if (lowerTopic.includes("cirugía") || lowerTopic.includes("operación")) return LayoutGrid;
    if (lowerTopic.includes("repaso")) return TrendingUp;
    return FileText;
  };

  // Helper function to get color based on topic
  const getColorForTopic = (topic: string) => {
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes("cardio") || lowerTopic.includes("corazón")) return "#ef4444";
    if (lowerTopic.includes("pediatría") || lowerTopic.includes("niño")) return "#8b5cf6";
    if (lowerTopic.includes("farma") || lowerTopic.includes("medicamento")) return "#f97316";
    if (lowerTopic.includes("neuro") || lowerTopic.includes("cerebro")) return "#06b6d4";
    if (lowerTopic.includes("cirugía") || lowerTopic.includes("operación")) return "#ec4899";
    if (lowerTopic.includes("repaso")) return "#22c55e";
    return "#64748b";
  };

  // Build specialty data from API or fallback
  const specialty = useMemo(() => {
    if (selectedDayData) {
      const firstTopic = selectedDayData.topics?.[0]?.theme || "General";
      // Count completed topics (status === "completed")
      const completedCount = selectedDayData.topics?.filter((topic: any) => topic.status === "completed").length || 0;
      return {
        name: firstTopic,
        area: selectedDayData.topics?.[0]?.source || "Medicina",
        icon: getIconForTopic(firstTopic),
        iconColor: getColorForTopic(firstTopic),
        progress: selectedDayData.percentage || 0,
        completedBlocks: completedCount,
        totalBlocks: selectedDayData.total_topics || 0
      };
    }

    if (selectedReviews.length > 0) {
      return { name: "Repaso adaptativo", area: "Revisión programada", icon: Brain, iconColor: "#0284c7", progress: 0, completedBlocks: 0, totalBlocks: 0 };
    }

    // Legacy fallback for dates that are not returned by either API.
    const specialtyData: { [key: number]: any } = {
      16: { name: "Cardiología", area: "Medicina Interna", icon: Heart, iconColor: "#ef4444", progress: 0, completedBlocks: 0, totalBlocks: 5 },
      17: { name: "Pediatría", area: "Medicina Especializada", icon: Brain, iconColor: "#8b5cf6", progress: 60, completedBlocks: 3, totalBlocks: 5 },
      18: { name: "Farmacología", area: "Ciencias Básicas", icon: Pill, iconColor: "#f97316", progress: 40, completedBlocks: 2, totalBlocks: 5 },
      19: { name: "Neurología", area: "Medicina Interna", icon: Brain, iconColor: "#06b6d4", progress: 80, completedBlocks: 4, totalBlocks: 5 },
      20: { name: "Cirugía", area: "Cirugía General", icon: LayoutGrid, iconColor: "#ec4899", progress: 100, completedBlocks: 5, totalBlocks: 5 },
      21: { name: "Repaso", area: "Integración", icon: TrendingUp, iconColor: "#22c55e", progress: 20, completedBlocks: 1, totalBlocks: 5 },
      22: { name: "Libre", area: "Descanso", icon: CalendarDays, iconColor: "#64748b", progress: 0, completedBlocks: 0, totalBlocks: 0 },
    };

    return specialtyData[selectedDayNumber] || { name: "General", area: "Medicina", icon: Heart, iconColor: "#64748b", progress: 0, completedBlocks: 0, totalBlocks: 5 };
  }, [selectedDayData, selectedDayNumber, selectedReviews.length]);

  // Daily schedule with study and simulacro blocks from API
  const schedule = useMemo(() => {
    if (selectedDayData?.topics && selectedDayData.topics.length > 0) {
      // Count completed topics (status === "completed")
      const completedCount = selectedDayData.topics?.filter((topic: any) => topic.status === "completed").length || 0;

      return selectedDayData.topics.map((topic: any, index: number) => ({
          id: `module-${topic.theme_uuid}`,
          type: "module",
          title: `Módulo ${index + 1}`,
          topic: topic.theme,
          area: topic.source || "General",
          videoUrl: topic.video_url || "",
          topicIndex: index,
          isCompleted: topic.status === "completed",
          isLocked: index > completedCount,
      }));
    }

    if (selectedReviews.length > 0) return [];

    // Legacy fallback schedule
    return [
      {
        id: 1,
        type: "study",
        title: "Bloque 1: Estudio",
        topic: "Insuficiencia Cardíaca",
        area: "Semiología Cardiovascular",
        duration: "20 min",
        isWeakness: true,
        isCompleted: false,
        isLocked: false,
        studyTime: 0
      },
      {
        id: 2,
        type: "simulacro",
        title: "Bloque 2: Simulacro",
        topic: "Evaluación Cardiovascular",
        area: "Diagnóstico",
        duration: "15 min",
        isWeakness: false,
        isCompleted: false,
        isLocked: true
      },
      {
        id: 3,
        type: "study",
        title: "Bloque 3: Estudio",
        topic: "Arritmias Cardíacas",
        area: "Electrocardiografía",
        duration: "20 min",
        isWeakness: false,
        isCompleted: false,
        isLocked: true
      },
      {
        id: 4,
        type: "simulacro",
        title: "Bloque 4: Simulacro",
        topic: "Casos de Arritmias",
        area: "Diagnóstico",
        duration: "15 min",
        isWeakness: false,
        isCompleted: false,
        isLocked: true
      },
      {
        id: 5,
        type: "simulacro",
        title: "Bloque 5: Simulacro Final",
        topic: "Evaluación Integral",
        area: "Repaso General",
        duration: "30 min",
        isWeakness: false,
        isCompleted: false,
        isLocked: true
      }
    ];
  }, [selectedDayData, selectedReviews.length]);

  // Use progress from specialty data (matches Dashboard)
  const progressPercentage = specialty.progress;
  const completedBlocks = specialty.completedBlocks;
  const totalBlocks = specialty.totalBlocks;

  // Determine if a block is locked based on completed blocks
  const isBlockLocked = (blockIndex: number) => blockIndex > completedBlocks;

  // Update schedule with dynamic lock status based on completedBlocks
  const updatedSchedule = schedule.map((block: any) => ({
    ...block,
    isLocked: isBlockLocked(block.topicIndex ?? 0)
  }));

  const getBlockIcon = (type: string) => {
    switch(type) {
      case "module": return FileText;
      case "simulacro": return TrendingUp;
      default: return FileText;
    }
  };

  const getBlockIconColor = (type: string, isLocked: boolean) => {
    if (isLocked) return "#94a3b8";
    switch(type) {
      case "module": return "#0891b2";
      case "simulacro": return "#6366f1";
      default: return "#0284c7";
    }
  };

  const handleBlockPress = useCallback(async (block: any, index: number) => {
    if (block.isLocked) {
      // Show message that previous block needs to be completed
      return;
    }
    
    if (block.type === "module") {
      if (block.videoUrl) {
        const topicData = selectedDayData?.topics?.[block.topicIndex];
        router.push({
          pathname: "/study-module",
          params: {
            title: block.topic,
            area: block.area,
            // This is only an in-memory navigation value. StudyModule refreshes it
            // from the API before playback when possible.
            videoUrl: block.videoUrl,
            themeUuid: topicData?.theme_uuid,
          },
        });
        return;
      }
      // Without a video, continue directly to the topic practice below.
    }

    // Get the theme_uuid from the selected day data
    const topicData = selectedDayData?.topics?.[block.topicIndex];
    const themeUuid = topicData?.theme_uuid;
    
    if (!themeUuid) {
      console.error("No theme_uuid found for this block");
      return;
    }
    
    setLoadingModalTitle("Generando el examen");
    setShowLoadingModal(true);
    
    try {
      // Call questionByTheme API
      const result = await fetchQuestionsByTheme({ id: themeUuid }).unwrap();
      
      setShowLoadingModal(false);
      
      // Navigate to Questions screen with the fetched questions
      router.push({
        pathname: "/questions",
        params: {
          questions: JSON.stringify(result),
          examType: "Estudio por Tema",
          theme: block.topic,
          area: block.area,
          themeUuid: themeUuid,
          sourceKey: "by_topic",
          examMode: "Resultados al final",
          questionCount: result.length.toString(),
          timeLimit: "60",
          fromCalendar: "true",
        },
      });
    } catch (error) {
      console.error("Error fetching questions by theme:", error);
      setShowLoadingModal(false);
    }
  }, [selectedDayData, fetchQuestionsByTheme, router]);

  const openReviewExam = useCallback(async (review: (typeof selectedReviews)[number]) => {
    if (review.id_smart_review_assignment === null || !review.id_student_theme_review || !review.questions_available || showLoadingModal) return;
    setOpeningReviewAssignmentId(review.id_smart_review_assignment);
    setLoadingModalTitle("Preparando examen de repaso");
    setShowLoadingModal(true);
    const orderedBlocks = [...(smartReviewBlocksData?.data?.blocks ?? [])]
      .sort((first, second) => first.id_study_block - second.id_study_block);
    const reviewBlock = orderedBlocks.find(block => block.id_study_block === review.id_study_block)
      ?? orderedBlocks.find(block => block.themes.some(item => item.theme === review.theme));
    const reviewPlanNumber = reviewBlock
      ? orderedBlocks.findIndex(block => block.id_study_block === reviewBlock.id_study_block) + 1
      : undefined;
    try {
      const questionsResponse = await fetchSmartReviewDueQuestions({
        id_smart_review_assignment: review.id_smart_review_assignment,
        id_student_theme_review: review.id_student_theme_review,
      }).unwrap();
      router.push({
        pathname: "/adaptive-review",
        params: {
          reviewAssignmentId: String(review.id_smart_review_assignment),
          reviewQuestions: JSON.stringify(questionsResponse.data.questions),
          reviewTheme: review.theme,
          studyBlockId: reviewBlock ? String(reviewBlock.id_study_block) : undefined,
          reviewPlanNumber: reviewPlanNumber ? String(reviewPlanNumber) : undefined,
        },
      });
    } catch (error) {
      console.error("Error fetching smart review questions:", error);
    } finally {
      setShowLoadingModal(false);
      setOpeningReviewAssignmentId(null);
    }
  }, [fetchSmartReviewDueQuestions, router, showLoadingModal, smartReviewBlocksData]);

  const isLibreDay = specialty.name === "Libre"
    || Boolean(selectedDayData && selectedDayData.total_topics === 0);
  const reviewsPending = hasStudyBlockId && (smartReviewDueLoading || smartReviewDueFetching || isRetryingReviews);
  const hasNoActivities = isLibreDay && selectedReviews.length === 0 && !reviewsPending;

  if (posttestBlockId) {
    const posttestReady = Boolean(selectedPosttestBlock?.posttest_available);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}><ArrowLeft size={24} color={colors.text} /></Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Evaluación de progreso</Text>
          <ThemeToggle />
        </View>
        <ScrollView style={styles.container} contentContainerStyle={styles.posttestPreviewContent} showsVerticalScrollIndicator={false}>
          <View style={styles.posttestHero}>
            <View style={styles.posttestHeroIcon}><TrendingUp size={25} color="#0284c7" /></View>
            <View style={{ flex: 1 }}><Text style={styles.posttestEyebrow}>{posttestReady ? "YA PUEDES RENDIRLA" : "PRÓXIMA EVALUACIÓN"}</Text><Text style={styles.posttestTitle}>Mide cuánto has mejorado</Text><Text style={styles.posttestDescription}>La evaluación incluirá preguntas de los temas trabajados durante tu repaso.</Text></View>
          </View>
          {smartReviewBlocksLoading ? (
            <View style={[styles.adaptiveState, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}><ActivityIndicator color="#0284c7" /><Text style={[styles.adaptiveStateText, { color: colors.subtitle }]}>Cargando contenido de la evaluación...</Text></View>
          ) : (
            <View style={styles.posttestThemesSection}>
              <View style={styles.posttestSectionHeading}><View><Text style={[styles.sectionTitle, { color: colors.text }]}>Temas de la evaluación</Text><Text style={[styles.adaptiveSectionSubtitle, { color: colors.subtitle }]}>Contenido incluido en esta evaluación</Text></View><Text style={styles.posttestThemeCount}>{posttestThemes.length}</Text></View>
              {posttestThemes.map((theme, themeIndex) => <View key={theme.uuid} style={[styles.posttestThemeCard, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}><View style={styles.posttestThemeHeader}><View style={styles.posttestThemeNumber}><Text style={styles.posttestThemeNumberText}>{themeIndex + 1}</Text></View><View style={{ flex: 1 }}><Text style={[styles.posttestThemeName, { color: colors.text }]}>{theme.theme}</Text><Text style={[styles.posttestThemeMeta, { color: colors.subtitle }]}>Tema de estudio</Text></View><CheckCircle size={19} color="#16a34a" /></View></View>)}
            </View>
          )}
        </ScrollView>
        <View style={[styles.posttestFooter, { backgroundColor: colors.background, borderTopColor: colors.inputBorder }]}>
          {!posttestReady && <Text style={[styles.posttestAvailability, { color: colors.subtitle }]}>Disponible el {selectedPosttestBlock?.posttest_available_at ? new Date(selectedPosttestBlock.posttest_available_at.replace(" ", "T")).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" }) : "día programado"}</Text>}
          <Pressable disabled={!posttestReady} onPress={() => router.push({ pathname: "/adaptive-review", params: { studyBlockId: String(selectedPosttestBlock?.id_study_block ?? ""), startPosttest: "true" } })} style={[styles.posttestStartButton, !posttestReady && styles.posttestStartButtonDisabled]}><Text style={styles.posttestStartButtonText}>Iniciar evaluación</Text><ChevronRight size={19} color="#ffffff" /></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (hasNoActivities) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Día Libre</Text>
          <ThemeToggle />
        </View>
        <View style={styles.libreContainer}>
          <Text style={[styles.libreText, { color: colors.text }]}>¡Disfruta tu día de descanso!</Text>
          <Text style={[styles.libreSubtext, { color: colors.subtitle }]}>No hay actividades programadas para hoy.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Detalle de Estudio
        </Text>
        <ThemeToggle />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {dayOfWeek} {selectedDayNumber} de {currentMonth} {currentYear}
          </Text>
        </View>


        {/* Progress Section */}
        {selectedDayData && <View style={styles.progressSection}>
          <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
            <View style={styles.progressCardHeader}>
              <View>
                <Text style={styles.progressCardEyebrow}>PROGRESO DEL DÍA</Text>
                <Text style={[styles.progressCardTitle, { color: colors.text }]}>{completedBlocks} de {totalBlocks} temas completados</Text>
              </View>
              <View style={[styles.progressPercentBadge, { backgroundColor: darkMode ? "#0c4a6e" : "#e0f2fe" }]}><Text style={[styles.progressPercentText, darkMode && { color: "#7dd3fc" }]}>{progressPercentage}%</Text></View>
            </View>
            <View style={[styles.linearProgressTrack, { backgroundColor: darkMode ? "#1e293b" : "#e2e8f0" }]}>
              <View style={[styles.linearProgressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <View style={styles.progressStats}>
              <View style={styles.statItem}><CheckCircle size={16} color="#16a34a" /><Text style={[styles.statText, { color: colors.subtitle }]}>{completedBlocks} desarrollados</Text></View>
              <View style={styles.statItem}><Clock size={16} color={colors.subtitle} /><Text style={[styles.statText, { color: colors.subtitle }]}>{totalBlocks - completedBlocks} restantes</Text></View>
            </View>
          </View>
        </View>}


        {/* Schedule Section */}
        <View style={styles.scheduleSection}>
          <View style={styles.adaptiveSectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 3 }]}>Repasos programados</Text>
              <Text style={[styles.adaptiveSectionSubtitle, { color: colors.subtitle }]}>Selecciona un tema para iniciar su repaso</Text>
            </View>
            {reviewsByTheme.length > 0 && <View style={styles.adaptiveCount}><Text style={styles.adaptiveCountText}>{reviewsByTheme.length}</Text></View>}
          </View>
          {reviewsPending ? (
            <View style={styles.calendarLoading}><ActivityIndicator color="#0284c7" /><Text style={[styles.calendarLoadingText, { color: colors.subtitle }]}>Cargando repaso...</Text></View>
          ) : smartReviewDueError ? (
            <View style={[styles.adaptiveState, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}><Text style={[styles.adaptiveStateText, { color: colors.subtitle }]}>No pudimos cargar tus revisiones.</Text><Pressable onPress={() => refetchSmartReviewDue()} style={styles.adaptiveRetry}><Text style={styles.adaptiveRetryText}>Reintentar</Text></Pressable></View>
          ) : reviewsByTheme.length === 0 ? (
            <View style={[styles.adaptiveState, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}><CheckCircle size={20} color="#16a34a" /><Text style={[styles.adaptiveStateText, { color: colors.subtitle }]}>No tienes revisiones adaptativas para este día.</Text></View>
          ) : reviewsByTheme.map(group => {
            const hasOverdue = group.reviews.some(item => item.review_status === "overdue");
            const hasActive = group.reviews.some(item => item.review_status === "active");
            const accent = hasOverdue ? "#ef4444" : hasActive ? "#16a34a" : "#0284c7";
            const statusLabel = hasOverdue ? "Vencido" : hasActive ? "Disponible" : "Próximo";
            const review = [...group.reviews].sort((first, second) => {
              const priority = (status: string) => status === "overdue" ? 0 : status === "active" ? 1 : 2;
              return priority(first.review_status) - priority(second.review_status);
            })[0];
            const canStartReview = Boolean(review?.questions_available
              && review.id_smart_review_assignment !== null
              && review.id_student_theme_review);
            return (
              <View key={group.theme} style={[styles.adaptiveThemeGroup, { backgroundColor: colors.card, borderColor: `${accent}66` }]}>
                <Pressable disabled={!canStartReview || openingReviewAssignmentId !== null} style={({ pressed }) => [styles.adaptiveThemeHeader, pressed && canStartReview && styles.adaptiveObjectiveOptionPressed]} onPress={() => openReviewExam(review)}>
                  <View style={[styles.adaptiveIcon, { backgroundColor: `${accent}18` }]}><Brain size={19} color={accent} /></View>
                  <View style={styles.adaptiveThemeContent}>
                    <Text style={[styles.adaptiveTheme, { color: colors.text }]}>{group.theme}</Text>
                    <Text style={[styles.adaptiveThemeSummary, { color: colors.subtitle }]}>{canStartReview ? "Toca para cargar las preguntas" : "Disponible próximamente"}</Text>
                  </View>
                  <View style={[styles.adaptiveStatus, { backgroundColor: `${accent}18` }]}><Text style={[styles.adaptiveStatusText, { color: accent }]}>{statusLabel}</Text></View>
                  {canStartReview && <ChevronRight size={18} color={accent} />}
                </Pressable>
              </View>
            );
          })}
        </View>

        {updatedSchedule.length > 0 && <View style={styles.scheduleSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Cronograma de Práctica
          </Text>

          {updatedSchedule.map((block: any, index: number) => {
            const BlockIcon = getBlockIcon(block.type);
            const isUnavailable = block.isLocked;
            const cardBackground = darkMode
              ? (block.isCompleted ? "#062e24" : block.isLocked ? "#0b1220" : "#0f2033")
              : (block.isCompleted ? "#f0fdf4" : block.isLocked ? "#f8fafc" : "#ffffff");
            const cardBorder = darkMode
              ? (block.isCompleted ? "#166534" : block.isLocked ? "#1e293b" : "#075985")
              : (block.isCompleted ? "#bbf7d0" : block.isLocked ? "#e2e8f0" : "#bae6fd");
            return (
              <TouchableOpacity
                key={block.id}
                style={[
                  styles.blockCard,
                  { backgroundColor: cardBackground, borderColor: cardBorder },
                  !isUnavailable && styles.blockCardActive,
                ]}
                onPress={() => handleBlockPress(block, index)}
                disabled={isUnavailable}
                activeOpacity={0.72}
                accessibilityRole="button"
              >
                <View style={[styles.blockNumber, !block.isLocked && styles.blockNumberActive, block.isCompleted && styles.blockNumberCompleted, {
                  backgroundColor: block.isCompleted
                    ? (darkMode ? "#14532d" : "#dcfce7")
                    : block.isLocked
                      ? (darkMode ? "#1e293b" : "#e2e8f0")
                      : (darkMode ? "#0c4a6e" : "#e0f2fe"),
                }]}>
                  {block.isLocked ? (
                    <Lock size={16} color="#94a3b8" />
                  ) : block.isCompleted ? (
                    <CheckCircle size={16} color="#22c55e" />
                  ) : (
                    <Text style={[styles.blockNumberText, darkMode && { color: "#7dd3fc" }]}>{index + 1}</Text>
                  )}
                </View>

                <View style={styles.blockContent}>
                  <View style={styles.blockHeader}>
                    <BlockIcon size={16} color={getBlockIconColor(block.type, block.isLocked)} />
                    <Text style={[styles.blockTitle, { color: colors.subtitle }]}>
                      {block.title}
                    </Text>
                  </View>
                  
                  <Text style={[styles.blockTopic, { color: block.isLocked ? colors.subtitle : colors.text }]}>
                    {block.topic}
                  </Text>

                  {block.type === "module" && (
                    <Text style={[styles.blockArea, { color: colors.subtitle }]}>
                      {block.videoUrl ? "Video de contenido  →  Práctica" : "Simulacro disponible"}
                    </Text>
                  )}

                  {!block.isLocked && block.type === "simulacro" && (
                    <View style={styles.studyInfo}>
                      <Play size={14} color="#6366f1" />
                      <Text style={styles.studyDuration}>
                        {block.duration} de duración
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.blockAction}>
                  {block.isCompleted ? (
                    <CheckCircle size={24} color="#22c55e" />
                  ) : isUnavailable ? null : (
                    <ChevronRight size={24} color="#0284c7" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

        </View>}


        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />

      </ScrollView>

      {/* Loading Modal */}
      {/* Loading Modal */}
      <Modal
        visible={showLoadingModal}
        onClose={() => {}}
        title={loadingModalTitle}
        logoSource={require("../../assets/logo_app.png")}
        showFooter={false}
      >
        <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 16 }} />
      </Modal>

    </SafeAreaView>
  );
}
