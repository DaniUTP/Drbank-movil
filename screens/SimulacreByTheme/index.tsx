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
    BookOpen,
    Check,
    ChevronDown,
    Moon,
    Search,
    Sun,
    X,
} from "lucide-react-native";

import { useAreaQuery } from "../../services/question/area.rtkq";
import { useSpecialtyQuery } from "../../services/question/specialty.rtkq";
import { useExamTypeQuery } from "../../services/question/exam-type.rtkq";
import { useThemeQuery } from "../../services/question/theme.rtkq";
import { useLazyQuestionByThemeQuery } from "../../services/question/question.rtkq";
import { useExamMutation } from "../../services/question/exam.rtkq";
import { decryptLaravel } from "../../utils/encryption";

export default function SimulacreByThemeScreen() {
  const { colors, darkMode, toggleDarkMode } = useTheme();
  const [createExam] = useExamMutation();
  const [fetchQuestionsByTheme, { isLoading: isLoadingQuestions }] = useLazyQuestionByThemeQuery();
  const router = useRouter();

  // Form state
  const [area, setArea] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [examType, setExamType] = useState("");
  const [theme, setTheme] = useState("");
  const [examMode, setExamMode] = useState("");

  // RTK Query API calls
  const { data: areasData = [], isLoading: areasLoading } = useAreaQuery();

  // Find selected area ID to query specialties
  const selectedAreaId = useMemo(() => {
    return areasData.find((a: any) => a.name === area)?.id || 0;
  }, [areasData, area]);

  const { data: specialtiesData = [], isLoading: specialtiesLoading } = useSpecialtyQuery(
    { area: selectedAreaId },
    { skip: !selectedAreaId }
  );

  // Find selected specialty ID to query themes
  const selectedSpecialtyId = useMemo(() => {
    return specialtiesData.find((s: any) => s.name === specialty)?.id || 0;
  }, [specialtiesData, specialty]);

  const { data: examTypesData = [], isLoading: examTypesLoading } = useExamTypeQuery();

  const { data: themesData = [], isLoading: themesLoading } = useThemeQuery(
    { specialty: selectedSpecialtyId },
    { skip: !selectedSpecialtyId }
  );

  // Modal states
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [showExamTypeModal, setShowExamTypeModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showExamModeModal, setShowExamModeModal] = useState(false);

  // Search states
  const [areaSearch, setAreaSearch] = useState("");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [examTypeSearch, setExamTypeSearch] = useState("");
  const [themeSearch, setThemeSearch] = useState("");
  const [examModeSearch, setExamModeSearch] = useState("");

  // Mapped options
  const areas = useMemo(() => {
    return areasData.map((item: any) => ({ id: item.id.toString(), name: item.name }));
  }, [areasData]);

  const specialties = useMemo(() => {
    return specialtiesData.map((item: any) => ({ id: item.id.toString(), name: item.name }));
  }, [specialtiesData]);

  const examTypes = useMemo(() => {
    return examTypesData.map((item: any) => ({ id: item.exam, name: item.exam }));
  }, [examTypesData]);

  const themes = useMemo(() => {
    return themesData.map((item: any) => ({ id: item.id.toString(), name: item.theme }));
  }, [themesData]);

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

  // Filtered data for search
  const filteredAreas = useMemo(() => {
    return areas.filter((item) =>
      item.name.toLowerCase().includes(areaSearch.toLowerCase())
    );
  }, [areas, areaSearch]);

  const filteredSpecialties = useMemo(() => {
    return specialties.filter((item) =>
      item.name.toLowerCase().includes(specialtySearch.toLowerCase())
    );
  }, [specialties, specialtySearch]);

  const filteredExamTypes = useMemo(() => {
    return examTypes.filter((item) =>
      item.name.toLowerCase().includes(examTypeSearch.toLowerCase())
    );
  }, [examTypes, examTypeSearch]);

  const filteredThemes = useMemo(() => {
    return themes.filter((item) =>
      item.name.toLowerCase().includes(themeSearch.toLowerCase())
    );
  }, [themes, themeSearch]);

  const filteredExamModes = useMemo(() => {
    return examModes.filter((mode) =>
      mode.name.toLowerCase().includes(examModeSearch.toLowerCase())
    );
  }, [examModes, examModeSearch]);

  // Select handlers
  const selectArea = (item: { id: string; name: string }) => {
    setArea(item.name);
    setShowAreaModal(false);
    setAreaSearch("");
    // Reset dependent selections
    setSpecialty("");
    setTheme("");
  };

  const selectSpecialty = (item: { id: string; name: string }) => {
    setSpecialty(item.name);
    setShowSpecialtyModal(false);
    setSpecialtySearch("");
    // Reset dependent selection
    setTheme("");
  };

  const selectExamType = (item: { id: string; name: string }) => {
    setExamType(item.name);
    setShowExamTypeModal(false);
    setExamTypeSearch("");
  };

  const selectTheme = (item: { id: string; name: string }) => {
    setTheme(item.name);
    setShowThemeModal(false);
    setThemeSearch("");
  };

  const selectExamMode = (mode: { id: string; name: string }) => {
    setExamMode(mode.name);
    setShowExamModeModal(false);
    setExamModeSearch("");
  };

  // Render modal item helpers
  const renderAreaItem = ({ item }: { item: { id: string; name: string } }) => (
    <Pressable
      style={styles.optionItem}
      onPress={() => selectArea(item)}
    >
      <Text style={[styles.optionItemText, { color: colors.text }]}>
        {item.name}
      </Text>
      {area === item.name && <Check size={18} color="#0284c7" />}
    </Pressable>
  );

  const renderSpecialtyItem = ({ item }: { item: { id: string; name: string } }) => (
    <Pressable
      style={styles.optionItem}
      onPress={() => selectSpecialty(item)}
    >
      <Text style={[styles.optionItemText, { color: colors.text }]}>
        {item.name}
      </Text>
      {specialty === item.name && <Check size={18} color="#0284c7" />}
    </Pressable>
  );

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

  const renderThemeItem = ({ item }: { item: { id: string; name: string } }) => (
    <Pressable
      style={styles.optionItem}
      onPress={() => selectTheme(item)}
    >
      <Text style={[styles.optionItemText, { color: colors.text }]}>
        {item.name}
      </Text>
      {theme === item.name && <Check size={18} color="#0284c7" />}
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

  const isFormValid = area && specialty && examType && theme && examMode;

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
                <BookOpen size={26} color="#0284c7" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.mainTitle, { color: colors.text }]}>
                  Exámenes por tema
                </Text>
                <Text style={[styles.subtitle, { color: colors.subtitle }]}>
                  Estudia temas específicos de manera enfocada
                </Text>
              </View>
            </View>
          </View>

          {/* Exam Details Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Configurar Simulacro
            </Text>

            {/* 1. Área */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.subtitle }]}>
                Área <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.subtitle,
                    opacity: areasLoading ? 0.7 : 1,
                  }
                ]}
                onPress={() => !areasLoading && setShowAreaModal(true)}
                disabled={areasLoading}
              >
                <Text style={[styles.selectorText, area ? { color: colors.text } : { color: colors.subtitle }]}>
                  {areasLoading ? "Cargando..." : (area || "Selecciona el área")}
                </Text>
                <ChevronDown size={20} color={colors.subtitle} />
              </Pressable>
              {area && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => {
                    setArea("");
                    setSpecialty("");
                    setTheme("");
                  }}
                >
                  <X size={16} color="#ef4444" />
                  <Text style={styles.clearButtonText}>Limpiar</Text>
                </Pressable>
              )}
            </View>

            {/* 2. Especialidad Médica */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: (area && !specialtiesLoading) ? colors.subtitle : "#94a3b8" }]}>
                Especialidad <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: area ? colors.card : "#f1f5f9",
                    borderColor: (area && !specialtiesLoading) ? colors.subtitle : "#e2e8f0",
                    opacity: (area && !specialtiesLoading) ? 1 : 0.6,
                  },
                ]}
                onPress={() => area && !specialtiesLoading && setShowSpecialtyModal(true)}
                disabled={!area || specialtiesLoading}
              >
                <Text style={[styles.selectorText, specialty ? { color: colors.text } : { color: area ? colors.subtitle : "#94a3b8" }]}>
                  {specialtiesLoading ? "Cargando..." : (specialty || (area ? "Selecciona la especialidad" : "Selecciona primero el área"))}
                </Text>
                <ChevronDown size={20} color={area ? colors.subtitle : "#94a3b8"} />
              </Pressable>
              {!area && (
                <Text style={[styles.helperText, { color: "#94a3b8" }]}>
                  Debes seleccionar un área primero
                </Text>
              )}
              {specialty && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => {
                    setSpecialty("");
                    setTheme("");
                  }}
                >
                  <X size={16} color="#ef4444" />
                  <Text style={styles.clearButtonText}>Limpiar</Text>
                </Pressable>
              )}
            </View>

            {/* 3. Tipo de Examen */}
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
              {examType && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => setExamType("")}
                >
                  <X size={16} color="#ef4444" />
                  <Text style={styles.clearButtonText}>Limpiar</Text>
                </Pressable>
              )}
            </View>

            {/* 4. Tema */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: (specialty && !themesLoading) ? colors.subtitle : "#94a3b8" }]}>
                Tema <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: specialty ? colors.card : "#f1f5f9",
                    borderColor: (specialty && !themesLoading) ? colors.subtitle : "#e2e8f0",
                    opacity: (specialty && !themesLoading) ? 1 : 0.6,
                  },
                ]}
                onPress={() => specialty && !themesLoading && setShowThemeModal(true)}
                disabled={!specialty || themesLoading}
              >
                <Text style={[styles.selectorText, theme ? { color: colors.text } : { color: specialty ? colors.subtitle : "#94a3b8" }]}>
                  {themesLoading ? "Cargando..." : (theme || (specialty ? "Selecciona el tema" : "Selecciona primero la especialidad"))}
                </Text>
                <ChevronDown size={20} color={specialty ? colors.subtitle : "#94a3b8"} />
              </Pressable>
              {!specialty && (
                <Text style={[styles.helperText, { color: "#94a3b8" }]}>
                  Debes seleccionar una especialidad primero
                </Text>
              )}
              {theme && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => setTheme("")}
                >
                  <X size={16} color="#ef4444" />
                  <Text style={styles.clearButtonText}>Limpiar</Text>
                </Pressable>
              )}
            </View>

            {/* 5. Modo de Examen */}
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

          {/* Area Modal */}
          <Modal
            visible={showAreaModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAreaModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Seleccionar Área
                  </Text>
                  <Pressable onPress={() => setShowAreaModal(false)}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={[styles.searchContainer, { borderBottomColor: colors.subtitle, marginHorizontal: 15 }]}>
                  <Search size={18} color={colors.subtitle} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar área..."
                    placeholderTextColor={colors.subtitle}
                    value={areaSearch}
                    onChangeText={setAreaSearch}
                  />
                </View>

                <FlatList
                  data={filteredAreas}
                  renderItem={renderAreaItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingHorizontal: 15 }}
                  ListEmptyComponent={() => (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      {areasLoading ? (
                        <ActivityIndicator size="small" color="#0284c7" />
                      ) : (
                        <Text style={{ color: colors.subtitle }}>No se encontraron áreas</Text>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>
          </Modal>

          {/* Specialty Modal */}
          <Modal
            visible={showSpecialtyModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowSpecialtyModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Seleccionar Especialidad
                  </Text>
                  <Pressable onPress={() => setShowSpecialtyModal(false)}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={[styles.searchContainer, { borderBottomColor: colors.subtitle, marginHorizontal: 15 }]}>
                  <Search size={18} color={colors.subtitle} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar especialidad..."
                    placeholderTextColor={colors.subtitle}
                    value={specialtySearch}
                    onChangeText={setSpecialtySearch}
                  />
                </View>

                <FlatList
                  data={filteredSpecialties}
                  renderItem={renderSpecialtyItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingHorizontal: 15 }}
                  ListEmptyComponent={() => (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      {specialtiesLoading ? (
                        <ActivityIndicator size="small" color="#0284c7" />
                      ) : (
                        <Text style={{ color: colors.subtitle }}>No se encontraron especialidades</Text>
                      )}
                    </View>
                  )}
                />
              </View>
            </View>
          </Modal>

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
                    placeholder="Buscar tipo de examen..."
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

          {/* Theme Modal */}
          <Modal
            visible={showThemeModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowThemeModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Seleccionar Tema
                  </Text>
                  <Pressable onPress={() => setShowThemeModal(false)}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={[styles.searchContainer, { borderBottomColor: colors.subtitle, marginHorizontal: 15 }]}>
                  <Search size={18} color={colors.subtitle} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar tema..."
                    placeholderTextColor={colors.subtitle}
                    value={themeSearch}
                    onChangeText={setThemeSearch}
                  />
                </View>

                <FlatList
                  data={filteredThemes}
                  renderItem={renderThemeItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingHorizontal: 15 }}
                  ListEmptyComponent={() => (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      {themesLoading ? (
                        <ActivityIndicator size="small" color="#0284c7" />
                      ) : (
                        <Text style={{ color: colors.subtitle }}>No se encontraron temas</Text>
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
                30 minutos
              </Text>
            </View>

            {/* Preguntas */}
            <View style={styles.configItem}>
              <Text style={[styles.configLabel, { color: colors.subtitle }]}>
                Preguntas:
              </Text>
              <Text style={[styles.configValue, { color: colors.text }]}>
                Según tema seleccionado
              </Text>
            </View>
          </View>

          {/* Create Button */}
          <Pressable
            style={[
              styles.createButton,
              { backgroundColor: isFormValid ? "#0284c7" : "#94a3b8" }
            ]}
            onPress={async () => {
              try {
                // 1. Get selected theme ID from themes data
                const selectedThemeObj = themes.find(t => t.name === theme);
                const themeIdToSend = selectedThemeObj?.id || "0";

                // 2. Fetch questions from /quiz/question/theme
                const result = await fetchQuestionsByTheme({
                  id: themeIdToSend,
                }).unwrap();

                // 3. Decrypt encrypted fields
                const decryptedQuestions = result.map((question: any) => ({
                  ...question,
                  data: decryptLaravel(question.data),
                  justification: question.justification ? decryptLaravel(question.justification) : '',
                  distractorAnalysis: question.distractorAnalysis ? decryptLaravel(question.distractorAnalysis) : '',
                  reference: question.reference ? decryptLaravel(question.reference) : '',
                }));

                // 4. Create initial exam record
                let createdExamId = "";
                try {
                  const examRes = await createExam({
                    exam_type: "by_topic",
                    title: `Examen por tema - ${specialty}`,
                    description: `${theme} (${decryptedQuestions.length} preguntas)`,
                    total_questions: decryptedQuestions.length,
                    started_at: new Date().toISOString(),
                  }).unwrap();
                  createdExamId = examRes?.exam || "";
                } catch (examErr) {
                  console.error("Error creating exam by topic:", examErr);
                }

                // 5. Navigate to questions screen
                router.push({
                  pathname: "/questions",
                  params: {
                    examId: createdExamId,
                    examType: "Examen por tema",
                    area: area || undefined,
                    specialty: specialty || undefined,
                    theme: theme || undefined,
                    examMode,
                    sourceKey: "by_topic",
                    questionCount: decryptedQuestions.length.toString(),
                    timeLimit: "30",
                    questions: JSON.stringify(decryptedQuestions),
                  },
                });
              } catch (error) {
                console.error('Error fetching questions by theme:', error);
              }
            }}
            disabled={!isFormValid || isLoadingQuestions}
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
