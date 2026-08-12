import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Award,
    CheckCircle2,
    CircleDot,
    Clock,
    Info,
    Lightbulb,
    RotateCcw
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

// Sample questions for the "Exámenes" review tab
const sampleQuestions = [
  {
    id: "1",
    question: "¿Cuál es la principal causa de hipertensión arterial en adultos?",
    options: [
      { id: "a", text: "Genética" },
      { id: "b", text: "Dieta alta en sodio" },
      { id: "c", text: "Sedentarismo" },
      { id: "d", text: "Todas las anteriores" },
    ],
    correctAnswer: "d",
    explanation: "La hipertensión arterial en adultos es multicausal, involucrando factores genéticos, dieta alta en sodio y sedentarismo.",
  },
  {
    id: "2",
    question: "¿Cuál es el tratamiento de primera línea para la diabetes tipo 2?",
    options: [
      { id: "a", text: "Insulina" },
      { id: "b", text: "Metformina" },
      { id: "c", text: "Sulfonilureas" },
      { id: "d", text: "Inhibidores de DPP-4" },
    ],
    correctAnswer: "b",
    explanation: "La metformina es el fármaco de elección inicial debido a su eficacia, bajo riesgo de hipoglucemia y efecto neutro en el peso.",
  },
  {
    id: "3",
    question: "¿Qué signo clínico es característico del infarto agudo de miocardio?",
    options: [
      { id: "a", text: "Dolor torácico opresivo" },
      { id: "b", text: "Disnea" },
      { id: "c", text: "Diaforesis" },
      { id: "d", text: "Todos los anteriores" },
    ],
    correctAnswer: "d",
    explanation: "El IAM se presenta típicamente con dolor torácico, dificultad para respirar (disnea) y sudoración profusa (diaforesis).",
  },
];

