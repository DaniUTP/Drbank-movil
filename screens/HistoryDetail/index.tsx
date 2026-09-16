import { useLocalSearchParams, useRouter } from "expo-router";
import {
   AlertCircle,
   ArrowLeft,
   Award,
   CheckCircle2,
   CircleDot,
   Clock,
   Lightbulb,
   HelpCircle,
   BookOpen
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
import ThemeToggle from "../../common/ThemeToggle";
import { styles } from "./styles";
import { styles as feedbackStyles } from "../Questions/styles";
import { parseDistractorText } from "@/utils/distractorParser";



export default function HistoryDetailScreen() {
  const { colors, darkMode } = useTheme();
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
      <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
         <View style={styles.heroHeader}>
            <Award size={24} color="#f59e0b" />
            <View>
               <Text style={[styles.heroTitle, { color: colors.text }]}>Resumen del Intento</Text>
               <Text style={[styles.heroTheme, { color: colors.subtitle }]}>{selectedExam.category}</Text>
            </View>
         </View>
         
         <View style={styles.heroMain}>
            <CircularProgressChart correct={selectedExam.correct} total={selectedExam.total} />
         </View>
         
         <View style={styles.heroInfoRow}>
            <View style={styles.heroInfoItem}>
               <CheckCircle2 size={18} color="#22c55e" />
               <View>
                  <Text style={[styles.heroInfoLabel, { color: colors.subtitle }]}>Aciertos</Text>
                  <Text style={[styles.heroInfoValue, { color: colors.text }]}>{selectedExam.correct}/{selectedExam.total}</Text>
               </View>
            </View>
            <View style={styles.heroInfoDivider} />
            <View style={styles.heroInfoItem}>
               <Clock size={18} color="#64748b" />
               <View>
                  <Text style={[styles.heroInfoLabel, { color: colors.subtitle }]}>Tiempo</Text>
                  <Text style={[styles.heroInfoValue, { color: colors.text }]}>{formatTime(selectedExam.time)}</Text>
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
            <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
              <View style={styles.reviewHeader}>
                 <Text style={[styles.reviewIndex, { color: colors.subtitle }]}>Pregunta {index + 1}</Text>
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
              <Text style={[styles.reviewQuestion, { color: colors.text }]}>{item.question || "Pregunta sin texto"}</Text>
              
              <View style={styles.reviewOptions}>
                 {options.map((opt, optIndex) => {
                    const isCorrectOpt = item.correct_answer && 
                                       item.correct_answer.toLowerCase() === opt.id.toLowerCase();
                    const isUserSelected = item.response && 
                                          item.response.toLowerCase() === opt.id.toLowerCase();
                    
                    let borderColor = colors.inputBorder;
                    let bgColor = colors.card;
                    if (isCorrectOpt) { borderColor = "#22c55e"; bgColor = darkMode ? "#10352a" : "#f0fdf4"; }
                    else if (isUserSelected && !isCorrectOpt) { borderColor = "#ef4444"; bgColor = darkMode ? "#3b1c24" : "#fef2f2"; }

                    return (
                      <View key={opt.id} style={[styles.optRow, { borderColor, backgroundColor: bgColor }]}>
                         <View style={[styles.optLetter, darkMode && { backgroundColor: "#1e293b" }, isCorrectOpt && { backgroundColor: "#22c55e" }, isUserSelected && !isCorrectOpt && { backgroundColor: "#ef4444" }]}>
                            <Text style={[styles.optLetterText, { color: (isCorrectOpt || isUserSelected) ? "white" : colors.subtitle }]}>{opt.id.toUpperCase()}</Text>
                         </View>
                         <Text style={[styles.optText, { color: colors.text }]}>{opt.text}</Text>
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
                    <View style={[feedbackStyles.feedbackTabsContainer, darkMode && { backgroundColor: "#1e293b" }]}>
                      {feedbackTabs
                        .filter(tab => (tab.id === 'fundamentacion' ? item.justification : item.distractor_analysis))
                        .map(tab => {
                          const isActive = feedbackTab === tab.id;
                          return (
                            <Pressable
                              key={tab.id}
                              style={[feedbackStyles.feedbackTabItem, isActive && feedbackStyles.feedbackTabItemActive, darkMode && isActive && { backgroundColor: "#164e63" }]}
                              onPress={() => setFeedbackTab(tab.id)}
                            >
                              {tab.id === 'fundamentacion' ? (
                                <Lightbulb size={16} color={isActive ? '#0284c7' : '#64748b'} />
                              ) : (
                                <HelpCircle size={16} color={isActive ? '#ea580c' : '#64748b'} />
                              )}
                              <Text style={[feedbackStyles.feedbackTabText, isActive && feedbackStyles.feedbackTabTextActive, { color: isActive ? colors.text : colors.subtitle }]}>
                                {tab.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                    </View>
                  )}

                  {feedbackTab === 'fundamentacion' && item.justification && (
                    <View>
                      <View style={[feedbackStyles.explanationImmediate, darkMode && { backgroundColor: "#111c2f", borderColor: colors.inputBorder, borderLeftColor: "#0284c7" }]}>
                         <View style={feedbackStyles.explanationHeader}>
                           <View style={feedbackStyles.explanationHeaderLeft}>
                            <View style={[feedbackStyles.explanationIconBadge, darkMode && { backgroundColor: "#164e63" }]}><Lightbulb size={18} color="#0284c7" /></View>
                            <Text style={[feedbackStyles.explanationTitle, { color: colors.text }]}>Fundamentación</Text>
                           </View>
                         </View>
                         <Text style={[feedbackStyles.explanationText, { color: colors.text }]}>{item.justification}</Text>
                      </View>

                      {item.reference && (
                        <View style={[feedbackStyles.referenceImmediate, darkMode && { backgroundColor: "#1e1b3b", borderColor: "#493b70", borderLeftColor: "#a78bfa" }]}>
                           <View style={feedbackStyles.referenceHeader}>
                              <BookOpen size={15} color="#7c3aed" />
                              <Text style={[feedbackStyles.referenceTitle, darkMode && { color: "#c4b5fd" }]}>Fuente Bibliográfica</Text>
                           </View>
                           <Text style={[feedbackStyles.referenceText, { color: colors.subtitle }]}>{item.reference}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {feedbackTab === 'distractores' && item.distractor_analysis && (
                    <View style={feedbackStyles.distractorImmediate}>
                       <View style={feedbackStyles.distractorHeader}>
                         <View style={feedbackStyles.distractorHeaderLeft}>
                          <View style={[feedbackStyles.distractorIconBadge, darkMode && { backgroundColor: "#7c2d12" }]}><HelpCircle size={18} color="#ea580c" /></View>
                          <Text style={[feedbackStyles.distractorTitle, { color: colors.text }]}>Análisis de Distractores</Text>
                         </View>
                       </View>
                       {(() => {
                         const distractors = parseDistractorText(item.distractor_analysis);
                         if (distractors.length > 0 && distractors.some(d => d.letter || d.label)) {
                           return <View style={feedbackStyles.distractorList}>{distractors.map((d, index) => (
                             <View key={index} style={[feedbackStyles.distractorItemCard, darkMode && { backgroundColor: "#111c2f", borderColor: colors.inputBorder, borderLeftColor: "#fb923c" }]}>
                               <View style={feedbackStyles.distractorItemHeader}>
                                 {d.letter ? <View style={[feedbackStyles.distractorItemBadge, darkMode && { backgroundColor: "#7c2d12" }]}><Text style={feedbackStyles.distractorItemBadgeText}>{d.letter}</Text></View> : null}
                                 {d.label ? <Text style={[feedbackStyles.distractorItemLabel, { color: colors.text }]}>{d.label}</Text> : null}
                               </View>
                               <Text style={[feedbackStyles.distractorItemBody, { color: colors.subtitle }]}>{d.text}</Text>
                             </View>
                           ))}</View>;
                         }
                         return <Text style={[feedbackStyles.distractorText, { color: colors.text }]}>{item.distractor_analysis}</Text>;
                       })()}
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        }}
        ListHeaderComponent={() => (
           <View style={{ marginBottom: 20 }}>
              <Text style={[styles.examenTitle, { color: colors.text }]}>Examen</Text>
              <Text style={[styles.examenSubtitle, { color: colors.subtitle }]}>Mostrando resultados para {selectedExam.category}</Text>
           </View>
        )}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={() => (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: colors.subtitle, fontSize: 14 }}>No hay datos del examen disponibles</Text>
          </View>
        )}
      />
    </View>
  );

  const renderAnalysis = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.analysisCard, { backgroundColor: colors.card }]}>
         <View style={styles.analysisHeader}>
            <Lightbulb size={24} color="#f59e0b" />
            <View>
               <Text style={[styles.analysisTitle, { color: colors.text }]}>Plan de Acción</Text>
               <Text style={[styles.analysisSubtitle, { color: colors.subtitle }]}>{selectedExam.category}</Text>
            </View>
         </View>
         
         <View style={[styles.orderedRecBox, darkMode && { backgroundColor: "#111c2f", borderColor: colors.inputBorder }]}>
            <Text style={[styles.recTitleSmall, { color: colors.text }]}>RECOMENDACIÓN:</Text>
            
            <View style={styles.bulletItem}>
               <CircleDot size={12} color="#0284c7" style={{ marginTop: 4 }} />
               <Text style={[styles.bulletText, { color: colors.text }]}>
                  {selectedExam.recommendation || "No hay recomendación disponible"}
               </Text>
            </View>
         </View>

         <View style={styles.metricGridSmall}>
            <View style={[styles.metricMini, darkMode && { backgroundColor: "#111c2f" }]}>
               <Text style={[styles.miniLabel, { color: colors.subtitle }]}>Estado</Text>
               <Text style={[styles.miniVal, { color: selectedExam.score >= 70 ? "#22c55e" : "#ef4444" }]}>
                  {selectedExam.score >= 80 ? "Experto" : selectedExam.score >= 60 ? "Aceptable" : "Crítico"}
               </Text>
            </View>
            <View style={[styles.metricMini, darkMode && { backgroundColor: "#111c2f" }]}>
               <Text style={[styles.miniLabel, { color: colors.subtitle }]}>Puntaje</Text>
               <Text style={[styles.miniVal, { color: colors.text }]}>{selectedExam.score}%</Text>
            </View>
         </View>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Detalle Histórico</Text>
        <ThemeToggle />
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
