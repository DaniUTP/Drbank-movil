import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../common/ThemeContext";
import { styles } from "./styles";

import {
    ArrowLeft,
    Calendar,
    Check,
    ChevronDown,
    Moon,
    Search,
    Sun,
    X,
} from "lucide-react-native";

import { useExamMutation } from "../../services/question/exam.rtkq";
import { useLazyQuestionByYearQuery } from "../../services/question/question.rtkq";
import { useExamTypeQuery } from "../../services/question/exam-type.rtkq";
import { useYearQuery } from "../../services/question/year.rtkq";
import { decryptLaravel } from "../../utils/encryption";

export default function SimulacreGeneratorByYearScreen() {
  const { colors, darkMode, toggleDarkMode } = useTheme();
  const [createExam] = useExamMutation();
  const [fetchQuestionsByYear, { isLoading: isLoadingQuestions }] = useLazyQuestionByYearQuery();
  const { data: examTypesData = [], isLoading: examTypesLoading } = useExamTypeQuery();
  const { data: yearsData = [], isLoading: yearsLoading } = useYearQuery();
  const router = useRouter();

  // Form state
  const [examType, setExamType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [examMode, setExamMode] = useState("");

  // Modal states
  const [showExamTypeModal, setShowExamTypeModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showExamModeModal, setShowExamModeModal] = useState(false);

  // Search states
  const [examTypeSearch, setExamTypeSearch] = useState("");
  const [yearSearch, setYearSearch] = useState("");
  const [examModeSearch, setExamModeSearch] = useState("");

  // Options from APIs
  const examTypes = useMemo(() => {
    return examTypesData.map((item: any) => ({ id: item.exam, name: item.exam }));
  }, [examTypesData]);

  const availableYears = useMemo(() => {
    return yearsData.map((item: any) => ({ id: item.year, name: item.year }));
  }, [yearsData]);

  const examModes = [
    {
      id: "1",
      name: "Resultados al final",
      description: "Experiencia de examen real",
      details: ["Evaluación completa al final", "Análisis detallado de resultados"]
    },
    {
      id: "2",
      name: "Respuesta inmediata",
      description: "Aprendizaje inmediato",
      details: ["Corrección instantánea", "Explicaciones detalladas"]
    }
  ];

  // Filtered data
  const filteredExamTypes = useMemo(() => {
    return examTypes.filter((type) =>
      type.name.toLowerCase().includes(examTypeSearch.toLowerCase())
    );
  }, [examTypeSearch]);

  const filteredYears = useMemo(() => {
    return availableYears.filter((year) =>
      year.name.includes(yearSearch)
    );
  }, [yearSearch]);

  const filteredExamModes = useMemo(() => {
    return examModes.filter((mode) =>
      mode.name.toLowerCase().includes(examModeSearch.toLowerCase())
    );
  }, [examModeSearch]);

  const selectExamType = (type: { id: string; name: string }) => {
    setExamType(type.name);
    setShowExamTypeModal(false);
    setExamTypeSearch("");
  };

  const selectYear = (year: { id: string; name: string }) => {
    setSelectedYear(year.name);
    setShowYearModal(false);
    setYearSearch("");
  };

  const selectExamMode = (mode: { id: string; name: string }) => {
    setExamMode(mode.name);
    setShowExamModeModal(false);
    setExamModeSearch("");
  };

  const renderExamTypeItem = ({ item }: { item: { id: string; name: string } }) => (
    <Pressable
      style={styles.optionItem}
      onPress={() => selectExamType(item)}
    >
      <Text style={[styles.optionItemText, { color: colors.text }]}>
        {item.name}
      </Text>
      {examType === item.name && <Check size={18} color="#0284c7" />}
    </Pressable>
  );

  const renderYearItem = ({ item }: { item: { id: string; name: string } }) => (
    <Pressable
      style={styles.optionItem}
      onPress={() => selectYear(item)}
    >
      <Text style={[styles.optionItemText, { color: colors.text }]}>
        {item.name}
      </Text>
      {selectedYear === item.name && <Check size={18} color="#0284c7" />}
    </Pressable>
  );

  const renderExamModeItem = ({ item }: { item: { id: string; name: string; description: string; details: string[] } }) => {
    const isSelected = examMode === item.name;
    return (
      <Pressable
        style={[
          styles.examModeItem,
          isSelected && styles.examModeItemSelected,
          { borderColor: isSelected ? "#0284c7" : colors.subtitle }
        ]}
        onPress={() => selectExamMode(item)}
      >
        <View style={styles.examModeItemHeader}>
          <View style={styles.examModeItemTitleRow}>
            <View style={[styles.examModeIcon, { backgroundColor: isSelected ? "#0284c7" : "#e0f2fe" }]}>
              <Text style={[styles.examModeIconText, { color: isSelected ? "white" : "#0284c7" }]}>
                {item.id === "1" ? "📋" : "⚡"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.examModeItemTitle, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.examModeItemDescription, { color: colors.subtitle }]}>
                {item.description}
              </Text>
            </View>
            {isSelected && (
              <View style={styles.checkBadge}>
                <Check size={16} color="white" />
              </View>
            )}
          </View>
        </View>
        <View style={styles.examModeDetailsContainer}>
          {item.details.map((detail, index) => (
            <View key={index} style={styles.examModeDetailRow}>
              <View style={[styles.detailDot, { backgroundColor: isSelected ? "#0284c7" : colors.subtitle }]} />
              <Text style={[styles.examModeDetailText, { color: colors.subtitle }]}>
                {detail}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Generador
        </Text>
        <Pressable onPress={toggleDarkMode} style={styles.notification}>
          {darkMode ? (
            <Sun size={22} color={colors.text} />
          ) : (
            <Moon size={22} color={colors.text} />
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <View style={styles.titleIconContainer}>
                <Calendar size={26} color="#0284c7" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.mainTitle, { color: colors.text }]}>
                  Exámenes por año
                </Text>
                <Text style={[styles.subtitle, { color: colors.subtitle }]}>
                  Realiza exámenes históricos de años específicos
                </Text>
              </View>
            </View>
          </View>

          {/* Exam Details Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Detalles del Examen
            </Text>

            {/* Tipo de Examen */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.subtitle }]}>
                Tipo de examen <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.subtitle,
                    opacity: examTypesLoading ? 0.7 : 1,
                  }
                ]}
                onPress={() => !examTypesLoading && setShowExamTypeModal(true)}
                disabled={examTypesLoading}
              >
                <Text style={[styles.selectorText, examType ? { color: colors.text } : { color: colors.subtitle }]}>
                  {examTypesLoading ? "Cargando..." : (examType || "Selecciona el tipo de examen")}
                </Text>
                <ChevronDown size={20} color={colors.subtitle} />
              </Pressable>
            </View>

            {/* Año del Examen */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.subtitle }]}>
                Año del examen <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.subtitle,
                    opacity: yearsLoading ? 0.7 : 1,
                  }
                ]}
                onPress={() => !yearsLoading && setShowYearModal(true)}
                disabled={yearsLoading}
              >
                <Text style={[styles.selectorText, selectedYear ? { color: colors.text } : { color: colors.subtitle }]}>
                  {yearsLoading ? "Cargando..." : (selectedYear || "Selecciona el año")}
                </Text>
                <ChevronDown size={20} color={colors.subtitle} />
              </Pressable>
              {selectedYear && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => setSelectedYear("")}
                >
                  <X size={16} color="#ef4444" />
                  <Text style={styles.clearButtonText}>Limpiar</Text>
                </Pressable>
              )}
            </View>

            {/* Modo de Examen */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.subtitle }]}>
                Modo de examen <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.subtitle }]}
                onPress={() => setShowExamModeModal(true)}
              >
                <Text style={[styles.selectorText, examMode ? { color: colors.text } : { color: colors.subtitle }]}>
                  {examMode || "Selecciona el modo de examen"}
                </Text>
                <ChevronDown size={20} color={colors.subtitle} />
              </Pressable>
            </View>
          </View>

          {/* Exam Type Modal */}
          <Modal
            visible={showExamTypeModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowExamTypeModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Tipo de Examen
                  </Text>
                  <Pressable onPress={() => setShowExamTypeModal(false)}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={[styles.searchContainer, { borderBottomColor: colors.subtitle, marginHorizontal: 15 }]}>
                  <Search size={18} color={colors.subtitle} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar..."
                    placeholderTextColor={colors.subtitle}
                    value={examTypeSearch}
                    onChangeText={setExamTypeSearch}
                  />
                </View>

                <FlatList
                  data={filteredExamTypes}
                  renderItem={renderExamTypeItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingHorizontal: 15 }}
                  ListEmptyComponent={() => (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      {examTypesLoading ? (
                        <ActivityIndicator size="small" color="#0284c7" />
                      ) : (
                        <Text style={{ color: colors.subtitle }}>No se encontraron tipos de examen</Text>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>
          </Modal>

          {/* Year Modal */}
          <Modal
            visible={showYearModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowYearModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Seleccionar Año
                  </Text>
                  <Pressable onPress={() => setShowYearModal(false)}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={[styles.searchContainer, { borderBottomColor: colors.subtitle, marginHorizontal: 15 }]}>
                  <Search size={18} color={colors.subtitle} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar año..."
                    placeholderTextColor={colors.subtitle}
                    value={yearSearch}
                    onChangeText={setYearSearch}
                  />
                </View>

                <FlatList
                  data={filteredYears}
                  renderItem={renderYearItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingHorizontal: 15 }}
                  ListEmptyComponent={() => (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      {yearsLoading ? (
                        <ActivityIndicator size="small" color="#0284c7" />
                      ) : (
                        <Text style={{ color: colors.subtitle }}>No se encontraron años disponibles</Text>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>
          </Modal>

          {/* Exam Mode Modal */}
          <Modal
            visible={showExamModeModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowExamModeModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                      Modo de Examen
                    </Text>
                    <Text style={[styles.modalSubtitle, { color: colors.subtitle }]}>
                      Selecciona cómo quieres recibir los resultados
                    </Text>
                  </View>
                  <Pressable onPress={() => setShowExamModeModal(false)}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <FlatList
                  data={filteredExamModes}
                  renderItem={renderExamModeItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}
                />
              </View>
            </View>
          </Modal>


          {/* Configuration Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Configuración del examen
            </Text>

            {/* Tiempo límite */}
            <View style={styles.configItem}>
              <Text style={[styles.configLabel, { color: colors.subtitle }]}>
                Tiempo límite:
              </Text>
              <Text style={[styles.configValue, { color: colors.text }]}>
                200 minutos
              </Text>
            </View>

            {/* Preguntas */}
            <View style={styles.configItem}>
              <Text style={[styles.configLabel, { color: colors.subtitle }]}>
                Preguntas:
              </Text>
              <Text style={[styles.configValue, { color: colors.text }]}>
                Según examen original
              </Text>
            </View>
          </View>


          {/* Create Button */}
          <Pressable
            style={[
              styles.createButton,
              { backgroundColor: examType && selectedYear && examMode ? "#0284c7" : "#94a3b8" }
            ]}
            onPress={async () => {
              try {
                // 1. Fetch questions from /quiz/by-year
                const result = await fetchQuestionsByYear({
                  year: selectedYear,
                  exam: examType,
                }).unwrap();

                // 2. Decrypt encrypted fields
                const decryptedQuestions = result.map((question: any) => ({
                  ...question,
                  data: decryptLaravel(question.data),
                  justification: question.justification ? decryptLaravel(question.justification) : '',
                  distractorAnalysis: question.distractorAnalysis ? decryptLaravel(question.distractorAnalysis) : '',
                  reference: question.reference ? decryptLaravel(question.reference) : '',
                }));

                // 3. Create exam record
                let createdExamId = "";
                try {
                  const examRes = await createExam({
                    exam_type: "by_year",
                    title: `Examen por año - ${examType}`,
                    description: `Año ${selectedYear}`,
                    total_questions: decryptedQuestions.length,
                    started_at: new Date().toISOString(),
                  }).unwrap();
                  createdExamId = examRes?.exam || "";
                } catch (examErr) {
                  console.error("Error creating exam by year:", examErr);
                }

                // 4. Navigate with fetched questions
                router.push({
                  pathname: "/questions",
                  params: {
                    examId: createdExamId,
                    examType,
                    years: selectedYear,
                    examMode,
                    sourceKey: "by_year",
                    questionCount: decryptedQuestions.length.toString(),
                    timeLimit: "200",
                    questions: JSON.stringify(decryptedQuestions),
                  },
                });
              } catch (error) {
                console.error('Error fetching questions by year:', error);
              }
            }}
            disabled={!examType || !selectedYear || !examMode || isLoadingQuestions}
          >
            <Text style={styles.createButtonText}>
              {isLoadingQuestions ? "Cargando..." : "Iniciar Examen"}
            </Text>
          </Pressable>


          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />

        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
