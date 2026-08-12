import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../common/ThemeContext";
import { styles } from "./styles";

import {
    ArrowLeft,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Flag,
    HelpCircle,
    Lightbulb,
    X
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
    explanation: "Los valores normales de presión arterial se sitúan por debajo de 120/80 mmHg en un adulto sano.",
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
    explanation: "La amoxicilina sigue siendo el tratamiento de elección para neumonía típica adquirida en la comunidad sin factores de riesgo.",
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

            {currentQuestion.explanation && (
              <View style={styles.explanationImmediate}>
                <View style={styles.explanationHeader}>
                  <Lightbulb size={18} color="#0284c7" />
                  <Text style={styles.explanationTitle}>Fundamentación</Text>
                </View>
                <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
    </SafeAreaView>
  );
}
