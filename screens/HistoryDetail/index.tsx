import { useLocalSearchParams, useRouter } from "expo-router";
import {
   AlertCircle,
   ArrowLeft,
   Award,
   CheckCircle2,
   CircleDot,
   Clock,
   Lightbulb
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
   FlatList,
   Pressable,
   ScrollView,
   Text,
   View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularProgressChart from "../../common/CircularProgressChart";
import TabNavigation from "../../common/TabNavigation";
import { useTheme } from "../../common/ThemeContext";
import { styles } from "./styles";



export default function HistoryDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<"summary" | "exams" | "analysis">("summary");
  const [feedbackTab, setFeedbackTab] = useState('fundamentacion');

  const feedbackTabs = [
    { id: 'fundamentacion', label: 'Fundamentación' },
    { id: 'distractores', label: 'Distractores' },
  ];

  // Parse exam summary from params
  const examSummary = useMemo(() => {
    try {
      const summaryStr = params.examSummary as string;
      if (summaryStr) {
        return JSON.parse(summaryStr);
      }
      return [];
    } catch (e) {
      return [];
    }
  }, [params.examSummary]);

  // Current exam data
  const selectedExam = useMemo(() => ({
    id: "current",
    score: parseInt(params.percentage as string) || 0,
    date: "Hoy (Actual)",
    category: params.specialty as string || "Medicina",
    correct: parseInt(params.correct as string) || 0,
    total: parseInt(params.total as string) || 0,
    time: parseInt(params.timeSpent as string) || 0,
    type: params.examType as string || "Simulacro",
    recommendation: params.recommendation as string || ""
  }), [params]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const renderSummary = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
         <View style={styles.heroHeader}>
            <Award size={24} color="#f59e0b" />
            <View>
               <Text style={styles.heroTitle}>Resumen del Intento</Text>
               <Text style={styles.heroTheme}>{selectedExam.category}</Text>
            </View>
         </View>
         
         <View style={styles.heroMain}>
            <CircularProgressChart correct={selectedExam.correct} total={selectedExam.total} />
         </View>
         
         <View style={styles.heroInfoRow}>
            <View style={styles.heroInfoItem}>
               <CheckCircle2 size={18} color="#22c55e" />
               <View>
                  <Text style={styles.heroInfoLabel}>Aciertos</Text>
                  <Text style={styles.heroInfoValue}>{selectedExam.correct}/{selectedExam.total}</Text>
               </View>
            </View>
            <View style={styles.heroInfoDivider} />
            <View style={styles.heroInfoItem}>
               <Clock size={18} color="#64748b" />
               <View>
                  <Text style={styles.heroInfoLabel}>Tiempo</Text>
                  <Text style={styles.heroInfoValue}>{formatTime(selectedExam.time)}</Text>
               </View>
            </View>
         </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderExams = () => (
    <View style={styles.tabContentFlat}>
      <FlatList
        data={examSummary}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          const isCorrect = item.correct_answer && item.response && 
                          item.correct_answer.toLowerCase() === item.response.toLowerCase();
          const isUnanswered = !item.response || item.response === null;

          // Build options from alt_a, alt_b, alt_c, alt_d fields
          const options = [
            { id: 'a', text: item.alt_a },
            { id: 'b', text: item.alt_b },
            { id: 'c', text: item.alt_c },
            { id: 'd', text: item.alt_d },
          ].filter(opt => opt.text); // Filter out empty options

          return (
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                 <Text style={styles.reviewIndex}>Pregunta {index + 1}</Text>
                 <View style={[styles.statusTag, { 
                   backgroundColor: isUnanswered ? "#fef3c7" : (isCorrect ? "#dcfce7" : "#fee2e2")
                 }]}>
                    <Text style={[styles.statusTagText, { 
                      color: isUnanswered ? "#92400e" : (isCorrect ? "#166534" : "#991b1b")
                    }]}>
                      {isUnanswered ? "Sin responder" : (isCorrect ? "Correcta" : "Incorrecta")}
                    </Text>
                 </View>
              </View>
              <Text style={styles.reviewQuestion}>{item.question || "Pregunta sin texto"}</Text>
              
              <View style={styles.reviewOptions}>
                 {options.map((opt, optIndex) => {
                    const isCorrectOpt = item.correct_answer && 
                                       item.correct_answer.toLowerCase() === opt.id.toLowerCase();
                    const isUserSelected = item.response && 
                                          item.response.toLowerCase() === opt.id.toLowerCase();
                    
                    let borderColor = "#e2e8f0";
                    let bgColor = "white";
                    if (isCorrectOpt) { borderColor = "#22c55e"; bgColor = "#f0fdf4"; }
                    else if (isUserSelected && !isCorrectOpt) { borderColor = "#ef4444"; bgColor = "#fef2f2"; }

                    return (
                      <View key={opt.id} style={[styles.optRow, { borderColor, backgroundColor: bgColor }]}>
                         <View style={[styles.optLetter, isCorrectOpt && { backgroundColor: "#22c55e" }, isUserSelected && !isCorrectOpt && { backgroundColor: "#ef4444" }]}>
                            <Text style={[styles.optLetterText, (isCorrectOpt || isUserSelected) && { color: "white" }]}>{opt.id.toUpperCase()}</Text>
                         </View>
                         <Text style={styles.optText}>{opt.text}</Text>
                      </View>
                    );
                 })}
              </View>

              {/* Feedback Section con Tabs */}
              {(item.justification || item.distractor_analysis) && (
                <View style={styles.feedbackSection}>
                  {/* Segmented Feedback Tabs */}
                  {feedbackTabs.filter(tab => {
                    if (tab.id === 'fundamentacion') return item.justification;
                    if (tab.id === 'distractores') return item.distractor_analysis;
                    return false;
                  }).length > 0 && (
                    <View style={styles.feedbackTabsContainer}>
                      {feedbackTabs
                        .filter(tab => (tab.id === 'fundamentacion' ? item.justification : item.distractor_analysis))
                        .map(tab => {
                          const isActive = feedbackTab === tab.id;
                          return (
                            <Pressable
                              key={tab.id}
                              style={[styles.feedbackTabItem, isActive && styles.feedbackTabItemActive]}
                              onPress={() => setFeedbackTab(tab.id)}
                            >
                              {tab.id === 'fundamentacion' ? (
                                <Lightbulb size={16} color={isActive ? '#0284c7' : '#64748b'} />
                              ) : (
                                <AlertCircle size={16} color={isActive ? '#ea580c' : '#64748b'} />
                              )}
                              <Text style={[styles.feedbackTabText, isActive && styles.feedbackTabTextActive]}>
                                {tab.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                    </View>
                  )}

                  {feedbackTab === 'fundamentacion' && item.justification && (
                    <View>
                      <View style={styles.explanationBox}>
                         <View style={styles.explanationHeader}>
                            <Lightbulb size={16} color="#0284c7" />
                            <Text style={styles.explanationTitle}>Fundamentación</Text>
                         </View>
                         <Text style={styles.explanationText}>{item.justification}</Text>
                      </View>

                      {item.reference && (
                        <View style={styles.explanationBox}>
                           <View style={styles.explanationHeader}>
                              <Lightbulb size={16} color="#7c3aed" />
                              <Text style={styles.explanationTitle}>Referencia</Text>
                           </View>
                           <Text style={styles.explanationText}>{item.reference}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {feedbackTab === 'distractores' && item.distractor_analysis && (
                    <View style={styles.explanationBox}>
                       <View style={styles.explanationHeader}>
                          <AlertCircle size={16} color="#ea580c" />
                          <Text style={styles.explanationTitle}>Análisis de Distractores</Text>
                       </View>
                       <Text style={styles.explanationText}>
                         {item.distractor_analysis.replace(/\r\n\r\n\r\n/g, '\n\n').replace(/\n\n\n/g, '\n\n').replace(/\r\n\r\n/g, '\n\n')}
                       </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        }}
        ListHeaderComponent={() => (
           <View style={{ marginBottom: 20 }}>
              <Text style={styles.examenTitle}>Examen</Text>
              <Text style={styles.examenSubtitle}>Mostrando resultados para {selectedExam.category}</Text>
           </View>
        )}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={() => (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: "#64748b", fontSize: 14 }}>No hay datos del examen disponibles</Text>
          </View>
        )}
      />
    </View>
  );

  const renderAnalysis = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.analysisCard}>
         <View style={styles.analysisHeader}>
            <Lightbulb size={24} color="#f59e0b" />
            <View>
               <Text style={styles.analysisTitle}>Plan de Acción</Text>
               <Text style={styles.analysisSubtitle}>{selectedExam.category}</Text>
            </View>
         </View>
         
         <View style={styles.orderedRecBox}>
            <Text style={styles.recTitleSmall}>RECOMENDACIÓN:</Text>
            
            <View style={styles.bulletItem}>
               <CircleDot size={12} color="#0284c7" style={{ marginTop: 4 }} />
               <Text style={styles.bulletText}>
                  {selectedExam.recommendation || "No hay recomendación disponible"}
               </Text>
            </View>
         </View>

         <View style={styles.metricGridSmall}>
            <View style={styles.metricMini}>
               <Text style={styles.miniLabel}>Estado</Text>
               <Text style={[styles.miniVal, { color: selectedExam.score >= 70 ? "#22c55e" : "#ef4444" }]}>
                  {selectedExam.score >= 80 ? "Experto" : selectedExam.score >= 60 ? "Aceptable" : "Crítico"}
               </Text>
            </View>
            <View style={styles.metricMini}>
               <Text style={styles.miniLabel}>Puntaje</Text>
               <Text style={styles.miniVal}>{selectedExam.score}%</Text>
            </View>
         </View>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/history-exam")} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.headerTitle}>Detalle Histórico</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={[
          { id: "summary", label: "Resumen" },
          { id: "exams", label: "Examen" },
          { id: "analysis", label: "Recomendación" }
        ]}
        activeTab={activeTab}
        onTabChange={(id: string) => setActiveTab(id as any)}
      />

      {activeTab === "summary" ? renderSummary() : activeTab === "exams" ? renderExams() : renderAnalysis()}
    </SafeAreaView>
  );
}
