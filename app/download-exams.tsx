import { useTheme } from "@/common/ThemeContext";
import { useRouter } from "expo-router";
import { ArrowLeft, Brain, Check, CheckCircle, Download, Search, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface ExamDownload {
  id: string;
  title: string;
  year: string;
  category: string;
  questions: number;
  downloaded: boolean;
}

export default function DownloadExamsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());
  const [exams, setExams] = useState<ExamDownload[]>([
    {
      id: "1",
      title: "Examen Ordinario 2024",
      year: "2024",
      category: "Medicina General",
      questions: 100,
      downloaded: false,
    },
    {
      id: "2",
      title: "Examen Extraordinario 2023",
      year: "2023",
      category: "Cardiología",
      questions: 80,
      downloaded: false,
    },
    {
      id: "3",
      title: "Simulacro Nacional 2024",
      year: "2024",
      category: "Simulacro",
      questions: 150,
      downloaded: true,
    },
    {
      id: "4",
      title: "Examen Ordinario 2022",
      year: "2022",
      category: "Pediatría",
      questions: 90,
      downloaded: false,
    },
    {
      id: "5",
      title: "Examen Extraordinario 2021",
      year: "2021",
      category: "Cirugía",
      questions: 85,
      downloaded: false,
    },
    {
      id: "6",
      title: "Examen Ordinario 2020",
      year: "2020",
      category: "Medicina Interna",
      questions: 95,
      downloaded: false,
    },
    {
      id: "7",
      title: "Simulacro Regional 2023",
      year: "2023",
      category: "Simulacro",
      questions: 120,
      downloaded: false,
    },
  ]);

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

  const handleDownload = (examId: string) => {
    setExams((prev) =>
      prev.map((exam) =>
        exam.id === examId ? { ...exam, downloaded: true } : exam
      )
    );
    setSelectedExams(new Set());
    Alert.alert("Descarga completada", "El examen ha sido descargado exitosamente.");
  };

  const handleMultipleDownload = () => {
    if (selectedExams.size === 0) {
      Alert.alert("Selecciona exámenes", "Por favor selecciona al menos un examen para descargar.");
      return;
    }

    setExams((prev) =>
      prev.map((exam) =>
        selectedExams.has(exam.id) ? { ...exam, downloaded: true } : exam
      )
    );
    setSelectedExams(new Set());
    Alert.alert(
      "Descarga completada",
      `${selectedExams.size} examen(es) han sido descargado(s) exitosamente.`
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Descarga de Exámenes
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Search size={20} color={colors.subtitle} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar exámenes..."
            placeholderTextColor={colors.subtitle}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <X size={20} color={colors.subtitle} />
            </TouchableOpacity>
          )}
        </View>

        {/* Selected Exams Info */}
        {selectedExams.size >= 2 && (
          <View style={[styles.selectedInfo, { backgroundColor: "#dbeafe" }]}>
            <Text style={styles.selectedText}>
              {selectedExams.size} examen(es) seleccionado(s)
            </Text>
            <TouchableOpacity
              style={styles.multiDownloadButton}
              onPress={handleMultipleDownload}
            >
              <Download size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Lista de Exámenes
        </Text>

        {filteredExams.map((exam) => (
          <View
            key={exam.id}
            style={[styles.examCard, { backgroundColor: colors.card }]}
          >
            <TouchableOpacity
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
            </TouchableOpacity>
            <View style={styles.examIconContainer}>
              <Brain size={24} color="#0284c7" />
            </View>
            <View style={styles.examInfo}>
              <Text style={[styles.examTitle, { color: colors.text }]}>
                {exam.title}
              </Text>
              <Text style={[styles.examMeta, { color: colors.subtitle }]}>
                {exam.category} • {exam.questions} preguntas
              </Text>
            </View>
            {exam.downloaded ? (
              <View style={styles.downloadedBadge}>
                <CheckCircle size={20} color="#22c55e" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.downloadIconButton}
                onPress={() => handleDownload(exam.id)}
              >
                <Download size={20} color="#0284c7" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  selectedText: {
    color: "#0284c7",
    fontSize: 14,
    fontWeight: "600",
  },
  multiDownloadButton: {
    backgroundColor: "#0284c7",
    borderRadius: 8,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  examCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  examIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  examMeta: {
    fontSize: 13,
  },
  downloadedBadge: {
    backgroundColor: "#dcfce7",
    borderRadius: 8,
    padding: 8,
  },
  downloadIconButton: {
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    padding: 8,
  },
});
