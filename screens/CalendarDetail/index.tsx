import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularProgress from "../../common/CircularProgress";
import Modal from "../../common/Modal";
import { useTheme } from "../../common/ThemeContext";
import { useLazyQuestionByThemeQuery } from "../../services/question/question.rtkq";
import { useStudentProgressQuery } from "../../services/studentProgress/student-progress.rtkq";
import { styles } from "./styles";

import {
  ArrowLeft,
  Brain,
  CalendarDays,
  CheckCircle,
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
  const { data: studentProgressData, isLoading: isLoadingProgress } = useStudentProgressQuery();
  const [fetchQuestionsByTheme, { isLoading: isLoadingQuestions }] = useLazyQuestionByThemeQuery();
  const [isLoadingBlock, setIsLoadingBlock] = useState<string | null>(null);
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
      return {
        name: firstTopic,
        area: selectedDayData.topics?.[0]?.source || "Medicina",
        icon: getIconForTopic(firstTopic),
        iconColor: getColorForTopic(firstTopic),
        progress: selectedDayData.percentage || 0,
        completedBlocks: selectedDayData.completed_topics || 0,
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

  // Redirect if it's a Libre day
  if (specialty.name === "Libre" || (selectedDayData && selectedDayData.total_topics === 0)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Día Libre</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.libreContainer}>
          <Text style={[styles.libreText, { color: colors.text }]}>¡Disfruta tu día de descanso!</Text>
          <Text style={[styles.libreSubtext, { color: colors.subtitle }]}>No hay actividades programadas para hoy.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Daily schedule with study and simulacro blocks from API
  const schedule = useMemo(() => {
    if (selectedDayData?.topics && selectedDayData.topics.length > 0) {
      return selectedDayData.topics.map((topic: any, index: number) => ({
        id: index + 1,
        type: topic.type === "simulacro" ? "simulacro" : "study",
        title: topic.type === "simulacro" ? `Bloque ${index + 1}: Simulacro` : `Bloque ${index + 1}: Estudio`,
        topic: topic.theme,
        area: topic.source || "General",
        duration: "20 min", // Default duration
        isWeakness: topic.is_overdue || false,
        isCompleted: topic.status === "completed",
        isLocked: index > (selectedDayData.completed_topics || 0),
        studyTime: 0
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
  const updatedSchedule = schedule.map((block: any, index: number) => ({
    ...block,
    isLocked: isBlockLocked(index)
  }));

  const getBlockColor = (type: string, isLocked: boolean) => {
    if (isLocked) return "#f1f5f9";
    switch(type) {
      case "study": return "#fef9c3";
      case "simulacro": return "#e0e7ff";
      default: return "#f0f9ff";
    }
  };

  const getBlockIcon = (type: string) => {
    switch(type) {
      case "study": return FileText;
      case "simulacro": return TrendingUp;
      default: return FileText;
    }
  };

  const getBlockIconColor = (type: string, isLocked: boolean) => {
    if (isLocked) return "#94a3b8";
    switch(type) {
      case "study": return "#ca8a04";
      case "simulacro": return "#6366f1";
      default: return "#0284c7";
    }
  };

  const handleBlockPress = useCallback(async (block: any, index: number) => {
    if (block.isLocked) {
      // Show message that previous block needs to be completed
      return;
    }
    
    // Get the theme_uuid from the selected day data
    const topicData = selectedDayData?.topics?.[index];
    const themeUuid = topicData?.theme_uuid;
    
    if (!themeUuid) {
      console.error("No theme_uuid found for this block");
      return;
    }
    
    setIsLoadingBlock(block.id.toString());
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
          timeLimit: "30",
          fromCalendar: "true",
        },
      });
    } catch (error) {
      console.error("Error fetching questions by theme:", error);
      setShowLoadingModal(false);
    } finally {
      setIsLoadingBlock(null);
    }
  }, [selectedDayData, fetchQuestionsByTheme, router]);

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
        <Pressable onPress={toggleDarkMode} style={styles.notification}>
          {darkMode ? (
            <Sun size={22} color={colors.text} />
          ) : (
            <Moon size={22} color={colors.text} />
          )}
        </Pressable>
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


        {/* Circular Progress Section */}
        <View style={styles.progressSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Progreso del Día
          </Text>
          
          <View style={styles.circularProgressContainer}>
            <CircularProgress 
              percentage={progressPercentage} 
              size={140}
              strokeWidth={14}
              color={progressPercentage >= 70 ? "#22c55e" : progressPercentage >= 40 ? "#f59e0b" : "#ef4444"}
              backgroundColor="#e2e8f0"
            />
          </View>

          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <CheckCircle size={18} color="#22c55e" />
              <Text style={styles.statText}>{completedBlocks} desarrollados</Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={18} color="#64748b" />
              <Text style={styles.statText}>{totalBlocks - completedBlocks} restantes</Text>
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
            return (
              <Pressable 
                key={block.id}
                style={[
                  styles.blockCard,
                  { backgroundColor: getBlockColor(block.type, block.isLocked) }
                ]}
                onPress={() => handleBlockPress(block, index)}
                disabled={block.isLocked}
              >
                <View style={styles.blockNumber}>
                  {block.isLocked ? (
                    <Lock size={16} color="#94a3b8" />
                  ) : block.isCompleted ? (
                    <CheckCircle size={16} color="#22c55e" />
                  ) : (
                    <Text style={styles.blockNumberText}>{index + 1}</Text>
                  )}
                </View>

                <View style={styles.blockContent}>
                  <View style={styles.blockHeader}>
                    <BlockIcon size={18} color={getBlockIconColor(block.type, block.isLocked)} />
                    <Text style={[styles.blockTitle, block.isLocked && styles.lockedText]}>
                      {block.title}
                    </Text>
                  </View>
                  
                  <Text style={[styles.blockTopic, block.isLocked && styles.lockedText]}>
                    {block.topic}
                  </Text>

                  {!block.isLocked && block.type === "simulacro" && (
                    <View style={styles.studyInfo}>
                      <Play size={14} color="#6366f1" />
                      <Text style={styles.studyDuration}>
                        {block.duration} de duración
                      </Text>
                    </View>
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
                  {block.isLocked ? (
                    <Lock size={20} color="#cbd5e1" />
                  ) : block.isCompleted ? (
                    <CheckCircle size={24} color="#22c55e" />
                  ) : (
                    <View style={styles.startIcon}>
                      <Play size={16} color="white" fill="white" />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}

        </View>


        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />

      </ScrollView>

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
