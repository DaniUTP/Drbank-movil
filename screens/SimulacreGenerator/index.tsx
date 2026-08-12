import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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
  Bell,
  Check,
  ChevronDown,
  Search,
  Settings,
  X,
} from "lucide-react-native";

export default function SimulacreGeneratorScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  // Form state
  const [examType, setExamType] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [theme, setTheme] = useState("");
  const [years, setYears] = useState("");
  const [examMode, setExamMode] = useState("");
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(30);

  // Modal states
  const [showExamTypeModal, setShowExamTypeModal] = useState(false);
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showYearsModal, setShowYearsModal] = useState(false);
  const [showExamModeModal, setShowExamModeModal] = useState(false);

  // Search states
  const [examTypeSearch, setExamTypeSearch] = useState("");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [themeSearch, setThemeSearch] = useState("");
  const [yearsSearch, setYearsSearch] = useState("");
  const [examModeSearch, setExamModeSearch] = useState("");

  // Options
  const examTypes = [
    { id: "1", name: "Examen Ordinario" },
    { id: "2", name: "Examen Extraordinario" },
    { id: "3", name: "Simulacro de Práctica" },
    { id: "4", name: "Evaluación Diagnóstica" },
  ];

  const specialties = [
    { id: "1", name: "Cardiología" },
    { id: "2", name: "Pediatría" },
    { id: "3", name: "Medicina Interna" },
    { id: "4", name: "Cirugía General" },
    { id: "5", name: "Ginecología y Obstetricia" },
    { id: "6", name: "Neurología" },
    { id: "7", name: "Psiquiatría" },
    { id: "8", name: "Dermatología" },
    { id: "9", name: "Oftalmología" },
    { id: "10", name: "Otorrinolaringología" },
    { id: "11", name: "Urología" },
    { id: "12", name: "Ortopedia y Traumatología" },
    { id: "13", name: "Anestesiología" },
    { id: "14", name: "Medicina de Emergencia" },
    { id: "15", name: "Radiología" },
    { id: "16", name: "Patología" },
    { id: "17", name: "Farmacología" },
    { id: "18", name: "Microbiología" },
    { id: "19", name: "Anatomía Patológica" },
    { id: "20", name: "Medicina Familiar" },
  ];

  const themes = [
    { id: "1", name: "Generalidades" },
    { id: "2", name: "Fisiopatología" },
    { id: "3", name: "Diagnóstico y Tratamiento" },
    { id: "4", name: "Casos Clínicos" },
    { id: "5", name: "Farmacología Aplicada" },
    { id: "6", name: "Prevención" },
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

  const filteredSpecialties = useMemo(() => {
    return specialties.filter((spec) =>
      spec.name.toLowerCase().includes(specialtySearch.toLowerCase())
    );
  }, [specialtySearch]);

  const filteredThemes = useMemo(() => {
    return themes.filter((t) =>
      t.name.toLowerCase().includes(themeSearch.toLowerCase())
    );
  }, [themeSearch]);

  const filteredYears = useMemo(() => {
    return availableYears.filter((year) =>
      year.name.includes(yearsSearch)
    );
  }, [yearsSearch]);

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

  const selectSpecialty = (spec: { id: string; name: string }) => {
    setSpecialty(spec.name);
    setShowSpecialtyModal(false);
    setSpecialtySearch("");
    setTheme(""); // Reset theme when specialty changes
  };

  const selectTheme = (t: { id: string; name: string }) => {
    setTheme(t.name);
    setShowThemeModal(false);
    setThemeSearch("");
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

  const renderYearItem = ({ item }: { item: { id: string; name: string } }) => {
    const isSelected = years.split(",").map(y => y.trim()).includes(item.name);
    return (
      <Pressable
        style={[styles.optionItem, isSelected && { backgroundColor: "#e0f2fe" }]}
        onPress={() => {
          const currentYears = years ? years.split(",").map(y => y.trim()).filter(y => y) : [];
          if (isSelected) {
            const newYears = currentYears.filter(y => y !== item.name);
            setYears(newYears.join(", "));
          } else {
            setYears([...currentYears, item.name].join(", "));
          }
        }}
      >
        <Text style={[styles.optionItemText, { color: colors.text }]}>
          {item.name}
        </Text>
        {isSelected && <Check size={18} color="#0284c7" />}
      </Pressable>
    );
  };

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
        <Pressable style={styles.notification}>
          <Bell size={22} color={colors.text} />
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
                <Settings size={26} color="#0284c7" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.mainTitle, { color: colors.text }]}>
                  Generador de Exámenes
                </Text>
                <Text style={[styles.subtitle, { color: colors.subtitle }]}>
                  Crea exámenes personalizados según tus necesidades
                </Text>
              </View>
            </View>
          </View>

          {/* Exam Details Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Detalles del Simulacro
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

            {/* Especialidades */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.subtitle }]}>
                Especialidades <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.subtitle }]}
                onPress={() => setShowSpecialtyModal(true)}
              >
                <Text style={[styles.selectorText, specialty ? { color: colors.text } : { color: colors.subtitle }]}>
                  {specialty || "Selecciona la especialidad"}
                </Text>
                <ChevronDown size={20} color={colors.subtitle} />
              </Pressable>
            </View>

            {/* Tema */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.subtitle }]}>
                Tema <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: colors.card,
                    borderColor: specialty ? colors.subtitle : "#e2e8f0",
                    opacity: specialty ? 1 : 0.7,
                  }
                ]}
                onPress={() => specialty && setShowThemeModal(true)}
                disabled={!specialty}
              >
                <Text style={[styles.selectorText, theme ? { color: colors.text } : { color: "#94a3b8" }]}>
                  {theme || "Selecciona un tema"}
                </Text>
                <ChevronDown size={20} color={specialty ? colors.subtitle : "#94a3b8"} />
              </Pressable>
            </View>

            {/* Años (Opcional) */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.subtitle }]}>
                Años <Text style={styles.optional}>(Opcional)</Text>
              </Text>
              <Pressable
                style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.subtitle }]}
                onPress={() => setShowYearsModal(true)}
              >
                <Text style={[styles.selectorText, years ? { color: colors.text } : { color: colors.subtitle }]}>
                  {years || "Selecciona los años (varios)"}
                </Text>
                <ChevronDown size={20} color={colors.subtitle} />
              </Pressable>
              {years && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => setYears("")}
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
                    Especialidades
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
                    Selecciona el Tema
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
                />
              </View>
            </View>
          </Modal>

          {/* Years Modal */}
          <Modal
            visible={showYearsModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowYearsModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Seleccionar Años
                  </Text>
                  <Pressable onPress={() => setShowYearsModal(false)}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={[styles.searchContainer, { borderBottomColor: colors.subtitle, marginHorizontal: 15 }]}>
                  <Search size={18} color={colors.subtitle} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar año..."
                    placeholderTextColor={colors.subtitle}
                    value={yearsSearch}
                    onChangeText={setYearsSearch}
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
              Configuración del Examen
            </Text>

            {/* Cantidad de Preguntas Slider */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.label, { color: colors.subtitle }]}>
                  Cantidad de preguntas
                </Text>
                <View style={[styles.valueBadge, { backgroundColor: "#e0f2fe" }]}>
                  <Text style={styles.valueBadgeText}>{questionCount}</Text>
                </View>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={100}
                step={1}
                value={questionCount}
                onValueChange={setQuestionCount}
                minimumTrackTintColor="#0284c7"
                maximumTrackTintColor="#e2e8f0"
                thumbTintColor="#0284c7"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>1</Text>
                <Text style={styles.sliderLabelText}>100</Text>
              </View>
            </View>

            {/* Límite de Tiempo Slider */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.label, { color: colors.subtitle }]}>
                  Límite de tiempo
                </Text>
                <View style={[styles.valueBadge, { backgroundColor: "#e0e7ff" }]}>
                  <Text style={styles.valueBadgeText}>{timeLimit} min</Text>
                </View>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={120}
                step={5}
                value={timeLimit}
                onValueChange={setTimeLimit}
                minimumTrackTintColor="#6366f1"
                maximumTrackTintColor="#e2e8f0"
                thumbTintColor="#6366f1"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>5 min</Text>
                <Text style={styles.sliderLabelText}>120 min</Text>
              </View>
            </View>
          </View>


          {/* Create Button */}
          <Pressable
            style={[
              styles.createButton,
              { backgroundColor: examType && specialty && theme && examMode ? "#0284c7" : "#94a3b8" }
            ]}
            onPress={() => {
              router.push({
                pathname: "/questions",
                params: {
                  examType,
                  specialty: `${specialty} - ${theme}`,
                  examMode,
                  questionCount: questionCount.toString(),
                  timeLimit: timeLimit.toString(),
                },
              });
            }}
            disabled={!examType || !specialty || !theme || !examMode}
          >
            <Text style={styles.createButtonText}>
              Crear Simulacro
            </Text>
          </Pressable>


          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />

        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
