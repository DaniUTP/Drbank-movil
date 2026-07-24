import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../components/ThemeContext";

import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  History,
  Lightbulb,
  Plus,
  RotateCcw,
  Trophy,
  XCircle,
  ChevronRight,
  Info
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

  const [activeTab, setActiveTab] = useState<"resultados" | "ver_examen">("resultados");

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

  const renderResultTab = () => (
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
             pathname: "/historial-detalle",
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

  const renderExamenTab = () => (
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

            {/* Fundamentación Section */}
            {item.fundamentacion && (
              <View style={styles.fundamentacionBox}>
                 <View style={styles.fundHeader}>
                    <Info size={16} color="#0284c7" />
                    <Text style={styles.fundTitle}>Fundamentación</Text>
                 </View>
                 <Text style={styles.fundText}>{item.fundamentacion}</Text>
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
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
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
           style={[styles.tabBtn, activeTab === "resultados" && styles.tabBtnActive]} 
           onPress={() => setActiveTab("resultados")}
         >
            <Text style={[styles.tabBtnText, activeTab === "resultados" && styles.tabBtnTextActive]}>Resultados</Text>
         </Pressable>
         <Pressable 
           style={[styles.tabBtn, activeTab === "ver_examen" && styles.tabBtnActive]} 
           onPress={() => setActiveTab("ver_examen")}
         >
            <Text style={[styles.tabBtnText, activeTab === "ver_examen" && styles.tabBtnTextActive]}>Ver Examen</Text>
         </Pressable>
      </View>

      {activeTab === "resultados" ? renderResultTab() : renderExamenTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  backBtn: {
    padding: 4,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  tabsWrapper: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  tabBtnActive: {
    backgroundColor: "#0284c7",
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  tabBtnTextActive: {
    color: "white",
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  mainCard: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 25,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 25,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
  },
  chartWrapper: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 20,
  },
  miniStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  miniIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  miniLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  miniValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 35,
    paddingHorizontal: 4,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  btnPrimary: {
    backgroundColor: "#0284c7",
    flex: 1.4,
  },
  btnSecondary: {
    backgroundColor: "#e0f2fe",
  },
  btnOutline: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  btnTextPrimary: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
  btnTextSecondary: {
    color: "#0284c7",
    fontWeight: "700",
    fontSize: 13,
  },
  btnTextOutline: {
    color: "#64748b",
    fontWeight: "700",
    fontSize: 13,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  themeCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  themeDetail: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  themeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  themeBadgeText: {
    fontSize: 14,
    fontWeight: "800",
  },
  progressContainer: {
    width: "100%",
  },
  progressTrack: {
    height: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  recommendationBox: {
    backgroundColor: "#fff7ed",
    borderRadius: 24,
    padding: 24,
    borderLeftWidth: 5,
    borderLeftColor: "#f59e0b",
    marginTop: 10,
    marginBottom: 40,
  },
  recHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#9a3412",
  },
  recText: {
    fontSize: 14,
    color: "#9a3412",
    lineHeight: 22,
    fontWeight: "500",
  },
  reviewCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  reviewIndex: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: "800",
  },
  reviewQuestion: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: 24,
    marginBottom: 20,
  },
  reviewOptions: {
    gap: 12,
    marginBottom: 20,
  },
  optRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    gap: 12,
  },
  optLetter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  optLetterText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#64748b",
  },
  optText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  fundamentacionBox: {
    backgroundColor: "#f0f9ff",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  fundHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  fundTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0369a1",
  },
  fundText: {
    fontSize: 13,
    color: "#0369a1",
    lineHeight: 18,
    fontWeight: "500",
  },
  examenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
  },
  examenSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
});
