import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../components/ThemeContext";

import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  HelpCircle,
  X,
  Lightbulb
} from "lucide-react-native";

// Sample questions data
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
  {
    id: "4",
    question: "¿Cuál es la presión arterial normal en un adulto?",
    options: [
      { id: "a", text: "120/80 mmHg" },
      { id: "b", text: "140/90 mmHg" },
      { id: "c", text: "100/60 mmHg" },
      { id: "d", text: "160/100 mmHg" },
    ],
    correctAnswer: "a",
    fundamentacion: "Los valores normales de presión arterial se sitúan por debajo de 120/80 mmHg en un adulto sano.",
  },
  {
    id: "5",
    question: "¿Qué antibiótico es de primera línea para neumonía adquirida en la comunidad?",
    options: [
      { id: "a", text: "Amoxicilina" },
      { id: "b", text: "Ciprofloxacino" },
      { id: "c", text: "Vancomicina" },
      { id: "d", text: "Meropenem" },
    ],
    correctAnswer: "a",
    fundamentacion: "La amoxicilina sigue siendo el tratamiento de elección para neumonía típica adquirida en la comunidad sin factores de riesgo.",
  },
];

export default function QuestionsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get exam configuration from params
  const examType = params.examType as string || "Examen";
  const specialty = params.specialty as string || "Medicina";
  const examMode = params.examMode as string || "Resultados al final";
  const questionCount = parseInt(params.questionCount as string) || 5;
  const timeLimit = parseInt(params.timeLimit as string) || 30;

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  // States for immediate response mode
  const [pendingOption, setPendingOption] = useState<string | null>(null);
  const [showImmediateConfirm, setShowImmediateConfirm] = useState(false);
  const [immediateAnswers, setImmediateAnswers] = useState<{ [key: string]: boolean }>({});

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer effect
  useEffect(() => {
    if (!isFinished && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isFinished, timeRemaining]);

  // Format time
  const formatTime = (seconds: number) => {
    const totalMins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (totalMins >= 60) {
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return `${hours}h ${mins}min`;
    }
    
    return `${totalMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get time color based on remaining time
  const getTimeColor = () => {
    if (timeRemaining <= 60) return "#ef4444";
    if (timeRemaining <= 300) return "#f59e0b";
    return "#0284c7";
  };

  // Get time background color
  const getTimeBackgroundColor = () => {
    if (timeRemaining <= 60) return "#fee2e2";
    if (timeRemaining <= 300) return "#fef3c7";
    return "#e0f2fe";
  };

  // Get current question
  const currentQuestion = sampleQuestions[currentQuestionIndex];
  const totalQuestions = Math.min(questionCount, sampleQuestions.length);

  // Handle answer selection
  const handleSelectAnswer = (optionId: string) => {
    if (isFinished) return;
    
    // If it's immediate mode, show confirmation before marking as answered
    if (examMode === "Respuesta inmediata") {
      // If already answered, don't allow re-selection
      if (immediateAnswers[currentQuestion.id]) return;
      
      setPendingOption(optionId);
      setShowImmediateConfirm(true);
      return;
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const confirmImmediateAnswer = () => {
    if (pendingOption) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: pendingOption,
      }));
      setImmediateAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: true,
      }));
    }
    setShowImmediateConfirm(false);
    setPendingOption(null);
  };

  const cancelImmediateAnswer = () => {
    setShowImmediateConfirm(false);
    setPendingOption(null);
  };

  // Navigation
  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Finish exam
  const handleFinishExam = () => {
    setShowConfirmationModal(true);
  };

  const confirmFinishExam = () => {
    setIsFinished(true);
    setShowConfirmationModal(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const results = calculateResults();
    
    // Replace the exam screen with results screen so user can't go back to finished exam
    router.replace({
      pathname: "/simulacre-results",
      params: {
        examType,
        specialty,
        examMode,
        timeLimit: timeLimit.toString(),
        correct: results.correct.toString(),
        total: results.total.toString(),
        percentage: results.percentage.toString(),
        timeSpent: (timeLimit * 60 - timeRemaining).toString(),
        selectedAnswers: JSON.stringify(selectedAnswers),
        questions: JSON.stringify(sampleQuestions.slice(0, totalQuestions)),
      },
    });
  };

  // Calculate results
  const calculateResults = () => {
    let correct = 0;
    sampleQuestions.slice(0, totalQuestions).forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100),
    };
  };

  // Render results
  const renderResults = () => {
    const results = calculateResults();
    return (
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <View style={styles.resultsIconContainer}>
            <Check size={48} color="#0284c7" />
          </View>
          <Text style={[styles.resultsTitle, { color: colors.text }]}>
            ¡Simulacro Completado!
          </Text>
        </View>

        <View style={styles.resultsStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#0284c7" }]}>
              {results.correct}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subtitle }]}>
              Correctas
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#ef4444" }]}>
              {results.total - results.correct}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subtitle }]}>
              Incorrectas
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#0284c7" }]}>
              {results.percentage}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.subtitle }]}>
              Puntuación
            </Text>
          </View>
        </View>

        <View style={styles.resultsTime}>
          <Clock size={20} color={colors.subtitle} />
          <Text style={[styles.resultsTimeText, { color: colors.subtitle }]}>
            Tiempo restante: {formatTime(timeRemaining)}
          </Text>
        </View>

        <Pressable
          style={[styles.finishButton, { backgroundColor: "#0284c7" }]}
          onPress={() => router.back()}
        >
          <Text style={styles.finishButtonText}>Volver al Generador</Text>
        </Pressable>
      </View>
    );
  };

  // Render question
  const renderQuestion = () => {
    const selectedAnswer = selectedAnswers[currentQuestion.id];
    const isAnswered = selectedAnswer !== undefined;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    return (
      <View style={styles.questionContainer}>
        {/* Question Header */}
        <View style={styles.questionHeader}>
          <Text style={[styles.questionNumber, { color: colors.subtitle }]}>
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                  backgroundColor: "#0284c7",
                },
              ]}
            />
          </View>
        </View>

        {/* Question Text */}
        <Text style={[styles.questionText, { color: colors.text }]}>
          {currentQuestion.question}
        </Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isPending = pendingOption === option.id;
            const isCorrectOption = option.id === currentQuestion.correctAnswer;
            
            // Show feedback if exam is finished OR if this specific question was confirmed in immediate mode
            const showFeedback = isFinished || (examMode === "Respuesta inmediata" && immediateAnswers[currentQuestion.id]);

            let optionStyle: any[] = [styles.option, { borderColor: colors.subtitle }];
            let optionTextStyle = [styles.optionText, { color: colors.text }];

            if (isSelected || isPending) {
              optionStyle = [
                styles.option,
                { borderColor: "#0284c7", backgroundColor: "#e0f2fe" },
              ];
            }

            if (showFeedback) {
              if (isCorrectOption) {
                optionStyle = [
                  styles.option,
                  { borderColor: "#22c55e", backgroundColor: "#dcfce7" },
                ];
              } else if (isSelected && !isCorrect) {
                optionStyle = [
                  styles.option,
                  { borderColor: "#ef4444", backgroundColor: "#fee2e2" },
                ];
              }
            }

            return (
              <Pressable
                key={option.id}
                style={optionStyle}
                onPress={() => handleSelectAnswer(option.id)}
                disabled={isFinished}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionLetter,
                      (isSelected || isPending) && { backgroundColor: "#0284c7" },
                      showFeedback && isCorrectOption && { backgroundColor: "#22c55e" },
                      showFeedback && isSelected && !isCorrect && { backgroundColor: "#ef4444" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLetterText,
                        { color: isSelected || (showFeedback && isCorrectOption) ? "white" : colors.text },
                      ]}
                    >
                      {option.id.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={optionTextStyle}>{option.text}</Text>
                </View>
                {showFeedback && isCorrectOption && (
                  <Check size={20} color="#22c55e" />
                )}
                {showFeedback && isSelected && !isCorrect && (
                  <X size={20} color="#ef4444" />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Feedback for immediate response mode */}
        {(isFinished || (examMode === "Respuesta inmediata" && immediateAnswers[currentQuestion.id])) && (
          <View style={styles.feedbackSection}>
            <View
              style={[
                styles.feedbackContainer,
                { backgroundColor: isCorrect ? "#dcfce7" : "#fee2e2" },
              ]}
            >
              <Text
                style={[
                  styles.feedbackText,
                  { color: isCorrect ? "#166534" : "#991b1b" },
                ]}
              >
                {isCorrect ? "¡Correcto!" : "Incorrecto"}
              </Text>
            </View>

            {currentQuestion.fundamentacion && (
              <View style={styles.fundamentacionImmediate}>
                <View style={styles.fundHeader}>
                  <Lightbulb size={18} color="#0284c7" />
                  <Text style={styles.fundTitle}>Fundamentación</Text>
                </View>
                <Text style={styles.fundText}>{currentQuestion.fundamentacion}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {examType}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.subtitle }]} numberOfLines={1}>
            {specialty}
          </Text>
        </View>
        <View style={[styles.timerContainer, { backgroundColor: getTimeBackgroundColor() }]}>
          <Clock size={18} color={getTimeColor()} />
          <Text style={[styles.timerText, { color: getTimeColor() }]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </View>

      {/* Content */}
      {showResults ? (
        renderResults()
      ) : (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {renderQuestion()}

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <Pressable
              style={[
                styles.navButton,
                currentQuestionIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft size={24} color={currentQuestionIndex === 0 ? "#94a3b8" : "#0284c7"} />
              <Text
                style={[
                  styles.navButtonText,
                  { color: currentQuestionIndex === 0 ? "#94a3b8" : "#0284c7" },
                ]}
              >
                Anterior
              </Text>
            </Pressable>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Pressable
                style={[styles.navButton, styles.finishButton]}
                onPress={handleFinishExam}
              >
                <Flag size={20} color="white" />
                <Text style={styles.finishButtonText}>Finalizar</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.navButton, styles.nextButton]}
                onPress={goToNextQuestion}
              >
                <Text style={styles.nextButtonText}>Siguiente</Text>
                <ChevronRight size={24} color="white" />
              </Pressable>
            )}
          </View>



          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}

      {/* Immediate Response Confirmation Modal */}
      <Modal
        visible={showImmediateConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelImmediateAnswer}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: "white" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Selección</Text>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.confirmIconContainer}>
                <HelpCircle size={48} color="#0284c7" />
              </View>
              <Text style={styles.modalMessage}>
                ¿Estás de acuerdo con tu selección?
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelImmediateAnswer}
              >
                <Text style={styles.cancelButtonText}>No</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmImmediateAnswer}
              >
                <Text style={styles.confirmButtonText}>Sí</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Confirmar finalización
              </Text>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.warningIconContainer}>
                <HelpCircle size={48} color="#0284c7" />
              </View>
              <Text style={[styles.modalMessage, { color: colors.text }]}>
                ¿Estás seguro de que quieres finalizar el simulacro?
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmationModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#0284c7" }]}>
                  Continuar
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmFinishExam}
              >
                <Text style={styles.modalButtonTextConfirm}>
                  Sí, finalizar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "white",
  },

  backButton: {
    padding: 8,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },

  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.7,
  },

  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  timerText: {
    fontSize: 14,
    fontWeight: "bold",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  questionContainer: {
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  questionHeader: {
    marginBottom: 20,
  },

  questionNumber: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
  },

  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 4,
  },

  questionText: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 24,
    color: "#1e293b",
  },

  optionsContainer: {
    gap: 12,
  },

  option: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },



  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },

  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },

  optionLetterText: {
    fontSize: 15,
    fontWeight: "bold",
  },

  optionText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },

  feedbackContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  feedbackText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    gap: 12,
  },

  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#0284c7",
  },

  navButtonDisabled: {
    borderColor: "#94a3b8",
  },

  navButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },

  nextButton: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  nextButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },

  finishButton: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  finishButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },



  bottomSpacing: {
    height: 40,
  },

  resultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  resultsHeader: {
    alignItems: "center",
    marginBottom: 30,
  },

  resultsIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  resultsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
  },

  resultsStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 30,
  },

  statItem: {
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  statValue: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 14,
    fontWeight: "500",
  },

  resultsTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 30,
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  resultsTimeText: {
    fontSize: 18,
    fontWeight: "600",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalBody: {
    alignItems: "center",
    marginBottom: 30,
    flexDirection: "row",
    gap: 16,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
  },
  confirmButton: {
    backgroundColor: "#0284c7",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  modalButtonTextConfirm: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  fundamentacionImmediate: {
    marginTop: 15,
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
    marginBottom: 8,
  },
  fundTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0369a1",
  },
  fundText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "justify",
  },
  feedbackSection: {
    marginTop: 20,
  },
  confirmIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "700",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
