import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularProgress from "../../common/CircularProgress";
import { useTheme } from "../../common/ThemeContext";
import { styles } from "./styles";

import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle,
  Clock,
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

  // Get current date
  const currentDate = new Date();
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  
  // For demo purposes, using day 15 as selected. In real app, use the day param
  const selectedDay = day ? parseInt(day as string) : 15;
  
  // Calculate day of week based on selected day
  // Day 16 = Monday, Day 22 = Sunday
  const dayOfWeek = dayNames[((selectedDay - 16 + 1) % 7)];
  
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // Map of day to specialty data
  const specialtyData: { [key: number]: any } = {
    16: { name: "Cardiología", area: "Medicina Interna", icon: Heart, iconColor: "#ef4444", progress: 0, completedBlocks: 0, totalBlocks: 5 },
    17: { name: "Pediatría", area: "Medicina Especializada", icon: Brain, iconColor: "#8b5cf6", progress: 60, completedBlocks: 3, totalBlocks: 5 },
    18: { name: "Farmacología", area: "Ciencias Básicas", icon: Pill, iconColor: "#f97316", progress: 40, completedBlocks: 2, totalBlocks: 5 },
    19: { name: "Neurología", area: "Medicina Interna", icon: Brain, iconColor: "#06b6d4", progress: 80, completedBlocks: 4, totalBlocks: 5 },
    20: { name: "Cirugía", area: "Cirugía General", icon: LayoutGrid, iconColor: "#ec4899", progress: 100, completedBlocks: 5, totalBlocks: 5 },
    21: { name: "Repaso", area: "Integración", icon: TrendingUp, iconColor: "#22c55e", progress: 20, completedBlocks: 1, totalBlocks: 5 },
    22: { name: "Libre", area: "Descanso", icon: CalendarDays, iconColor: "#64748b", progress: 0, completedBlocks: 0, totalBlocks: 0 },
  };

  const specialty = specialtyData[selectedDay] || { name: "General", area: "Medicina", icon: Heart, iconColor: "#64748b", progress: 0, completedBlocks: 0, totalBlocks: 5 };

  // Redirect if it's a Libre day
  if (specialty.name === "Libre") {
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

  // Daily schedule with study and simulacro blocks
  const [schedule, setSchedule] = useState([
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
  ]);

  // Use progress from specialty data (matches Dashboard)
  const progressPercentage = specialty.progress;
  const completedBlocks = specialty.completedBlocks;
  const totalBlocks = specialty.totalBlocks;

  // Determine if a block is locked based on completed blocks
  const isBlockLocked = (blockIndex: number) => blockIndex > completedBlocks;

  // Update schedule with dynamic lock status based on completedBlocks
  const updatedSchedule = schedule.map((block, index) => ({
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
      case "study": return BookOpen;
      case "simulacro": return TrendingUp;
      default: return BookOpen;
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

  const handleBlockPress = (block: any) => {
    if (block.isLocked) {
      // Show message that previous block needs to be completed
      return;
    }
    // Navigate to the corresponding activity
    if (block.type === "study") {
      // Navigate to study screen
      console.log("Navigate to study:", block.topic);
    } else {
      // Navigate to simulacro
      console.log("Navigate to simulacro:", block.topic);
    }
  };

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
            {dayOfWeek} {selectedDay} de {currentMonth} {currentYear}
          </Text>
        </View>


        {/* Specialty Card */}
        <View style={[styles.specialtyCard, { backgroundColor: colors.card }]}>
          <View style={styles.specialtyContent}>
            <View style={[styles.specialtyIconContainer, { backgroundColor: specialty.iconColor + "20" }]}>
              <specialty.icon size={32} color={specialty.iconColor} />
            </View>
            
            <View style={styles.specialtyInfo}>
              <Text style={[styles.specialtyLabel, { color: colors.subtitle }]}>
                Especialidad Actual
              </Text>
              <Text style={[styles.specialtyName, { color: colors.text }]}>
                {specialty.name}
              </Text>
              <Text style={[styles.specialtyArea, { color: colors.subtitle }]}>
                {specialty.area}
              </Text>
            </View>
          </View>
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
              <CheckCircle size={18} color={progressPercentage >= 70 ? "#22c55e" : progressPercentage >= 40 ? "#f59e0b" : "#ef4444"} />
              <Text style={styles.statText}>{completedBlocks} bloques</Text>
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

          {updatedSchedule.map((block, index) => {
            const BlockIcon = getBlockIcon(block.type);
            return (
              <Pressable 
                key={block.id}
                style={[
                  styles.blockCard,
                  { backgroundColor: getBlockColor(block.type, block.isLocked) }
                ]}
                onPress={() => handleBlockPress(block)}
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
                    {block.isWeakness && !block.isLocked && (
                      <View style={styles.weaknessBadge}>
                        <AlertTriangle size={10} color="#ca8a04" />
                        <Text style={styles.weaknessText}>Área Débil</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={[styles.blockTopic, block.isLocked && styles.lockedText]}>
                    {block.topic}
                  </Text>
                  <Text style={[styles.blockArea, block.isLocked && styles.lockedText]}>
                    {block.area}
                  </Text>

                  {!block.isLocked && block.type === "study" && (
                    <View style={styles.studyInfo}>
                      <Clock size={14} color="#ca8a04" />
                      <Text style={styles.studyDuration}>
                        Min: {block.duration} para desbloquear
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

    </SafeAreaView>
  );
}
