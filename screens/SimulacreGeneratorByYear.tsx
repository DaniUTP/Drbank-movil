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
  Calendar,
  Check,
  ChevronDown,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react-native";

export default function SimulacreGeneratorByYearScreen() {
  const { colors, darkMode, toggleDarkMode } = useTheme();
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

  // Options
  const examTypes = [
    { id: "1", name: "Examen Ordinario" },
    { id: "2", name: "Examen Extraordinario" },
    { id: "3", name: "Simulacro de Práctica" },
    { id: "4", name: "Evaluación Diagnóstica" },
  ];

  const availableYears = Array.from({ length: 15 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { id: year.toString(), name: year.toString() };
  });

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
                style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.subtitle }]}
                onPress={() => setShowExamTypeModal(true)}
              >
                <Text style={[styles.selectorText, examType ? { color: colors.text } : { color: colors.subtitle }]}>
                  {examType || "Selecciona el tipo de examen"}
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
                style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.subtitle }]}
                onPress={() => setShowYearModal(true)}
              >
                <Text style={[styles.selectorText, selectedYear ? { color: colors.text } : { color: colors.subtitle }]}>
                  {selectedYear || "Selecciona el año"}
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
            onPress={() => {
              router.push({
                pathname: "/questions",
                params: {
                  examType,
                  specialty: "Examen por año",
                  examMode,
                  questionCount: "100",
                  timeLimit: "200",
                },
              });
            }}
            disabled={!examType || !selectedYear || !examMode}
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

  optional: {
    fontWeight: "400",
    fontSize: 12,
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

  configItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    marginBottom: 10,
  },

  configLabel: {
    fontSize: 15,
    fontWeight: "500",
  },

  configValue: {
    fontSize: 15,
    fontWeight: "600",
  },

  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
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
