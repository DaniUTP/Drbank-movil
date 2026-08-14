import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../common/ThemeContext";
import CommonModal from "../../common/Modal";
import { styles } from "./styles";

import TabNavigation from "@/common/TabNavigation";
import { decryptLaravel } from "@/utils/encryption";
import { parseDistractorText } from "@/utils/distractorParser";
import { useLazyHistoryQuery } from "@/services/question/history.rtkq";
import { useUpdateExamStatusMutation } from "@/services/question/exam.rtkq";
import { HistoryRequestDTO } from "@/types/question/history.dto";
import { UpdateExamStatusRequestDTO } from "@/types/question/exam.dto";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  HelpCircle,
  Lightbulb
} from "lucide-react-native";

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  distractorAnalysis?: string;
  reference?: string;
}

export default function QuestionsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get exam configuration from params
  const examId = (params.examId as string) || (params.exam as string) || "";
  const examType = (params.examType as string) || "Simulacro";
  const area = (params.area as string) || "";
  const specialty = (params.specialty as string) || "";
  const theme = (params.theme as string) || "";
  const years = (params.years as string) || "";
  const examMode = (params.examMode as string) || "Resultados al final";
  const questionCount = parseInt(params.questionCount as string) || 5;
  const timeLimit = parseInt(params.timeLimit as string) || 30;
  const sourceKey = (params.sourceKey as string) || (params.source as string) || "";

  // Helper to map exam_type to 'simulation', 'by_year', or 'by_topic'
  const resolveExamTypeKey = (
    srcKey?: string,
    typeStr?: string,
    specStr?: string
  ): string => {
    if (srcKey === "simulation" || srcKey === "by_year" || srcKey === "by_topic") {
      return srcKey;
    }
    const combined = `${typeStr || ""} ${specStr || ""}`.toLowerCase();
    if (combined.includes("año") || combined.includes("year") || combined.includes("by_year")) {
      return "by_year";
    }
    if (combined.includes("tema") || combined.includes("topic") || combined.includes("by_topic")) {
      return "by_topic";
    }
    return "simulation";
  };

  const formattedExamType = resolveExamTypeKey(sourceKey, examType, specialty);

  // Get questions from params
  const questionsParam = params.questions as string;
  const apiQuestions = questionsParam ? JSON.parse(questionsParam) : null;

  // Transform API questions
  const transformedQuestions = apiQuestions ? apiQuestions.map((q: any) => {
    // 1. Obtener dato de respuesta correcta (descifrar sólo si no viene como texto plano)
    let rawData = q.data;
    if (typeof rawData === "string" && rawData.length > 20 && !rawData.startsWith("a") && !rawData.startsWith("b") && !rawData.startsWith("c") && !rawData.startsWith("d")) {
      try {
        rawData = decryptLaravel(rawData);
      } catch (e) {
        // En caso de fallo de descifrado, conservar rawData
      }
    }
    
    // 2. Mapear opciones (a, b, c, d)
    const options = q.options.map((opt: any, index: number) => ({
      id: String.fromCharCode(97 + index), 
      originalId: opt.optionId, 
      text: opt.option,
    }));
    
    // 3. Buscar la opción correcta comparando id ('a','b'), originalId (optionId), o índice
    const cleanData = String(rawData || '').trim().toLowerCase();
    const correctOption = options.find((opt: any, index: number) => {
      const optId = String(opt.id).toLowerCase();
      const origId = String(opt.originalId || '').toLowerCase();
      return (
        optId === cleanData ||
        origId === cleanData ||
        cleanData === String(index) ||
        cleanData === String.fromCharCode(97 + index)
      );
    });
    
    return {
      id: q.questionId.toString(),
      question: q.question,
      options: options,
      correctAnswer: correctOption ? correctOption.id : (cleanData || ''), 
      explanation: q.justification || '',
      distractorAnalysis: q.distractorAnalysis || '',
      reference: q.reference || '',
    };
  }) : [];

  // RTK Query APIs for history & exam status
  const [triggerHistory] = useLazyHistoryQuery();
  const [updateExamStatus] = useUpdateExamStatusMutation();
  const startTimeRef = useRef<string>(new Date().toISOString());

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  
  // States for immediate response mode
  const [pendingOption, setPendingOption] = useState<string | null>(null);
  const [showImmediateConfirm, setShowImmediateConfirm] = useState(false);
  const [immediateAnswers, setImmediateAnswers] = useState<{ [key: string]: boolean }>({});
  
  // Tab state for feedback
  const [activeTab, setActiveTab] = useState('fundamentacion');

  const feedbackTabs = [
    { id: 'fundamentacion', label: 'Fundamentación' },
    { id: 'distractores', label: 'Distractores' },
  ];

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer effect
  useEffect(() => {
    if (!isFinished && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isFinished, timeRemaining]);

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

  const getTimeColor = () => {
    if (timeRemaining <= 60) return "#ef4444";
    if (timeRemaining <= 300) return "#f59e0b";
    return "#0284c7";
  };

  const getTimeBackgroundColor = () => {
    if (timeRemaining <= 60) return "#fee2e2";
    if (timeRemaining <= 300) return "#fef3c7";
    return "#e0f2fe";
  };

  const currentQuestion = transformedQuestions[currentQuestionIndex];
  const totalQuestions = Math.min(questionCount, transformedQuestions.length);

  const handleSelectAnswer = (optionId: string) => {
    if (isFinished) return;
    if (examMode === "Respuesta inmediata") {
      if (immediateAnswers[currentQuestion.id] === true) return;
      if (immediateAnswers[currentQuestion.id] === false && selectedAnswers[currentQuestion.id] === optionId) return;
      setPendingOption(optionId);
      setShowImmediateConfirm(true);
      return;
    }
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const confirmImmediateAnswer = () => {
    if (pendingOption) {
      setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: pendingOption }));
      setImmediateAnswers((prev) => ({ ...prev, [currentQuestion.id]: true }));
    }
    setShowImmediateConfirm(false);
    setPendingOption(null);
  };

  const cancelImmediateAnswer = () => {
    setShowImmediateConfirm(false);
    setPendingOption(null);
  };

  const handlePressBack = () => {
    if (isFinished) {
      router.back();
    } else {
      setShowAbandonModal(true);
    }
  };

  const confirmAbandonExam = async () => {
    setIsFinished(true);
    setIsSubmitting(true);
    setShowAbandonModal(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const results = calculateResults();
    const completedAt = new Date().toISOString();
    const timeSpent = timeLimit * 60 - timeRemaining;
    const activeQuestions = transformedQuestions.slice(0, totalQuestions);

    // 1. Build HistoryRequestDTO[]
    const historyPayload: HistoryRequestDTO[] = activeQuestions.map((q: any) => {
      const selectedOption = selectedAnswers[q.id];
      const isAnswered = selectedOption !== undefined && selectedOption !== "";
      const isCorrect = isAnswered && selectedOption === q.correctAnswer;
      return {
        questionId: q.id,
        ok: isCorrect ? 1 : 0,
        error: (isAnswered && !isCorrect) ? 1 : 0,
        empty: !isAnswered ? 1 : 0,
        count: 1,
      };
    });

    // 2. Build UpdateExamStatusRequestDTO (PATCH /quiz/exam/status) with status "abandoned"
    const updateExamPayload: UpdateExamStatusRequestDTO = {
      exam: examId,
      status: "abandoned",
      score_percentage: results.percentage,
      time_spent: timeSpent,
      completed_at: completedAt,
      exam_summary: activeQuestions.map((q: any) => ({
        question_id: parseInt(q.id, 10) || 0,
        correct_answer: q.correctAnswer || "",
        response: selectedAnswers[q.id] || "",
      })),
    };

    try {
      await Promise.allSettled([
        triggerHistory(historyPayload).unwrap(),
        updateExamStatus(updateExamPayload).unwrap(),
      ]);
    } catch (error) {
      console.error("Error submitting quiz history or updating exam status (abandoned):", error);
    } finally {
      setIsSubmitting(false);
    }

    router.replace({
      pathname: "/simulacre-results",
      params: {
        examId,
        examType,
        area: area || undefined,
        specialty: specialty || undefined,
        theme: theme || undefined,
        years: years || undefined,
        examMode,
        sourceKey: formattedExamType,
        timeLimit: timeLimit.toString(),
        questionCount: questionCount.toString(),
        correct: results.correct.toString(),
        total: results.total.toString(),
        percentage: results.percentage.toString(),
        timeSpent: timeSpent.toString(),
        selectedAnswers: JSON.stringify(selectedAnswers),
        questions: JSON.stringify(activeQuestions),
      },
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) setCurrentQuestionIndex((prev) => prev + 1);
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleFinishExam = () => setShowConfirmationModal(true);

  const confirmFinishExam = async () => {
    setIsFinished(true);
    setIsSubmitting(true);
    setShowConfirmationModal(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const results = calculateResults();
    const completedAt = new Date().toISOString();
    const timeSpent = timeLimit * 60 - timeRemaining;
    const activeQuestions = transformedQuestions.slice(0, totalQuestions);

    // 1. Build HistoryRequestDTO[]
    const historyPayload: HistoryRequestDTO[] = activeQuestions.map((q: any) => {
      const selectedOption = selectedAnswers[q.id];
      const isAnswered = selectedOption !== undefined && selectedOption !== "";
      const isCorrect = isAnswered && selectedOption === q.correctAnswer;
      return {
        questionId: q.id,
        ok: isCorrect ? 1 : 0,
        error: (isAnswered && !isCorrect) ? 1 : 0,
        empty: !isAnswered ? 1 : 0,
        count: 1,
      };
    });

    // 2. Build UpdateExamStatusRequestDTO (PATCH /quiz/exam/status)
    const updateExamPayload: UpdateExamStatusRequestDTO = {
      exam: examId,
      status: "completed",
      score_percentage: results.percentage,
      time_spent: timeSpent,
      completed_at: completedAt,
      exam_summary: activeQuestions.map((q: any) => ({
        question_id: parseInt(q.id, 10) || 0,
        correct_answer: q.correctAnswer || "",
        response: selectedAnswers[q.id] || "",
      })),
    };

    try {
      // Consume history query API (POST /quiz/history) & updateExamStatus mutation API (PATCH /quiz/exam/status)
      await Promise.allSettled([
        triggerHistory(historyPayload).unwrap(),
        updateExamStatus(updateExamPayload).unwrap(),
      ]);
    } catch (error) {
      console.error("Error submitting quiz history or update exam status API:", error);
    } finally {
      setIsSubmitting(false);
    }

    router.replace({
      pathname: "/simulacre-results",
      params: {
        examType,
        area: area || undefined,
        specialty: specialty || undefined,
        theme: theme || undefined,
        years: years || undefined,
        examMode,
        sourceKey: formattedExamType,
        timeLimit: timeLimit.toString(),
        questionCount: questionCount.toString(),
        correct: results.correct.toString(),
        total: results.total.toString(),
        percentage: results.percentage.toString(),
        timeSpent: timeSpent.toString(),
        selectedAnswers: JSON.stringify(selectedAnswers),
        questions: JSON.stringify(activeQuestions),
      },
    });
  };

  const calculateResults = () => {
    let correct = 0;
    transformedQuestions.slice(0, totalQuestions).forEach((q: Question) => {
      if (selectedAnswers[q.id] === q.correctAnswer) correct++;
    });
    return { correct, total: totalQuestions, percentage: Math.round((correct / totalQuestions) * 100) };
  };

  const renderResults = () => {
    const results = calculateResults();
    return (
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <View style={styles.resultsIconContainer}>
            <Check size={48} color="#0284c7" />
          </View>
          <Text style={[styles.resultsTitle, { color: colors.text }]}>¡Simulacro Completado!</Text>
        </View>
        <View style={styles.resultsStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#0284c7" }]}>{results.correct}</Text>
            <Text style={[styles.statLabel, { color: colors.subtitle }]}>Correctas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#ef4444" }]}>{results.total - results.correct}</Text>
            <Text style={[styles.statLabel, { color: colors.subtitle }]}>Incorrectas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#0284c7" }]}>{results.percentage}%</Text>
            <Text style={[styles.statLabel, { color: colors.subtitle }]}>Puntuación</Text>
          </View>
        </View>
        <View style={styles.resultsTime}>
          <Clock size={20} color={colors.subtitle} />
          <Text style={[styles.resultsTimeText, { color: colors.subtitle }]}>
            Tiempo restante: {formatTime(timeRemaining)}
          </Text>
        </View>
        <Pressable style={[styles.finishButton, { backgroundColor: "#0284c7" }]} onPress={() => router.back()}>
          <Text style={styles.finishButtonText}>Volver al Generador</Text>
        </Pressable>
      </View>
    );
  };

  const renderQuestion = () => {
    const selectedAnswer = selectedAnswers[currentQuestion.id];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    return (
      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={[styles.questionNumber, { color: colors.subtitle }]}>
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`, backgroundColor: "#0284c7" }]} />
          </View>
        </View>

        <Text style={[styles.questionText, { color: colors.text }]}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option: QuestionOption) => {
            const isSelected = selectedAnswer === option.id;
            const isPending = pendingOption === option.id;
            const isCorrectOption = currentQuestion.correctAnswer && option.id === currentQuestion.correctAnswer;
            const showFeedback = !isSubmitting && (examMode === "Respuesta inmediata" && !!immediateAnswers[currentQuestion.id]);

            let optionStyle: any[] = [styles.option];
            let optionTextStyle = [styles.optionText, { color: colors.text }];

            if (isSelected || isPending) {
              optionStyle = [styles.option, styles.optionSelected];
            }

            if (showFeedback) {
              if (isCorrectOption) {
                optionStyle = [styles.option, styles.optionCorrect];
              } else if (isSelected) {
                optionStyle = [styles.option, styles.optionIncorrect];
              }
            }

            return (
              <Pressable key={option.id} style={optionStyle} onPress={() => handleSelectAnswer(option.id)} disabled={isFinished || isSubmitting}>
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionLetter, 
                    (isSelected || isPending) && styles.optionLetterSelected,
                    showFeedback && isCorrectOption && styles.optionLetterCorrect,
                    showFeedback && isSelected && !isCorrectOption && styles.optionLetterIncorrect
                  ]}>
                    <Text style={[styles.optionLetterText, { color: (isSelected || (showFeedback && (isCorrectOption || isSelected))) ? "white" : colors.text }]}>
                      {option.id.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={optionTextStyle}>{option.text}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {(!isSubmitting && examMode === "Respuesta inmediata" && immediateAnswers[currentQuestion.id]) && (
          <View style={styles.feedbackSection}>
            <View style={[styles.feedbackContainer, { backgroundColor: isCorrect ? "#dcfce7" : "#fee2e2" }]}>
              <Text style={[styles.feedbackText, { color: isCorrect ? "#166534" : "#991b1b" }]}>
                {isCorrect ? "¡Correcto!" : "Incorrecto"}
              </Text>
            </View>

            {/* Segmented Feedback Tabs */}
            {feedbackTabs.filter(tab => {
              if (tab.id === 'fundamentacion') return currentQuestion.explanation;
              if (tab.id === 'distractores') return currentQuestion.distractorAnalysis;
              return false;
            }).length > 1 && (
              <View style={styles.feedbackTabsContainer}>
                {feedbackTabs
                  .filter(tab => (tab.id === 'fundamentacion' ? currentQuestion.explanation : currentQuestion.distractorAnalysis))
                  .map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <Pressable
                        key={tab.id}
                        style={[styles.feedbackTabItem, isActive && styles.feedbackTabItemActive]}
                        onPress={() => setActiveTab(tab.id)}
                      >
                        {tab.id === 'fundamentacion' ? (
                          <Lightbulb size={16} color={isActive ? '#0284c7' : '#64748b'} />
                        ) : (
                          <HelpCircle size={16} color={isActive ? '#ea580c' : '#64748b'} />
                        )}
                        <Text style={[styles.feedbackTabText, isActive && styles.feedbackTabTextActive]}>
                          {tab.label}
                        </Text>
                      </Pressable>
                    );
                  })}
              </View>
            )}

            {activeTab === 'fundamentacion' && currentQuestion.explanation && (
              <View>
                <View style={styles.explanationImmediate}>
                  <View style={styles.explanationHeader}>
                    <View style={styles.explanationHeaderLeft}>
                      <View style={styles.explanationIconBadge}>
                        <Lightbulb size={18} color="#0284c7" />
                      </View>
                      <Text style={styles.explanationTitle}>Fundamentación</Text>
                    </View>
                  </View>
                  <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                </View>

                {currentQuestion.reference && (
                  <View style={styles.referenceImmediate}>
                    <View style={styles.referenceHeader}>
                      <BookOpen size={15} color="#6d28d9" />
                      <Text style={styles.referenceTitle}>Fuente Bibliográfica</Text>
                    </View>
                    <Text style={styles.referenceText}>{currentQuestion.reference}</Text>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'distractores' && currentQuestion.distractorAnalysis && (
              <View style={styles.distractorImmediate}>
                <View style={styles.distractorHeader}>
                  <View style={styles.distractorHeaderLeft}>
                    <View style={styles.distractorIconBadge}>
                      <HelpCircle size={18} color="#ea580c" />
                    </View>
                    <Text style={styles.distractorTitle}>Análisis de Distractores</Text>
                  </View>
                </View>

                {(() => {
                  const items = parseDistractorText(currentQuestion.distractorAnalysis);
                  if (items.length > 0 && items.some(it => it.letter || it.label)) {
                    return (
                      <View style={styles.distractorList}>
                        {items.map((item, idx) => (
                          <View key={idx} style={styles.distractorItemCard}>
                            <View style={styles.distractorItemHeader}>
                              {item.letter ? (
                                <View style={styles.distractorItemBadge}>
                                  <Text style={styles.distractorItemBadgeText}>{item.letter}</Text>
                                </View>
                              ) : null}
                              {item.label ? (
                                <Text style={styles.distractorItemLabel}>{item.label}</Text>
                              ) : null}
                            </View>
                            <Text style={styles.distractorItemBody}>{item.text}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  }
                  return <Text style={styles.distractorText}>{currentQuestion.distractorAnalysis}</Text>;
                })()}
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
        <Pressable onPress={handlePressBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{examType}</Text>
        </View>
        <View style={[styles.timerContainer, { backgroundColor: getTimeBackgroundColor() }]}>
          <Clock size={18} color={getTimeColor()} />
          <Text style={[styles.timerText, { color: getTimeColor() }]}>{formatTime(timeRemaining)}</Text>
        </View>
      </View>

      {showResults ? (
        renderResults()
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {renderQuestion()}

          <View style={styles.navigationContainer}>
            <Pressable style={[styles.navButton, styles.navButtonSecondary, currentQuestionIndex === 0 && styles.navButtonDisabled]} onPress={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
              <ChevronLeft size={20} color={currentQuestionIndex === 0 ? "#94a3b8" : "#0284c7"} />
              <Text style={[styles.navButtonTextSecondary, { color: currentQuestionIndex === 0 ? "#94a3b8" : "#0284c7" }]}>Anterior</Text>
            </Pressable>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Pressable style={[styles.navButton, styles.finishButton]} onPress={handleFinishExam}>
                <Flag size={18} color="white" />
                <Text style={styles.finishButtonText}>Finalizar</Text>
              </Pressable>
            ) : (
              <Pressable style={[styles.navButton, styles.nextButton]} onPress={goToNextQuestion}>
                <Text style={styles.nextButtonText}>Siguiente</Text>
                <ChevronRight size={20} color="white" />
              </Pressable>
            )}
          </View>
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}

      {/* Modales */}
      <Modal visible={showImmediateConfirm} transparent animationType="fade" onRequestClose={cancelImmediateAnswer}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: "white" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Selección</Text>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.confirmIconContainer}>
                <HelpCircle size={48} color="#0284c7" />
              </View>
              <Text style={styles.modalMessage}>¿Estás de acuerdo con tu selección?</Text>
            </View>
            <View style={styles.modalFooter}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={cancelImmediateAnswer}>
                <Text style={styles.cancelButtonText}>No</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.confirmButton]} onPress={confirmImmediateAnswer}>
                <Text style={styles.confirmButtonText}>Sí</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showConfirmationModal} transparent animationType="fade" onRequestClose={() => setShowConfirmationModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Confirmar finalización</Text>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.warningIconContainer}>
                <HelpCircle size={48} color="#0284c7" />
              </View>
              <Text style={[styles.modalMessage, { color: colors.text }]}>¿Estás seguro de que quieres finalizar el simulacro?</Text>
            </View>
            <View style={styles.modalFooter}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowConfirmationModal(false)}>
                <Text style={[styles.modalButtonText, { color: "#0284c7" }]}>Continuar</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.confirmButton]} onPress={confirmFinishExam}>
                <Text style={styles.modalButtonTextConfirm}>Sí, finalizar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Confirmar Abandono */}
      <Modal visible={showAbandonModal} transparent animationType="fade" onRequestClose={() => setShowAbandonModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>¿Abandonar examen?</Text>
            </View>
            <View style={styles.modalBody}>
              <View style={[styles.warningIconContainer, { backgroundColor: "#fee2e2" }]}>
                <AlertTriangle size={36} color="#ef4444" />
              </View>
              <Text style={[styles.modalMessage, { color: colors.text }]}>
                ¿Estás seguro de que deseas abandonar el simulacro? Tus respuestas actuales se guardarán y el examen quedará marcado como abandonado.
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowAbandonModal(false)}>
                <Text style={[styles.modalButtonText, { color: "#64748b" }]}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, { backgroundColor: "#ef4444" }]} onPress={confirmAbandonExam}>
                <Text style={styles.modalButtonTextConfirm}>Sí, abandonar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal común mientras se guardan las respuestas */}
      <CommonModal
        visible={isSubmitting}
        onClose={() => {}}
        title="Guardando las respuestas"
        showFooter={false}
        logoSource={require("../../assets/logo_app.png")}
        icon={<ActivityIndicator size="large" color="#0284c7" style={{ marginVertical: 6 }} />}
      >
        <View style={{ alignItems: "center", paddingVertical: 6 }}>
          <Text style={{ textAlign: "center", fontSize: 15, color: colors.subtitle || "#64748b", lineHeight: 22 }}>
            Por favor espera un momento mientras guardamos tus respuestas y procesamos los resultados del examen...
          </Text>
        </View>
      </CommonModal>
    </SafeAreaView>
  );
}