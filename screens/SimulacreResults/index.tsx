import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../../common/ThemeContext";
import { styles } from "./styles";

import {
  ArrowLeft,
  CheckCircle2,
  History,
  Info,
  Lightbulb,
  Plus,
  RotateCcw,
  Trophy,
  XCircle
} from "lucide-react-native";

const { width } = Dimensions.get("window");

// Premium Doughnut Chart Component
const ModernDoughnut = ({ correct, total, size = 200, strokeWidth = 20 }: { correct: number; total: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (correct / total) * 100;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={percentage >= 70 ? "#22c55e" : percentage >= 50 ? "#f59e0b" : "#ef4444"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{ fontSize: 44, fontWeight: "800", color: "#1e293b" }}>{percentage}%</Text>
        <Text style={{ fontSize: 14, color: "#64748b", fontWeight: "600" }}>Puntuación</Text>
      </View>
    </View>
  );
};

export default function SimulacreResultsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<"results" | "review_exam">("results");

  // Parse results from params
  const examType = params.examType as string;
  const specialty = params.specialty as string;
  const correct = parseInt(params.correct as string) || 0;
  const total = parseInt(params.total as string) || 0;
  const percentage = parseInt(params.percentage as string) || 0;
  const timeSpent = parseInt(params.timeSpent as string) || 0;
  const originalTimeLimit = params.timeLimit as string || "30";
  const examMode = params.examMode as string || "Resultados al final";
  const selectedAnswers = JSON.parse(params.selectedAnswers as string || "{}");
  const questions = JSON.parse(params.questions as string || "[]");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderResultsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Main Score Card */}
      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
           <Trophy size={24} color="#f59e0b" />
           <Text style={styles.cardTitle}>¡Simulacro Finalizado!</Text>
        </View>
        
        <View style={styles.chartWrapper}>
           <ModernDoughnut correct={correct} total={total} />
        </View>

        <View style={styles.statsGrid}>
           <View style={styles.miniStat}>
              <View style={[styles.miniIcon, { backgroundColor: "#dcfce7" }]}>
                 <CheckCircle2 size={16} color="#22c55e" />
              </View>
              <View>
                 <Text style={styles.miniLabel}>Correctas</Text>
                 <Text style={styles.miniValue}>{correct} / {total}</Text>
              </View>
           </View>
           
           <View style={styles.miniStat}>
              <View style={[styles.miniIcon, { backgroundColor: "#fee2e2" }]}>
                 <XCircle size={16} color="#ef4444" />
              </View>
              <View>
                 <Text style={styles.miniLabel}>Incorrectas</Text>
                 <Text style={styles.miniValue}>{total - correct} / {total}</Text>
              </View>
           </View>
        </View>
      </View>

      {/* Action Buttons Row - Fixed Spacing */}
      <View style={styles.buttonContainer}>
         <Pressable 
           style={[styles.btn, styles.btnPrimary]}
           onPress={() => router.replace({
             pathname: "/questions",
             params: { 
               examType, 
               specialty, 
               examMode,
               questionCount: total.toString(),
               timeLimit: originalTimeLimit
             }
           })}
         >
            <RotateCcw size={18} color="white" />
            <Text style={styles.btnTextPrimary}>Reintentar</Text>
         </Pressable>
         
         <Pressable 
           style={[styles.btn, styles.btnSecondary]}
           onPress={() => router.replace("/simulacre-generator")}
         >
            <Plus size={18} color="#0284c7" />
            <Text style={styles.btnTextSecondary}>Nuevo</Text>
         </Pressable>
         
         <Pressable 
           style={[styles.btn, styles.btnOutline]}
           onPress={() => router.push({
             pathname: "/history-detail",
             params: { correct, total, percentage, examType, specialty, timeSpent }
           })}
         >
            <History size={18} color="#64748b" />
            <Text style={styles.btnTextOutline}>Historial</Text>
         </Pressable>
      </View>

      {/* Skills Analysis */}
      <View style={styles.sectionHeader}>
         <Text style={styles.sectionTitle}>Análisis por Temas</Text>
      </View>
      
      <View style={styles.themeCard}>
         <View style={styles.themeRow}>
            <View style={styles.themeInfo}>
               <Text style={styles.themeName}>{specialty}</Text>
               <Text style={styles.themeDetail}>{correct} aciertos de {total} preguntas</Text>
            </View>
            <View style={[styles.themeBadge, { backgroundColor: percentage >= 70 ? "#dcfce7" : "#fee2e2" }]}>
               <Text style={[styles.themeBadgeText, { color: percentage >= 70 ? "#166534" : "#991b1b" }]}>{percentage}%</Text>
            </View>
         </View>
         <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
               <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: percentage >= 70 ? "#22c55e" : "#f59e0b" }]} />
            </View>
         </View>
      </View>

      {/* Recommendations - More Margin */}
      <View style={styles.recommendationBox}>
         <View style={styles.recHeader}>
            <Lightbulb size={20} color="#f59e0b" />
            <Text style={styles.recTitle}>Recomendación de estudio</Text>
         </View>
         <Text style={styles.recText}>
            {percentage >= 80 
              ? "¡Excelente! Dominas bien este tema. Sigue así." 
              : "Te recomendamos reforzar los conceptos base de este tema antes de tu próximo examen oficial."}
         </Text>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );

  const renderReviewExamTab = () => (
    <FlatList
      data={questions}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const isCorrect = selectedAnswers[item.id] === item.correctAnswer;
        return (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
               <Text style={styles.reviewIndex}>Pregunta {index + 1}</Text>
               <View style={[styles.statusTag, { backgroundColor: isCorrect ? "#dcfce7" : "#fee2e2" }]}>
                  <Text style={[styles.statusTagText, { color: isCorrect ? "#166534" : "#991b1b" }]}>
                    {isCorrect ? "Correcta" : "Incorrecta"}
                  </Text>
               </View>
            </View>
            <Text style={styles.reviewQuestion}>{item.question}</Text>
            
            <View style={styles.reviewOptions}>
               {item.options.map((opt: any) => {
                  const isUserSelected = selectedAnswers[item.id] === opt.id;
                  const isCorrectOpt = opt.id === item.correctAnswer;
                  
                  let borderColor = "#e2e8f0";
                  let bgColor = "white";
                  
                  if (isCorrectOpt) {
                    borderColor = "#22c55e";
                    bgColor = "#f0fdf4";
                  } else if (isUserSelected && !isCorrect) {
                    borderColor = "#ef4444";
                    bgColor = "#fef2f2";
                  }

                  return (
                    <View key={opt.id} style={[styles.optRow, { borderColor, backgroundColor: bgColor }]}>
                       <View style={[styles.optLetter, isCorrectOpt && { backgroundColor: "#22c55e" }, isUserSelected && !isCorrect && { backgroundColor: "#ef4444" }]}>
                          <Text style={[styles.optLetterText, (isCorrectOpt || isUserSelected) && { color: "white" }]}>{opt.id.toUpperCase()}</Text>
                       </View>
                       <Text style={styles.optText}>{opt.text}</Text>
                       {isCorrectOpt && <CheckCircle2 size={16} color="#22c55e" />}
                       {isUserSelected && !isCorrect && <XCircle size={16} color="#ef4444" />}
                    </View>
                  );
               })}
            </View>

            {/* Explanation Section */}
            {item.explanation && (
              <View style={styles.explanationBox}>
                 <View style={styles.explanationHeader}>
                    <Info size={16} color="#0284c7" />
                    <Text style={styles.explanationTitle}>Fundamentación</Text>
                 </View>
                 <Text style={styles.explanationText}>{item.explanation}</Text>
              </View>
            )}
          </View>
        );
      }}
      contentContainerStyle={{ padding: 20 }}
      ListHeaderComponent={() => (
         <View style={{ marginBottom: 20 }}>
            <Text style={styles.examenTitle}>Revisión de Preguntas</Text>
            <Text style={styles.examenSubtitle}>Analiza tus respuestas detalladamente</Text>
         </View>
      )}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/dashboard")} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1e293b" />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Simulacro Finalizado</Text>
          <Text style={styles.headerSubtitle}>{specialty}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Modern Tabs */}
      <View style={styles.tabsWrapper}>
         <Pressable 
           style={[styles.tabBtn, activeTab === "results" && styles.tabBtnActive]} 
           onPress={() => setActiveTab("results")}
         >
            <Text style={[styles.tabBtnText, activeTab === "results" && styles.tabBtnTextActive]}>Results</Text>
         </Pressable>
         <Pressable 
           style={[styles.tabBtn, activeTab === "review_exam" && styles.tabBtnActive]} 
           onPress={() => setActiveTab("review_exam")}
         >
            <Text style={[styles.tabBtnText, activeTab === "review_exam" && styles.tabBtnTextActive]}>Review Exam</Text>
         </Pressable>
      </View>

      {activeTab === "results" ? renderResultsTab() : renderReviewExamTab()}
    </SafeAreaView>
  );
}
