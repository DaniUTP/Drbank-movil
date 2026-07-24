import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../components/ThemeContext";

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

export default function SimulacreByThemeScreen() {
  const { colors, darkMode, toggleDarkMode } = useTheme();
  const router = useRouter();

  // Form state
  const [medicalSpecialty, setMedicalSpecialty] = useState("");
  const [themeType, setThemeType] = useState("");
  const [specificTheme, setSpecificTheme] = useState("");
  const [examMode, setExamMode] = useState("");

  // Modal states
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [showThemeTypeModal, setShowThemeTypeModal] = useState(false);
  const [showSpecificThemeModal, setShowSpecificThemeModal] = useState(false);
  const [showExamModeModal, setShowExamModeModal] = useState(false);

  // Search states
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [themeTypeSearch, setThemeTypeSearch] = useState("");
  const [specificThemeSearch, setSpecificThemeSearch] = useState("");
  const [examModeSearch, setExamModeSearch] = useState("");

  // Options - Medical Specialties
  const medicalSpecialties = [
    { id: "1", name: "Medicina General" },
    { id: "2", name: "Cardiología" },
    { id: "3", name: "Pediatría" },
    { id: "4", name: "Ginecología y Obstetricia" },
    { id: "5", name: "Cirugía General" },
    { id: "6", name: "Medicina Interna" },
    { id: "7", name: "Neurología" },
    { id: "8", name: "Psiquiatría" },
    { id: "9", name: "Dermatología" },
    { id: "10", name: "Oftalmología" },
    { id: "11", name: "Otorrinolaringología" },
    { id: "12", name: "Ortopedia y Traumatología" },
    { id: "13", name: "Urología" },
    { id: "14", name: "Oncología" },
    { id: "15", name: "Medicina de Emergencia" },
  ];

  // Options - Theme Types
  const themeTypes = [
    { id: "1", name: "Anatomía" },
    { id: "2", name: "Fisiología" },
    { id: "3", name: "Farmacología" },
    { id: "4", name: "Patología" },
    { id: "5", name: "Semiología" },
    { id: "6", name: "Bioquímica" },
    { id: "7", name: "Microbiología" },
    { id: "8", name: "Inmunología" },
    { id: "9", name: "Genética" },
    { id: "10", name: "Epidemiología" },
  ];

  // Options - Specific Themes (would depend on previous selections in a real app)
  const specificThemes = [
    { id: "1", name: "Sistema Cardiovascular" },
    { id: "2", name: "Sistema Respiratorio" },
    { id: "3", name: "Sistema Digestivo" },
    { id: "4", name: "Sistema Nervioso" },
    { id: "5", name: "Sistema Endocrino" },
    { id: "6", name: "Sistema Renal" },
    { id: "7", name: "Sistema Hematopoyético" },
    { id: "8", name: "Sistema Musculoesquelético" },
    { id: "9", name: "Sistema Inmunológico" },
    { id: "10", name: "Sistema Reproductor" },
  ];

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
  const filteredSpecialties = useMemo(() => {
    return medicalSpecialties.filter((specialty) =>
      specialty.name.toLowerCase().includes(specialtySearch.toLowerCase())
    );
  }, [specialtySearch]);

  const filteredThemeTypes = useMemo(() => {
    return themeTypes.filter((type) =>
      type.name.toLowerCase().includes(themeTypeSearch.toLowerCase())
    );
  }, [themeTypeSearch]);

  const filteredSpecificThemes = useMemo(() => {
    return specificThemes.filter((theme) =>
      theme.name.toLowerCase().includes(specificThemeSearch.toLowerCase())
    );
  }, [specificThemeSearch]);

  const filteredExamModes = useMemo(() => {
    return examModes.filter((mode) =>
      mode.name.toLowerCase().includes(examModeSearch.toLowerCase())
    );
  }, [examModeSearch]);

  const selectSpecialty = (specialty: { id: string; name: string }) => {
    setMedicalSpecialty(specialty.name);
    setShowSpecialtyModal(false);
    setSpecialtySearch("");
    // Reset dependent selections
    setThemeType("");
    setSpecificTheme("");
  };

  const selectThemeType = (type: { id: string; name: string }) => {
    setThemeType(type.name);
    setShowThemeTypeModal(false);
    setThemeTypeSearch("");
    // Reset dependent selection
    setSpecificTheme("");
  };

  const selectSpecificTheme = (theme: { id: string; name: string }) => {
    setSpecificTheme(theme.name);
    setShowSpecificThemeModal(false);
    setSpecificThemeSearch("");
  };

  const selectExamMode = (mode: { id: string; name: string }) => {
    setExamMode(mode.name);
    setShowExamModeModal(false);
    setExamModeSearch("");
  };

  const renderSpecialtyItem = ({ item }: { item: { id: string; name: string } }) => (
    <Pressable
      style={styles.optionItem}
      onPress={() => selectSpecialty(item)}
    >
      <Text style={[styles.optionItemText, { color: colors.text }]}>
        {item.name}
      </Text>
      {medicalSpecialty === item.name && <Check size={18} color="#0284c7" />}
    </Pressable>
  );

  const renderThemeTypeItem = ({ item }: { item: { id: string; name: string } }) => (
    <Pressable
      style={styles.optionItem}
      onPress={() => selectThemeType(item)}
    >
      <Text style={[styles.optionItemText, { color: colors.text }]}>
        {item.name}
      </Text>
      {themeType === item.name && <Check size={18} color="#0284c7" />}
    </Pressable>
  );

  const renderSpecificThemeItem = ({ item }: { item: { id: string; name: string } }) => (
    <Pressable
      style={styles.optionItem}
      onPress={() => selectSpecificTheme(item)}
    >
      <Text style={[styles.optionItemText, { color: colors.text }]}>
        {item.name}
      </Text>
      {specificTheme === item.name && <Check size={18} color="#0284c7" />}
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

  const isFormValid = medicalSpecialty && themeType && specificTheme && examMode;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
              Selecciona el tema
            </Text>

            {/* Especialidad Médica */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.subtitle }]}>
                Especialidad médica <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.subtitle }]}
                onPress={() => setShowSpecialtyModal(true)}
              >
                <Text style={[styles.selectorText, medicalSpecialty ? { color: colors.text } : { color: colors.subtitle }]}>
                  {medicalSpecialty || "Selecciona la especialidad"}
                </Text>
                <ChevronDown size={20} color={colors.subtitle} />
              </Pressable>
            </View>

            {/* Tipo de Tema */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: medicalSpecialty ? colors.subtitle : "#94a3b8" }]}>
                Tipo de tema <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: medicalSpecialty ? colors.card : "#f1f5f9",
                    borderColor: medicalSpecialty ? colors.subtitle : "#e2e8f0",
                    opacity: medicalSpecialty ? 1 : 0.6,
                  },
                ]}
                onPress={() => medicalSpecialty && setShowThemeTypeModal(true)}
                disabled={!medicalSpecialty}
              >
                <Text style={[styles.selectorText, themeType ? { color: colors.text } : { color: medicalSpecialty ? colors.subtitle : "#94a3b8" }]}>
                  {themeType || (medicalSpecialty ? "Selecciona el tipo de tema" : "Selecciona primero la especialidad")}
                </Text>
                <ChevronDown size={20} color={medicalSpecialty ? colors.subtitle : "#94a3b8"} />
              </Pressable>
              {!medicalSpecialty && (
                <Text style={[styles.helperText, { color: "#94a3b8" }]}>
                  Debes seleccionar una especialidad primero
                </Text>
              )}
            </View>

            {/* Tema Específico */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: themeType ? colors.subtitle : "#94a3b8" }]}>
                Tema específico <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: themeType ? colors.card : "#f1f5f9",
                    borderColor: themeType ? colors.subtitle : "#e2e8f0",
                    opacity: themeType ? 1 : 0.6,
                  },
                ]}
                onPress={() => themeType && setShowSpecificThemeModal(true)}
                disabled={!themeType}
              >
                <Text style={[styles.selectorText, specificTheme ? { color: colors.text } : { color: themeType ? colors.subtitle : "#94a3b8" }]}>
                  {specificTheme || (themeType ? "Selecciona el tema específico" : "Selecciona primero el tipo de tema")}
                </Text>
                <ChevronDown size={20} color={themeType ? colors.subtitle : "#94a3b8"} />
              </Pressable>
              {!themeType && (
                <Text style={[styles.helperText, { color: "#94a3b8" }]}>
                  Debes seleccionar un tipo de tema primero
                </Text>
              )}
              {specificTheme && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => setSpecificTheme("")}
                >
                  <X size={16} color="#ef4444" />
                  <Text style={styles.clearButtonText}>Limpiar</Text>
                </Pressable>
              )}
            </View>

            {/* Modo de Examen */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: specificTheme ? colors.subtitle : "#94a3b8" }]}>
                Modo de examen <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: specificTheme ? colors.card : "#f1f5f9",
                    borderColor: specificTheme ? colors.subtitle : "#e2e8f0",
                    opacity: specificTheme ? 1 : 0.6,
                  },
                ]}
                onPress={() => specificTheme && setShowExamModeModal(true)}
                disabled={!specificTheme}
              >
                <Text style={[styles.selectorText, examMode ? { color: colors.text } : { color: specificTheme ? colors.subtitle : "#94a3b8" }]}>
                  {examMode || (specificTheme ? "Selecciona el modo de examen" : "Selecciona primero el tema específico")}
                </Text>
                <ChevronDown size={20} color={specificTheme ? colors.subtitle : "#94a3b8"} />
              </Pressable>
              {!specificTheme && (
                <Text style={[styles.helperText, { color: "#94a3b8" }]}>
                  Debes seleccionar un tema específico primero
                </Text>
              )}
            </View>
          </View>

          {/* Medical Specialty Modal */}
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
                    Especialidad Médica
                  </Text>
                  <Pressable onPress={() => setShowSpecialtyModal(false)}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={[styles.searchContainer, { borderBottomColor: colors.subtitle, marginHorizontal: 15 }]}>
                  <Search size={18} color={colors.subtitle} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar..."
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
                />
              </View>
            </View>
          </Modal>

          {/* Theme Type Modal */}
          <Modal
            visible={showThemeTypeModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowThemeTypeModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Tipo de Tema
                  </Text>
                  <Pressable onPress={() => setShowThemeTypeModal(false)}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={[styles.searchContainer, { borderBottomColor: colors.subtitle, marginHorizontal: 15 }]}>
                  <Search size={18} color={colors.subtitle} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar..."
                    placeholderTextColor={colors.subtitle}
                    value={themeTypeSearch}
                    onChangeText={setThemeTypeSearch}
                  />
                </View>

                <FlatList
                  data={filteredThemeTypes}
                  renderItem={renderThemeTypeItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingHorizontal: 15 }}
                />
              </View>
            </View>
          </Modal>

          {/* Specific Theme Modal */}
          <Modal
            visible={showSpecificThemeModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowSpecificThemeModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Tema Específico
                  </Text>
                  <Pressable onPress={() => setShowSpecificThemeModal(false)}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={[styles.searchContainer, { borderBottomColor: colors.subtitle, marginHorizontal: 15 }]}>
                  <Search size={18} color={colors.subtitle} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar..."
                    placeholderTextColor={colors.subtitle}
                    value={specificThemeSearch}
                    onChangeText={setSpecificThemeSearch}
                  />
                </View>

                <FlatList
                  data={filteredSpecificThemes}
                  renderItem={renderSpecificThemeItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingHorizontal: 15 }}
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
            onPress={() => {
              router.push({
                pathname: "/questions",
                params: {
                  examType: "Examen por tema",
                  specialty: `${medicalSpecialty} - ${themeType}`,
                  examMode,
                  questionCount: "20",
                  timeLimit: "30",
                },
              });
            }}
            disabled={!isFormValid}
          >
            <Text style={styles.createButtonText}>
              Iniciar Examen
            </Text>
          </Pressable>


          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />

        </ScrollView>
      </KeyboardAvoidingView>

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
  },

  backButton: {
    padding: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  notification: {
    padding: 8,
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  titleSection: {
    marginBottom: 24,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  titleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  mainTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },

  inputContainer: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },

  required: {
    color: "#ef4444",
  },

  helperText: {
    fontSize: 12,
    marginTop: 4,
  },

  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },

  selectorText: {
    fontSize: 15,
    flex: 1,
  },

  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    alignSelf: "flex-start",
  },

  clearButtonText: {
    color: "#ef4444",
    fontSize: 13,
    marginLeft: 4,
  },

  examModeItem: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "white",
  },

  examModeItemSelected: {
    backgroundColor: "#f0f9ff",
  },

  examModeItemHeader: {
    marginBottom: 12,
  },

  examModeItemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  examModeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  examModeIconText: {
    fontSize: 20,
  },

  examModeItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },

  examModeItemDescription: {
    fontSize: 13,
    fontWeight: "500",
  },

  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0284c7",
    justifyContent: "center",
    alignItems: "center",
  },

  examModeDetailsContainer: {
    paddingLeft: 56,
    gap: 8,
  },

  examModeDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  detailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  examModeDetailText: {
    fontSize: 13,
    flex: 1,
  },

  modalSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    maxHeight: "70%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },

  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  optionItemText: {
    fontSize: 15,
  },

  configItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  configLabel: {
    fontSize: 14,
  },

  configValue: {
    fontSize: 14,
    fontWeight: "500",
  },

  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },

  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  bottomSpacing: {
    height: 40,
  },
});
