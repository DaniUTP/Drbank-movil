import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  Moon,
  Pill,
  Play,
  Sun,
  TrendingUp
} from "lucide-react-native";

export default function CalendarDetailScreen() {

  const { colors, darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  const { day } = useLocalSearchParams();
  const { data: studentProgressData } = useStudentProgressQuery();
  const [fetchQuestionsByTheme] = useLazyQuestionByThemeQuery();
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  // Get current date
  const currentDate = new Date();
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Find the selected day data from API
  const selectedDayData = useMemo(() => {
    if (!studentProgressData?.calendar || !day) return null;
    return studentProgressData.calendar.find((d: any) => d.date === day);
  }, [studentProgressData, day]);

  // Fallback to demo data if API data not available
  const selectedDayNumber = day ? parseInt(day as string) : 15;
  const dayOfWeek = selectedDayData ? selectedDayData.day_name : dayNames[((selectedDayNumber - 16 + 1) % 7)];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

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

    // Fallback data
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
  }, [selectedDayData, selectedDayNumber]);

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

    // Fallback schedule
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
  }, [selectedDayData]);

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
      if (!block.videoUrl) {
        Alert.alert("Video no disponible", "El contenido todavía no tiene una URL de video disponible.");
        return;
      }
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

    // Get the theme_uuid from the selected day data
    const topicData = selectedDayData?.topics?.[block.topicIndex];
    const themeUuid = topicData?.theme_uuid;
    
    if (!themeUuid) {
      console.error("No theme_uuid found for this block");
      return;
    }
    
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

  const isLibreDay = specialty.name === "Libre"
    || Boolean(selectedDayData && selectedDayData.total_topics === 0);

  if (isLibreDay) {
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
        <View style={styles.progressSection}>
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
        </View>


        {/* Schedule Section */}
        <View style={styles.scheduleSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Cronograma de Práctica
          </Text>

          {updatedSchedule.map((block: any, index: number) => {
            const BlockIcon = getBlockIcon(block.type);
            const isUnavailable = block.isLocked || (block.type === "module" && !block.videoUrl);
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
                      Video de contenido  →  Práctica
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

        </View>


        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />

      </ScrollView>

      {/* Loading Modal */}
      {/* Loading Modal */}
      <Modal
        visible={showLoadingModal}
        onClose={() => {}}
        title="Generando el examen"
        logoSource={require("../../assets/logo_app.png")}
        showFooter={false}
      >
        <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 16 }} />
      </Modal>

    </SafeAreaView>
  );
}
