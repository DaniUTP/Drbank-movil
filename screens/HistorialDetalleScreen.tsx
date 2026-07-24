import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
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
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Lightbulb,
  Award,
  ChevronRight,
  Activity,
  BarChart3,
  ClipboardList,
  Info,
  XCircle,
  Target,
  CircleDot,
  RotateCcw
} from "lucide-react-native";

const { width } = Dimensions.get("window");

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
    fundamentacion: "La hipertensión arterial en adultos es multicausal, involucrando factores genéticos, dieta alta en sodio y sedentarismo.",
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
    fundamentacion: "La metformina es el fármaco de elección inicial debido a su eficacia, bajo riesgo de hipoglucemia y efecto neutro en el peso.",
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
    fundamentacion: "El IAM se presenta típicamente con dolor torácico, dificultad para respirar (disnea) y sudoración profusa (diaforesis).",
  },
];

// Premium Circular Chart
const HeroCircularChart = ({ correct, total, size = 180, strokeWidth = 18 }: { correct: number; total: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.round((correct / total) * 100);
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="none"
        />
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
      </View>
    </View>
  );
};

export default function HistorialDetalleScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<"resumen" | "examenes" | "analisis">("resumen");

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

  const renderResumen = () => (
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
            <HeroCircularChart correct={selectedExam.correct} total={selectedExam.total} />
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

  const renderExamenes = () => (
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

  const renderAnalisis = () => (
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
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/dashboard")} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.headerTitle}>Detalle Histórico</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNav}>
         {[
           { id: "resumen", label: "Resumen" },
           { id: "examenes", label: "Exámenes" },
           { id: "analisis", label: "Análisis" }
         ].map((tab) => (
            <Pressable 
              key={tab.id}
              style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.id as any)}
            >
               <Text style={[styles.tabItemText, activeTab === tab.id && styles.tabItemTextActive]}>
                  {tab.label}
               </Text>
            </Pressable>
         ))}
      </View>

      {activeTab === "resumen" ? renderResumen() : activeTab === "examenes" ? renderExamenes() : renderAnalisis()}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  tabNav: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  tabItemActive: {
    backgroundColor: "#0284c7",
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  tabItemTextActive: {
    color: "white",
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabContentFlat: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 20,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 25,
    width: "100%",
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  heroTheme: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  heroMain: {
    marginBottom: 30,
  },
  heroInfoRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 20,
  },
  heroInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroInfoLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  heroInfoValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e293b",
  },
  heroInfoDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#f1f5f9",
  },
  historySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 15,
  },
  historyList: {
    gap: 12,
  },
  historyItemCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  historyItemCardSelected: {
    borderColor: "#0284c7",
    backgroundColor: "#f0f9ff",
  },
  historyIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  historyItemDate: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  historyItemScore: {
    alignItems: "flex-end",
  },
  historyScoreText: {
    fontSize: 16,
    fontWeight: "800",
  },
  reviewCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 15,
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
    marginBottom: 12,
  },
  reviewIndex: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    gap: 10,
    marginBottom: 15,
  },
  optRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
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
  analysisCard: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 3,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 25,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  analysisSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  orderedRecBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 25,
  },
  recTitleSmall: {
    fontSize: 12,
    fontWeight: "900",
    color: "#64748b",
    letterSpacing: 1,
    marginBottom: 15,
  },
  bulletItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 15,
  },
  bulletText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "justify",
    flex: 1,
  },
  metricGridSmall: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 20,
  },
  metricMini: {
    alignItems: "center",
    flex: 1,
  },
  miniLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "700",
    marginBottom: 4,
  },
  miniVal: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1e293b",
  },
  retryButton: {
    backgroundColor: "#0284c7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