export default function HistoryDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<"summary" | "exams" | "analysis">("summary");

  // Mock history data
  const initialExams = useMemo(() => [
    { 
      id: "current", 
      score: parseInt(params.percentage as string) || 0, 
      date: "Hoy (Actual)", 
      category: params.specialty as string || "Medicina", 
      correct: parseInt(params.correct as string) || 0, 
      total: parseInt(params.total as string) || 0,
      time: parseInt(params.timeSpent as string) || 0,
      type: "Simulacro"
    },
    { id: "h2", score: 85, date: "Ayer", category: "Pediatría", correct: 17, total: 20, time: 300, type: "Simulacro" },
    { id: "h3", score: 70, date: "10 May", category: "Cirugía", correct: 14, total: 20, time: 450, type: "Simulacro" },
    { id: "h4", score: 90, date: "09 May", category: "Ginecología", correct: 18, total: 20, time: 280, type: "Simulacro" },
    { id: "h5", score: 45, date: "08 May", category: "Psiquiatría", correct: 9, total: 20, time: 600, type: "Simulacro" },
    { id: "h6", score: 80, date: "07 May", category: "Cardiología", correct: 16, total: 20, time: 320, type: "Simulacro" },
    { id: "h7", score: 65, date: "06 May", category: "Neurología", correct: 13, total: 20, time: 400, type: "Simulacro" },
  ], [params]);

  const [selectedExamId, setSelectedExamId] = useState("current");

  const selectedExam = useMemo(() => 
    initialExams.find(e => e.id === selectedExamId) || initialExams[0],
    [selectedExamId, initialExams]
  );

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

      <View style={styles.historySection}>
         <Text style={styles.sectionTitle}>Historial Reciente (Últimos 7)</Text>
         <View style={styles.historyList}>
            {initialExams.map((exam) => {
               const isSelected = selectedExamId === exam.id;
               return (
                  <Pressable 
                    key={exam.id} 
                    style={[styles.historyItemCard, isSelected && styles.historyItemCardSelected]}
                    onPress={() => setSelectedExamId(exam.id)}
                  >
                     <View style={[styles.historyIndicator, { backgroundColor: exam.score >= 70 ? "#22c55e" : "#ef4444" }]} />
                     <View style={styles.historyItemInfo}>
                        <Text style={[styles.historyItemTitle, isSelected && { color: "#0284c7" }]}>{exam.category}</Text>
                        <Text style={styles.historyItemDate}>{exam.date} • {exam.correct}/{exam.total} aciertos</Text>
                     </View>
                     <View style={styles.historyItemScore}>
                        <Text style={[styles.historyScoreText, { color: exam.score >= 70 ? "#22c55e" : "#ef4444" }]}>{exam.score}%</Text>
                     </View>
                  </Pressable>
               );
            })}
         </View>
      </View>

      <Pressable 
        style={styles.retryButton}
        onPress={() => router.push({
          pathname: "/questions",
          params: { 
            examType: selectedExam.type || "Simulacro", 
            specialty: selectedExam.category, 
            questionCount: selectedExam.total.toString(),
            timeLimit: "30"
          }
        })}
      >
         <RotateCcw size={20} color="white" />
         <Text style={styles.retryButtonText}>Reintentar este Simulacro</Text>
      </Pressable>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderExams = () => (
    <View style={styles.tabContentFlat}>
      <FlatList
        data={sampleQuestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
               <Text style={styles.reviewIndex}>Pregunta {index + 1}</Text>
               <View style={[styles.statusTag, { backgroundColor: item.correctAnswer === "a" ? "#fee2e2" : "#dcfce7" }]}>
                  <Text style={[styles.statusTagText, { color: item.correctAnswer === "a" ? "#991b1b" : "#166534" }]}>
                    {item.correctAnswer === "a" ? "Incorrecta" : "Correcta"}
                  </Text>
               </View>
            </View>
            <Text style={styles.reviewQuestion}>{item.question}</Text>
            
            <View style={styles.reviewOptions}>
               {item.options.map((opt) => {
                  const isCorrectOpt = opt.id === item.correctAnswer;
                  const isUserSelected = opt.id === (item.id === "1" ? "a" : item.correctAnswer); 
                  
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
        )}
        ListHeaderComponent={() => (
           <View style={{ marginBottom: 20 }}>
              <Text style={styles.examenTitle}>Revisión del Examen</Text>
              <Text style={styles.examenSubtitle}>Mostrando resultados para {selectedExam.category}</Text>
           </View>
        )}
        contentContainerStyle={{ padding: 20 }}
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
            <Text style={styles.recTitleSmall}>RECOMENDACIONES:</Text>
            
            <View style={styles.bulletItem}>
               <CircleDot size={12} color="#0284c7" style={{ marginTop: 4 }} />
               <Text style={styles.bulletText}>
                  {selectedExam.score >= 80 
                    ? "¡Felicidades por tu excelente desempeño! Has demostrado un dominio superior en los conceptos fundamentales de esta materia." 
                    : selectedExam.score >= 60
                    ? "Has logrado un puntaje sólido, pero existen áreas de oportunidad. Dominas la teoría básica, pero fallas en la aplicación práctica."
                    : "Tu desempeño actual requiere una intervención inmediata. Es vital que detengas los simulacros y regreses a las bases teóricas."}
               </Text>
            </View>

            <View style={styles.bulletItem}>
               <CircleDot size={12} color="#0284c7" style={{ marginTop: 4 }} />
               <Text style={styles.bulletText}>
                  {selectedExam.score >= 80 
                    ? "Te sugerimos enfocarte en la resolución de casos clínicos de alta complejidad para perfeccionar tu técnica de descarte." 
                    : selectedExam.score >= 60
                    ? "Te sugerimos priorizar el estudio de los subtemas donde hubo errores y practicar con énfasis en la lectura comprensiva."
                    : "Enfócate en comprender la fisiopatología y los pilares del diagnóstico antes de intentar nuevos ejercicios prácticos."}
               </Text>
            </View>

            <View style={styles.bulletItem}>
               <CircleDot size={12} color="#0284c7" style={{ marginTop: 4 }} />
               <Text style={styles.bulletText}>
                  Mantén la constancia en tus repasos espaciados y revisa periódicamente las actualizaciones de las guías internacionales.
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
        <Pressable onPress={() => router.replace("/dashboard")} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.headerTitle}>Detalle Histórico</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={[
          { id: "summary", label: "Resumen" },
          { id: "exams", label: "Exámenes" },
          { id: "analysis", label: "Análisis" }
        ]}
        activeTab={activeTab}
        onTabChange={(id: string) => setActiveTab(id as any)}
      />

      {activeTab === "summary" ? renderSummary() : activeTab === "exams" ? renderExams() : renderAnalysis()}
    </SafeAreaView>
  );
}
