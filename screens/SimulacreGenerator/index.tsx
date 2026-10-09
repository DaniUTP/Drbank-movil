import { parseApiError } from "@/utils/parseApiError";
import { useAreaQuery } from "@/services/question/area.rtkq";
import { useExamTypeQuery } from "@/services/question/exam-type.rtkq";
import { useSpecialtyQuery } from "@/services/question/specialty.rtkq";
import { useThemeQuery } from "@/services/question/theme.rtkq";
import { useYearQuery } from "@/services/question/year.rtkq";
import Slider from "@react-native-community/slider";
import { useFocusEffect, useRouter } from "expo-router";
import {
    ArrowLeft,
    Check,
    CheckCheck,
    ChevronDown,
    Search,
    Settings,
    X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../common/ThemeContext";
import ThemeToggle from "../../common/ThemeToggle";
import { useExamMutation } from "../../services/question/exam.rtkq";
import { useLazyQuestionQuery } from "../../services/question/question.rtkq";
import { styles } from "./styles";

export default function SimulacreGeneratorScreen() {
  const insets = useSafeAreaInsets();
  const { colors, darkMode } = useTheme();
  const router = useRouter();
  const [fetchQuestions] = useLazyQuestionQuery();
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  useFocusEffect(useCallback(() => {
    setIsCreatingExam(false);
  }, []));
  const [createExam] = useExamMutation();

  // Form state
  const [examType, setExamType] = useState("");
  const [areaIds, setAreaIds] = useState<number[]>([]);
  const [specialtyIds, setSpecialtyIds] = useState<number[]>([]);
  const [themeIds, setThemeIds] = useState<string[]>([]);
  const [selectedThemeYearFilter, setSelectedThemeYearFilter] = useState<string[] | null>(null);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [debouncedThemeFilters, setDebouncedThemeFilters] = useState(() => ({
    exam: examType,
    area: areaIds,
    specialty: specialtyIds,
    year: selectedYears,
  }));
  const [examMode, setExamMode] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(30);
  const isQuestionCountValid = Number.isInteger(questionCount) && questionCount > 0;
  const themeFilterKey = JSON.stringify([examType, areaIds, specialtyIds, selectedYears]);
  const debouncedThemeFilterKey = JSON.stringify([
    debouncedThemeFilters.exam,
    debouncedThemeFilters.area,
    debouncedThemeFilters.specialty,
    debouncedThemeFilters.year,
  ]);
  const areThemeFiltersSettled = themeFilterKey === debouncedThemeFilterKey;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedThemeFilters({
        exam: examType,
        area: areaIds,
        specialty: specialtyIds,
        year: selectedYears,
      });
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [examType, areaIds, specialtyIds, selectedYears]);

  // Each selector is keyed by the filters that constrain its available options.
  // currentData prevents cached data from a previous key appearing for a newer selection.
  const { data: examTypesData = [], isLoading: examTypesLoading } = useExamTypeQuery();
  const {
    currentData: areasCurrentData,
    isLoading: areasInitialLoading,
    isFetching: areasFetching,
  } = useAreaQuery(
    { exam: examType },
    { skip: !examType }
  );
  const areasData = useMemo(() => areasCurrentData ?? [], [areasCurrentData]);
  const areasLoading = areasInitialLoading || areasFetching;

  const {
    currentData: yearsCurrentData,
    isLoading: yearsInitialLoading,
    isFetching: yearsFetching,
  } = useYearQuery(
    {
      exam: examType,
      area: areaIds.length ? areaIds : undefined,
      specialty: specialtyIds.length ? specialtyIds : undefined,
      theme: themeIds.length ? themeIds : undefined,
    },
    { skip: !examType }
  );
  const yearsData = useMemo(() => yearsCurrentData ?? [], [yearsCurrentData]);
  const yearsLoading = yearsInitialLoading || yearsFetching;

  const {
    currentData: specialtiesCurrentData,
    isLoading: specialtiesInitialLoading,
    isFetching: specialtiesFetching,
  } = useSpecialtyQuery(
    {
      area: areaIds,
      exam: examType,
    },
    { skip: !examType || areaIds.length === 0 }
  );
  const specialtiesData = useMemo(() => specialtiesCurrentData ?? [], [specialtiesCurrentData]);
  const specialtiesLoading = specialtiesInitialLoading || specialtiesFetching;

  const {
    currentData: themesCurrentData,
    isLoading: themesInitialLoading,
    isFetching: themesFetching,
  } = useThemeQuery(
    {
      specialty: debouncedThemeFilters.specialty,
      area: debouncedThemeFilters.area,
      exam: debouncedThemeFilters.exam,
      ...(selectedThemeYearFilter ?? debouncedThemeFilters.year).length > 0
        ? { year: selectedThemeYearFilter ?? debouncedThemeFilters.year }
        : {},
    },
    {
      skip: (!areThemeFiltersSettled && themeIds.length === 0)
        || !debouncedThemeFilters.exam
        || debouncedThemeFilters.area.length === 0
        || debouncedThemeFilters.specialty.length === 0,
    }
  );
  const themesData = useMemo(() => themesCurrentData ?? [], [themesCurrentData]);
  const themesLoading = themesInitialLoading || themesFetching;

  // A narrower filter can invalidate previously selected years.
  useEffect(() => {
    if (!examType || yearsLoading || selectedYears.length === 0) return;
    const validYears = new Set(yearsData.map((item) => String(item.year)));
    const compatibleYears = selectedYears.filter((year) => validYears.has(year));
    if (compatibleYears.length !== selectedYears.length) {
      setSelectedYears(compatibleYears);
    }
  }, [examType, selectedYears, yearsData, yearsLoading]);

  // Modal states
  const [showExamTypeModal, setShowExamTypeModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showYearsModal, setShowYearsModal] = useState(false);
  const [showExamModeModal, setShowExamModeModal] = useState(false);

  // Search states
  const [examTypeSearch, setExamTypeSearch] = useState("");
  const [areaSearch, setAreaSearch] = useState("");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [themeSearch, setThemeSearch] = useState("");
  const [yearsSearch, setYearsSearch] = useState("");
  const [examModeSearch, setExamModeSearch] = useState("");

  // Transform API data to match expected format
  const examTypes = useMemo(
    () => examTypesData.map((item: any) => ({ id: String(item.exam), name: String(item.exam) })),
    [examTypesData]
  );
  const areas = useMemo(
    () => areasData.map((item) => ({ id: String(item.id), name: item.name })),
    [areasData]
  );
  const specialties = useMemo(
    () => specialtiesData.map((item) => ({ id: String(item.id), name: item.name })),
    [specialtiesData]
  );
  const themes = useMemo(
    () => themesData.map((item: any) => ({
      id: String(item.id ?? item.uuid ?? item.theme_uuid),
      name: item.theme,
    })),
    [themesData]
  );
  const selectedAreas = useMemo(
    () => areas.filter((item) => areaIds.includes(Number(item.id))),
    [areaIds, areas]
  );
  const selectedSpecialties = useMemo(
    () => specialties.filter((item) => specialtyIds.includes(Number(item.id))),
    [specialties, specialtyIds]
  );
  const selectedThemes = useMemo(
    () => themes.filter((item) => themeIds.includes(item.id)),
    [themeIds, themes]
  );
  const formatSelection = (items: { name: string }[], placeholder: string, selectionCount = items.length) => {
    if (selectionCount === 0) return placeholder;
    if (items.length !== selectionCount) {
      return `${selectionCount} ${selectionCount === 1 ? "seleccionada" : "seleccionadas"}`;
    }
    return items.length === 1 ? items[0].name : `${items.length} seleccionadas`;
  };
  const availableYears = useMemo(
    () => yearsData.map((item) => ({ id: String(item.year), name: String(item.year) })),
    [yearsData]
  );

  const examModes = useMemo(() => [
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
  ], []);

  // Filtered data
  const filteredExamTypes = useMemo(() => {
    return examTypes.filter((type) =>
      type.name.toLowerCase().includes(examTypeSearch.toLowerCase())
    );
  }, [examTypeSearch, examTypes]);

  const filteredAreas = useMemo(() => {
    return areas.filter((a) =>
      a.name.toLowerCase().includes(areaSearch.toLowerCase())
    );
  }, [areaSearch, areas]);

  const filteredSpecialties = useMemo(() => {
    return specialties.filter((spec) =>
      spec.name.toLowerCase().includes(specialtySearch.toLowerCase())
    );
  }, [specialtySearch, specialties]);

  const filteredThemes = useMemo(() => {
    return themes.filter((t) =>
      t.name.toLowerCase().includes(themeSearch.toLowerCase())
    );
  }, [themeSearch, themes]);

  const filteredYears = useMemo(() => {
    return availableYears.filter((year) =>
      year.name.includes(yearsSearch)
    );
  }, [yearsSearch, availableYears]);

  const filteredExamModes = useMemo(() => {
    return examModes.filter((mode) =>
      mode.name.toLowerCase().includes(examModeSearch.toLowerCase())
    );
  }, [examModeSearch, examModes]);

  const selectExamType = (type: { id: string; name: string }) => {
    setExamType(type.name);
    setAreaIds([]);
    setSpecialtyIds([]);
    setThemeIds([]);
    setSelectedThemeYearFilter(null);
    setSelectedYears([]);
    setShowExamTypeModal(false);
    setExamTypeSearch("");
  };

  const selectArea = (a: { id: string; name: string }) => {
    const id = Number(a.id);
    setAreaIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]);
    setSpecialtyIds([]);
    setThemeIds([]);
    setSelectedThemeYearFilter(null);
  };

  const selectSpecialty = (spec: { id: string; name: string }) => {
    const id = Number(spec.id);
    setSpecialtyIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]);
    setThemeIds([]);
    setSelectedThemeYearFilter(null);
  };

  const selectTheme = (t: { id: string; name: string }) => {
    const isSelected = themeIds.includes(t.id);
    if (!isSelected && themeIds.length === 0) {
      setSelectedThemeYearFilter(debouncedThemeFilters.year);
    } else if (isSelected && themeIds.length === 1) {
      setSelectedThemeYearFilter(null);
    }
    setThemeIds((current) => isSelected
      ? current.filter((selectedId) => selectedId !== t.id)
      : [...current, t.id]);
  };

  const clearArea = () => {
    setAreaIds([]);
    setSpecialtyIds([]);
    setThemeIds([]);
    setSelectedThemeYearFilter(null);
  };

  const clearSpecialty = () => {
    setSpecialtyIds([]);
    setThemeIds([]);
    setSelectedThemeYearFilter(null);
  };

  const clearTheme = () => {
    setThemeIds([]);
    setSelectedThemeYearFilter(null);
  };

  const selectAllAreas = () => {
    setAreaIds((current) => Array.from(new Set([...current, ...filteredAreas.map((item) => Number(item.id))])));
    setSpecialtyIds([]);
    setThemeIds([]);
  };

  const selectAllSpecialties = () => {
    setSpecialtyIds((current) => Array.from(new Set([...current, ...filteredSpecialties.map((item) => Number(item.id))])));
    setThemeIds([]);
  };

  const selectAllThemes = () => {
    setThemeIds((current) => Array.from(new Set([...current, ...filteredThemes.map((item) => item.id)])));
  };

  const selectAllYears = () => {
    setSelectedYears((current) => Array.from(new Set([...current, ...filteredYears.map((item) => item.name)])));
  };

  const renderBulkSelectionActions = (
    hasOptions: boolean,
    hasSelection: boolean,
    onSelectAll: () => void,
    onClear: () => void
  ) => (
    <View style={styles.selectionActions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Seleccionar todas las opciones visibles"
        style={[styles.selectionAction, !hasOptions && styles.selectionActionDisabled]}
        disabled={!hasOptions}
        onPress={onSelectAll}
      >
        <CheckCheck size={17} color={hasOptions ? "#0284c7" : colors.subtitle} />
        <Text style={[styles.selectionActionText, { color: hasOptions ? "#0284c7" : colors.subtitle }]}>
          Seleccionar todo
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Limpiar selección"
        style={[styles.selectionAction, !hasSelection && styles.selectionActionDisabled]}
        disabled={!hasSelection}
        onPress={onClear}
      >
        <X size={17} color={hasSelection ? "#ef4444" : colors.subtitle} />
        <Text style={[styles.selectionActionText, { color: hasSelection ? "#ef4444" : colors.subtitle }]}>
          Limpiar
        </Text>
      </Pressable>
    </View>
  );

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

  const renderAreaItem = ({ item }: { item: { id: string; name: string } }) => (
    <Pressable
      style={styles.optionItem}
      onPress={() => selectArea(item)}
    >
      <Text style={[styles.optionItemText, { color: colors.text }]}>
        {item.name}
      </Text>
      {areaIds.includes(Number(item.id)) && <Check size={18} color="#0284c7" />}
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
      {specialtyIds.includes(Number(item.id)) && <Check size={18} color="#0284c7" />}
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
      {themeIds.includes(item.id) && <Check size={18} color="#0284c7" />}
    </Pressable>
  );

  const renderYearItem = ({ item }: { item: { id: string; name: string } }) => {
    const isSelected = selectedYears.includes(item.name);
    return (
      <Pressable
        style={styles.optionItem}
        onPress={() => {
          setSelectedYears((current) => isSelected
            ? current.filter((year) => year !== item.name)
            : [...current, item.name]);
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
          {
            borderColor: isSelected ? "#0284c7" : colors.inputBorder,
            backgroundColor: isSelected
              ? (darkMode ? "#164e63" : "#f0f9ff")
              : colors.card,
          }
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
              <Text style={[styles.examModeItemDescription, { color: darkMode && isSelected ? "#e2e8f0" : colors.subtitle }]}>
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
              <Text style={[styles.examModeDetailText, { color: darkMode && isSelected ? "#e2e8f0" : colors.subtitle }]}>
                {detail}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    );
  };

  const showAreasLoading = areasLoading && areaIds.length === 0;
  const showSpecialtiesLoading = specialtiesLoading && specialtyIds.length === 0;
  const showThemesLoading = themesLoading && themeIds.length === 0;
  const showYearsLoading = yearsLoading && selectedYears.length === 0;

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
        <ThemeToggle />
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
                style={[
                  styles.selector,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.inputBorder,
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

            {/* Área */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.subtitle }]}>
                Área <Text style={styles.optional}>(Opcional)</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.inputBorder,
                    opacity: showAreasLoading ? 0.7 : 1,
                  }
                ]}
                onPress={() => examType && !areasLoading && setShowAreaModal(true)}
                disabled={!examType || areasLoading}
              >
                <Text style={[styles.selectorText, areaIds.length ? { color: colors.text } : { color: colors.subtitle }]}>
                  {showAreasLoading
                    ? "Cargando..."
                    : formatSelection(
                      selectedAreas,
                      examType
                      ? (areas.length ? "Selecciona el área" : "No hay áreas compatibles")
                      : "Selecciona primero el tipo de examen",
                      areaIds.length
                    )}
                </Text>
                <ChevronDown size={20} color={colors.subtitle} />
              </Pressable>
            </View>

            {/* Especialidades */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: areaIds.length > 0 ? colors.subtitle : "#94a3b8" }]}>
                Especialidades <Text style={styles.optional}>(Opcional)</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.inputBorder,
                    opacity: showSpecialtiesLoading ? 0.7 : 1,
                  }
                ]}
                onPress={() => areaIds.length > 0 && !specialtiesLoading && setShowSpecialtyModal(true)}
                disabled={areaIds.length === 0 || specialtiesLoading}
              >
                <Text style={[styles.selectorText, specialtyIds.length ? { color: colors.text } : { color: "#94a3b8" }]}>
                  {showSpecialtiesLoading
                    ? "Cargando..."
                    : formatSelection(
                      selectedSpecialties,
                      areaIds.length > 0
                      ? (specialties.length ? "Selecciona la especialidad" : "No hay especialidades compatibles")
                      : "Selecciona primero el área",
                      specialtyIds.length
                    )}
                </Text>
                <ChevronDown size={20} color={areaIds.length > 0 ? colors.subtitle : "#94a3b8"} />
              </Pressable>
            </View>

            {/* Tema */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: specialtyIds.length > 0 ? colors.subtitle : "#94a3b8" }]}>
                Tema <Text style={styles.optional}>(Opcional)</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.inputBorder,
                    opacity: showThemesLoading ? 0.7 : 1,
                  }
                ]}
                onPress={() => specialtyIds.length > 0 && !themesLoading && setShowThemeModal(true)}
                disabled={specialtyIds.length === 0 || themesLoading}
              >
                <Text style={[styles.selectorText, themeIds.length ? { color: colors.text } : { color: "#94a3b8" }]}>
                  {showThemesLoading
                    ? "Cargando..."
                    : formatSelection(
                      selectedThemes,
                      specialtyIds.length > 0
                      ? (themes.length ? "Selecciona un tema" : "No hay temas compatibles")
                      : "Selecciona primero la especialidad",
                      themeIds.length
                    )}
                </Text>
                <ChevronDown size={20} color={specialtyIds.length > 0 ? colors.subtitle : "#94a3b8"} />
              </Pressable>
            </View>

            {/* Año (Opcional) */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: examType ? colors.subtitle : "#94a3b8" }]}>
                Año <Text style={styles.optional}>(Opcional)</Text>
              </Text>
              <Pressable
                style={[
                  styles.selector,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.inputBorder,
                    opacity: showYearsLoading ? 0.7 : 1,
                  }
                ]}
                onPress={() => examType && !yearsLoading && setShowYearsModal(true)}
                disabled={!examType || yearsLoading}
              >
                <Text style={[styles.selectorText, selectedYears.length ? { color: colors.text } : { color: examType ? colors.subtitle : "#94a3b8" }]}>
                  {showYearsLoading
                    ? "Cargando..."
                    : (selectedYears.length === 1
                      ? selectedYears[0]
                      : selectedYears.length > 1
                        ? `${selectedYears.length} años seleccionados`
                        : examType
                          ? (availableYears.length ? "Selecciona uno o varios años" : "No hay años compatibles")
                          : "Selecciona primero el tipo de examen")}
                </Text>
                <ChevronDown size={20} color={examType ? colors.subtitle : "#94a3b8"} />
              </Pressable>
            </View>

            {/* Modo de Examen */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.subtitle }]}>
                Modo de examen <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}
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
              <View style={[styles.modalContent, { backgroundColor: colors.background, marginBottom: insets.bottom }]}>
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

          {/* Area Modal */}
          <Modal
            visible={showAreaModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAreaModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background, marginBottom: insets.bottom }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Área
                  </Text>
                  <Pressable onPress={() => setShowAreaModal(false)}>
                    <X size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={[styles.searchContainer, { borderBottomColor: colors.subtitle, marginHorizontal: 15 }]}>
                  <Search size={18} color={colors.subtitle} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar..."
                    placeholderTextColor={colors.subtitle}
                    value={areaSearch}
                    onChangeText={setAreaSearch}
                  />
                </View>

                {renderBulkSelectionActions(
                  filteredAreas.length > 0,
                  areaIds.length > 0,
                  selectAllAreas,
                  clearArea
                )}

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
              <View style={[styles.modalContent, { backgroundColor: colors.background, marginBottom: insets.bottom }]}>
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

                {renderBulkSelectionActions(
                  filteredSpecialties.length > 0,
                  specialtyIds.length > 0,
                  selectAllSpecialties,
                  clearSpecialty
                )}

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

          {/* Theme Modal */}
          <Modal
            visible={showThemeModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowThemeModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background, marginBottom: insets.bottom }]}>
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

                {renderBulkSelectionActions(
                  filteredThemes.length > 0,
                  themeIds.length > 0,
                  selectAllThemes,
                  clearTheme
                )}

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

          {/* Years Modal */}
          <Modal
            visible={showYearsModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowYearsModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background, marginBottom: insets.bottom }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Seleccionar Año
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

                {renderBulkSelectionActions(
                  filteredYears.length > 0,
                  selectedYears.length > 0,
                  selectAllYears,
                  () => setSelectedYears([])
                )}

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
              <View style={[styles.modalContent, { backgroundColor: colors.background, marginBottom: insets.bottom }]}>
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
                minimumValue={5}
                maximumValue={100}
                step={1}
                value={questionCount}
                onValueChange={setQuestionCount}
                minimumTrackTintColor="#0284c7"
                maximumTrackTintColor="#e2e8f0"
                thumbTintColor="#0284c7"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>5</Text>
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
              { backgroundColor: examType && examMode && isQuestionCountValid ? "#0284c7" : "#94a3b8" }
            ]}
            onPress={async () => {
              if (!examType || !isQuestionCountValid) return;
              setIsCreatingExam(true);
              const requestBody = {
                area: areaIds.length ? areaIds : undefined,
                specialty: specialtyIds.length ? specialtyIds : undefined,
                theme: themeIds.length ? themeIds : undefined,
                year: selectedYears.length > 0 ? selectedYears : undefined,
                exam: examType,
                count: questionCount,
              };
              
              try {
                const result = await fetchQuestions(requestBody).unwrap();
                
                const questions = result;

                // 2. Call POST /quiz/exam to create initial exam record
                let createdExamId = "";
                try {
                  const examRes = await createExam({
                    exam_type: "simulation",
                    title: `Simulacro - ${examType}`,
                    description: `${selectedSpecialties.map((item) => item.name).join(", ") || "General"} (${questions.length} preguntas)`,
                    total_questions: questions.length,
                    started_at: new Date().toISOString(),
                  }).unwrap();
                  createdExamId = examRes?.exam || "";
                } catch (examErr) {
                  console.error("Error creating exam record:", examErr);
                }
                
                router.push({
                  pathname: "/questions",
                  params: {
                    examId: createdExamId,
                    examType,
                    area: selectedAreas.map((item) => item.name).join(", ") || undefined,
                    specialty: selectedSpecialties.map((item) => item.name).join(", ") || undefined,
                    theme: selectedThemes.map((item) => item.name).join(", ") || undefined,
                    years: selectedYears.length ? selectedYears.join(", ") : undefined,
                    questionCount: questionCount.toString(),
                    timeLimit: timeLimit.toString(),
                    examMode,
                    sourceKey: "simulation",
                    questions: JSON.stringify(questions),
                  },
                });
              } catch (error) {
                console.error('Error fetching questions:', error);
                Alert.alert("Error al generar simulacro", parseApiError(error, "No se pudieron obtener las preguntas. Inténtalo nuevamente."));
                setIsCreatingExam(false);
              }
            }}
            disabled={!examType || !examMode || !isQuestionCountValid || isCreatingExam}
          >
            {isCreatingExam && <ActivityIndicator size="small" color="#ffffff" />}
            <Text style={styles.createButtonText}>
              {isCreatingExam ? "Creando..." : "Crear Simulacro"}
            </Text>
          </Pressable>


          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />

        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
