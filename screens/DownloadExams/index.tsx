import Modal from "@/common/Modal";
import { useTheme } from "@/common/ThemeContext";
import ThemeToggle from "@/common/ThemeToggle";
import { useDownloadExamsMutation, useLazyGetExamQuery } from "@/services/question/exam.rtkq";
import { useRouter } from "expo-router";
import { ArrowLeft, FileText, Check, CheckCircle, Download, Search, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles";

interface ExamDownload {
  id: string;
  title: string;
  year: string;
  category: string;
  questions: number;
  downloaded: boolean;
}

export default function DownloadExamsScreen() {
  const { colors, darkMode } = useTheme();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());
  const [downloadedExams, setDownloadedExams] = useState<Set<string>>(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  
  // Consume API GET /quiz/exam with lazy query to refetch on mount
  const [getExam, { data: examData, isLoading, error }] = useLazyGetExamQuery();
  
  // Download exams mutation
  const [downloadExams, { isLoading: isDownloading }] = useDownloadExamsMutation();

  // Refetch data when screen mounts
  useEffect(() => {
    getExam({ limit: 100, page: 1 });
  }, []);

  // Transform API data to ExamDownload format
  const exams: ExamDownload[] = useMemo(() => {
    if (!examData) return [];
    
    // Handle different response structures
    const examList = Array.isArray(examData.data) ? examData.data : 
                    Array.isArray(examData) ? examData : 
                    (examData as any).exams || [];
    
    return examList.map((item: any, index: number) => ({
      id: item.uuid || item.id || (index + 1).toString(),
      title: item.title || item.name || "Examen sin título",
      year: item.year ? item.year.toString() : new Date().getFullYear().toString(),
      category: item.category || item.specialty || "General",
      questions: item.total_questions || item.question_count || 0,
      downloaded: downloadedExams.has(item.uuid || item.id || (index + 1).toString()),
    }));
  }, [examData, downloadedExams]);

  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchText.toLowerCase()) ||
      exam.category.toLowerCase().includes(searchText.toLowerCase()) ||
      exam.year.includes(searchText)
  );

  const toggleSelection = (examId: string) => {
    const newSelection = new Set(selectedExams);
    if (newSelection.has(examId)) {
      newSelection.delete(examId);
    } else {
      newSelection.add(examId);
    }
    setSelectedExams(newSelection);
  };

  const handleDownload = async (examId: string) => {
    try {
      const result = await downloadExams({ exams: [examId] }).unwrap();
      setDownloadedExams((prev) => new Set(prev).add(examId));
      setSelectedExams(new Set());
      setModalTitle("Descarga completada");
      setModalMessage(result.message || "El examen ha sido descargado exitosamente.");
      setModalVisible(true);
    } catch (error) {
      setModalTitle("Error");
      setModalMessage("Hubo un error al descargar el examen.");
      setModalVisible(true);
    }
  };

  const handleMultipleDownload = async () => {
    if (selectedExams.size === 0) {
      setModalTitle("Selecciona exámenes");
      setModalMessage("Por favor selecciona al menos un examen para descargar.");
      setModalVisible(true);
      return;
    }

    try {
      const result = await downloadExams({ exams: Array.from(selectedExams) }).unwrap();
      setDownloadedExams((prev) => {
        const newSet = new Set(prev);
        selectedExams.forEach((id) => newSet.add(id));
        return newSet;
      });
      setSelectedExams(new Set());
      setModalTitle("Descarga completada");
      setModalMessage(result.message || `${selectedExams.size} examen(es) han sido descargado(s) exitosamente.`);
      setModalVisible(true);
    } catch (error) {
      setModalTitle("Error");
      setModalMessage("Hubo un error al descargar los exámenes.");
      setModalVisible(true);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Descarga de Exámenes</Text>
          <ThemeToggle />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Cargando exámenes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Descarga de Exámenes</Text>
          <ThemeToggle />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Error al cargar exámenes</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Descarga de Exámenes</Text>
        <ThemeToggle />
      </View>

      <FlatList
        data={filteredExams}
        keyExtractor={(item) => item.id}
        renderItem={({ item: exam }) => (
          <View
            style={[
              styles.examCard,
              selectedExams.has(exam.id) && styles.examCardSelected,
              { backgroundColor: selectedExams.has(exam.id) ? (darkMode ? "#102b45" : "#f0f9ff") : colors.card, borderColor: selectedExams.has(exam.id) ? "#0284c7" : colors.inputBorder }
            ]}
          >
            <Pressable
              style={styles.checkboxContainer}
              onPress={() => !exam.downloaded && toggleSelection(exam.id)}
              disabled={exam.downloaded}
            >
              <View style={[
                styles.checkbox,
                selectedExams.has(exam.id) && styles.checkboxChecked
              ]}>
                {selectedExams.has(exam.id) && (
                  <Check size={16} color="white" />
                )}
              </View>
            </Pressable>
            <View style={[styles.examIconContainer, darkMode && { backgroundColor: "#102b45" }]}>
              <FileText size={24} color="#0284c7" />
            </View>
            <View style={styles.examInfo}>
              <Text style={[styles.examTitle, { color: colors.text }]} numberOfLines={2}>{exam.title}</Text>
              <Text style={[styles.examMeta, { color: colors.subtitle }]}>
                {exam.category} • {exam.questions} preguntas
              </Text>
            </View>
            {exam.downloaded ? (
              <View style={styles.downloadedBadge}>
                <CheckCircle size={20} color="#22c55e" />
              </View>
            ) : (
              <Pressable
                style={styles.downloadIconButton}
                onPress={() => handleDownload(exam.id)}
              >
                <Download size={20} color="#0284c7" />
              </Pressable>
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            {/* Search Input */}
            <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
              <Search size={20} color="#64748b" style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Buscar exámenes..."
                placeholderTextColor="#94a3b8"
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText.length > 0 && (
                <Pressable onPress={() => setSearchText("")}>
                  <X size={20} color="#64748b" />
                </Pressable>
              )}
            </View>

            {/* Selected Exams Info */}
            {selectedExams.size >= 2 && (
              <View style={[styles.selectedInfo, darkMode && { backgroundColor: "#102b45" }]}>
                <Text style={[styles.selectedText, darkMode && { color: "#7dd3fc" }]}>
                  {selectedExams.size} examen(es) seleccionado(s)
                </Text>
                <Pressable
                  style={styles.multiDownloadButton}
                  onPress={handleMultipleDownload}
                >
                  <Download size={20} color="white" />
                </Pressable>
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lista de Exámenes</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.subtitle }]}>No se encontraron exámenes</Text>
          </View>
        )}
      />
      
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        icon={<CheckCircle size={48} color="#22c55e" />}
      >
        <Text style={{ fontSize: 15, color: colors.subtitle, textAlign: "center", lineHeight: 22 }}>
          {modalMessage}
        </Text>
      </Modal>
    </SafeAreaView>
  );
}
