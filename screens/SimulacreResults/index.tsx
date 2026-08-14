import { parseDistractorText } from "@/utils/distractorParser";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
   ArrowLeft,
   Award,
   BookOpen,
   CheckCircle2,
   Clock,
   HelpCircle,
   Lightbulb,
   Trophy,
   XCircle,
   Zap
} from "lucide-react-native";
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

const { width } = Dimensions.get("window");

// Premium Doughnut Chart Component
const ModernDoughnut = ({ correct, total, size = 200, strokeWidth = 20 }: { correct: number; total: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
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

function ReviewQuestionCard({ item, index, selectedAnswers }: { item: any; index: number; selectedAnswers: any }) {
  const [activeTab, setActiveTab] = useState<string>("fundamentacion");

  const selected = selectedAnswers[item.id];
  const isAnswered = selected !== undefined && selected !== null && selected !== "";
  const isCorrect = isAnswered && selected === item.correctAnswer;
  const statusBg = isCorrect ? "#dcfce7" : isAnswered ? "#fee2e2" : "#fef3c7";
  const statusColor = isCorrect ? "#166534" : isAnswered ? "#991b1b" : "#9a3412";
  const statusLabel = isCorrect ? "Correcta" : isAnswered ? "Incorrecta" : "Sin responder";

  const tabs = [
    ...(item.explanation ? [{ id: "fundamentacion", label: "Fundamentación" }] : []),
    ...(item.distractorAnalysis ? [{ id: "distractores", label: "Distractores" }] : []),
  ];

  const currentTab = tabs.some(t => t.id === activeTab) ? activeTab : (tabs[0]?.id || "fundamentacion");

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
         <Text style={styles.reviewIndex}>Pregunta {index + 1}</Text>
         <View style={[styles.statusTag, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusTagText, { color: statusColor }]}>
              {statusLabel}
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

      {/* Segmented Tabs for Fundamentación & Distractores */}
      {tabs.length > 1 && (
        <View style={styles.feedbackTabsContainer}>
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                style={[styles.feedbackTabItem, isActive && styles.feedbackTabItemActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                {tab.id === "fundamentacion" ? (
                  <Lightbulb size={16} color={isActive ? "#0284c7" : "#64748b"} />
                ) : (
                  <HelpCircle size={16} color={isActive ? "#ea580c" : "#64748b"} />
                )}
                <Text style={[styles.feedbackTabText, isActive && styles.feedbackTabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Rationale Section */}
      {currentTab === "fundamentacion" && item.explanation ? (
        <View style={styles.explanationBox}>
           <View style={styles.explanationHeader}>
              <View style={styles.explanationHeaderLeft}>
                <View style={styles.explanationIconBadge}>
                  <Lightbulb size={18} color="#0284c7" />
                </View>
                <Text style={styles.explanationTitle}>Fundamentación</Text>
              </View>
           </View>
           <Text style={styles.explanationText}>{item.explanation}</Text>

           {item.reference ? (
             <View style={styles.referenceBox}>
                <View style={styles.referenceHeader}>
                   <BookOpen size={15} color="#6d28d9" />
                   <Text style={styles.referenceTitle}>Fuente Bibliográfica</Text>
                </View>
                <Text style={styles.referenceText}>{item.reference}</Text>
             </View>
           ) : null}
        </View>
      ) : null}

      {/* Distractors Section */}
      {currentTab === "distractores" && item.distractorAnalysis ? (
        <View style={styles.distractorBox}>
           <View style={styles.distractorHeader}>
              <View style={styles.distractorHeaderLeft}>
                <View style={styles.distractorIconBadge}>
                  <HelpCircle size={18} color="#ea580c" />
                </View>
                <Text style={styles.distractorTitle}>Análisis de Distractores</Text>
              </View>
           </View>
           
           {(() => {
             const items = parseDistractorText(item.distractorAnalysis);
             if (items.length > 0 && items.some(it => it.letter || it.label)) {
               return (
                 <View style={styles.distractorList}>
                   {items.map((distItem, idx) => (
                     <View key={idx} style={styles.distractorItemCard}>
                       <View style={styles.distractorItemHeader}>
                         {distItem.letter ? (
                           <View style={styles.distractorItemBadge}>
                             <Text style={styles.distractorItemBadgeText}>{distItem.letter}</Text>
                           </View>
                         ) : null}
                         {distItem.label ? (
                           <Text style={styles.distractorItemLabel}>{distItem.label}</Text>
                         ) : null}
                       </View>
                       <Text style={styles.distractorItemBody}>{distItem.text}</Text>
                     </View>
                   ))}
                 </View>
               );
             }
             return <Text style={styles.distractorText}>{item.distractorAnalysis}</Text>;
           })()}
        </View>
      ) : null}
    </View>
  );
}

export default function SimulacreResultsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<"results" | "review_exam">("results");

  // Parse results & filters from params
  const examType = (params.examType as string) || "";
  const area = (params.area as string) || "";
  const specialty = (params.specialty as string) || "";
  const theme = (params.theme as string) || "";
  const years = (params.years as string) || "";
  const sourceKey = (params.sourceKey as string) || "";
  const correctParam = parseInt(params.correct as string) || 0;
  const total = parseInt(params.total as string) || 0;
  const percentage = parseInt(params.percentage as string) || 0;
  const timeSpent = parseInt(params.timeSpent as string) || 0;
  const originalTimeLimit = params.timeLimit as string || "30";
  const questionCount = params.questionCount as string;
  const examMode = params.examMode as string || "Resultados al final";
  const selectedAnswers = JSON.parse(params.selectedAnswers as string || "{}");
  const questions = JSON.parse(params.questions as string || "[]");

  // Calculate breakdown: correct, empty (voids), incorrect
  let correctCount = 0;
  let incorrectCount = 0;
  let emptyCount = 0;

  if (Array.isArray(questions) && questions.length > 0) {
    questions.forEach((q: any) => {
      const selected = selectedAnswers[q.id];
      if (selected === undefined || selected === null || selected === "") {
        emptyCount++;
      } else if (selected === q.correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });
  } else {
    correctCount = correctParam;
    emptyCount = 0;
    incorrectCount = Math.max(0, total - correctParam);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const avgTimePerQuestion = total > 0 ? (timeSpent / total).toFixed(1) : "0";

  const renderResultsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Main Score Card */}
      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
           <Trophy size={24} color="#f59e0b" />
           <Text style={styles.cardTitle}>¡Simulacro Finalizado!</Text>
        </View>
        
        <View style={styles.chartWrapper}>
           <ModernDoughnut correct={correctCount} total={total} />
        </View>

        <View style={styles.statsGrid}>
           <View style={styles.miniStat}>
              <View style={[styles.miniIcon, { backgroundColor: "#dcfce7" }]}>
                 <CheckCircle2 size={16} color="#22c55e" />
              </View>
              <View>
                 <Text style={styles.miniLabel}>Correctas</Text>
                 <Text style={styles.miniValue}>{correctCount} / {total}</Text>
              </View>
           </View>

           <View style={styles.miniStat}>
              <View style={[styles.miniIcon, { backgroundColor: "#fef3c7" }]}>
                 <HelpCircle size={16} color="#f59e0b" />
              </View>
              <View>
                 <Text style={styles.miniLabel}>Vacías</Text>
                 <Text style={styles.miniValue}>{emptyCount} / {total}</Text>
              </View>
           </View>
           
           <View style={styles.miniStat}>
              <View style={[styles.miniIcon, { backgroundColor: "#fee2e2" }]}>
                 <XCircle size={16} color="#ef4444" />
              </View>
              <View>
                 <Text style={styles.miniLabel}>Incorrectas</Text>
                 <Text style={styles.miniValue}>{incorrectCount} / {total}</Text>
              </View>
           </View>
        </View>
      </View>

      {/* Exam Summary Section */}
      <View style={styles.sectionHeader}>
         <Text style={styles.sectionTitle}>Resumen del Examen</Text>
      </View>
      
      <View style={styles.summaryCard}>
         <View style={styles.summaryGrid}>
            <View style={styles.summaryMetric}>
               <View style={[styles.summaryIcon, { backgroundColor: "#e0f2fe" }]}>
                  <Clock size={18} color="#0284c7" />
               </View>
               <View>
                  <Text style={styles.summaryMetricLabel}>Tiempo Total</Text>
                  <Text style={styles.summaryMetricValue}>{formatTime(timeSpent)}</Text>
               </View>
            </View>

            <View style={styles.summaryMetric}>
               <View style={[styles.summaryIcon, { backgroundColor: "#f3e8ff" }]}>
                  <Zap size={18} color="#9333ea" />
               </View>
               <View>
                  <Text style={styles.summaryMetricLabel}>Ritmo Promedio</Text>
                  <Text style={styles.summaryMetricValue}>{avgTimePerQuestion} s / preg</Text>
               </View>
            </View>
         </View>

         <View style={styles.summaryDivider} />

         <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Tipo de Examen</Text>
            <Text style={styles.summaryRowValue}>{examType || "Simulacro"}</Text>
         </View>

         {area ? (
           <View style={styles.summaryRow}>
              <Text style={styles.summaryRowLabel}>Área</Text>
              <Text style={styles.summaryRowValue}>{area}</Text>
           </View>
         ) : null}

         {specialty ? (
           <View style={styles.summaryRow}>
              <Text style={styles.summaryRowLabel}>Especialidad</Text>
              <Text style={styles.summaryRowValue}>{specialty}</Text>
           </View>
         ) : null}

         {theme ? (
           <View style={styles.summaryRow}>
              <Text style={styles.summaryRowLabel}>Tema(s)</Text>
              <Text style={styles.summaryRowValue}>{theme}</Text>
           </View>
         ) : null}

         {years ? (
           <View style={styles.summaryRow}>
              <Text style={styles.summaryRowLabel}>Año(s)</Text>
              <Text style={styles.summaryRowValue}>{years}</Text>
           </View>
         ) : null}

         <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Modo de Examen</Text>
            <Text style={styles.summaryRowValue}>{examMode}</Text>
         </View>

         <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Tiempo Límite</Text>
            <Text style={styles.summaryRowValue}>{originalTimeLimit} min</Text>
         </View>

         <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Preguntas Solicitadas</Text>
            <Text style={styles.summaryRowValue}>{questionCount || total} preguntas</Text>
         </View>

         <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Preguntas Respondidas</Text>
            <Text style={styles.summaryRowValue}>{correctCount + incorrectCount} de {total}</Text>
         </View>

         <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.summaryRowLabel}>Desempeño</Text>
            <View style={[
               styles.statusBadge, 
               { backgroundColor: percentage >= 70 ? "#dcfce7" : percentage >= 50 ? "#fef3c7" : "#fee2e2" }
            ]}>
               <Award size={14} color={percentage >= 70 ? "#166534" : percentage >= 50 ? "#9a3412" : "#991b1b"} />
               <Text style={[
                  styles.statusBadgeText, 
                  { color: percentage >= 70 ? "#166534" : percentage >= 50 ? "#9a3412" : "#991b1b" }
               ]}>
                  {percentage >= 70 ? "Aprobado" : percentage >= 50 ? "Regular" : "Por mejorar"}
               </Text>
            </View>
         </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderReviewExamTab = () => (
    <FlatList
      data={questions}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <ReviewQuestionCard item={item} index={index} selectedAnswers={selectedAnswers} />
      )}
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
          <Text style={styles.headerSubtitle}>{examType || "Simulacro"}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Modern Tabs */}
      <View style={styles.tabsWrapper}>
         <Pressable 
           style={[styles.tabBtn, activeTab === "results" && styles.tabBtnActive]} 
           onPress={() => setActiveTab("results")}
         >
            <Text style={[styles.tabBtnText, activeTab === "results" && styles.tabBtnTextActive]}>Resultados</Text>
         </Pressable>
         <Pressable 
           style={[styles.tabBtn, activeTab === "review_exam" && styles.tabBtnActive]} 
           onPress={() => setActiveTab("review_exam")}
         >
            <Text style={[styles.tabBtnText, activeTab === "review_exam" && styles.tabBtnTextActive]}>Revisión de Examen</Text>
         </Pressable>
      </View>

      {activeTab === "results" ? renderResultsTab() : renderReviewExamTab()}
    </SafeAreaView>
  );
}
