import Modal from "@/common/Modal";
import FilterTabs from "@/common/FilterTabs";
import SearchBar from "@/common/SearchBar";
import EmptyState from "@/common/EmptyState";
import { useTheme } from "@/common/ThemeContext";
import ThemeToggle from "@/common/ThemeToggle";
import { useDownloadExamsMutation, useLazyGetExamQuery } from "@/services/question/exam.rtkq";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, Check, CheckCircle, Download } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles";

interface ExamDownload {
  id: string;
  title: string;
  year: string;
  category: string;
  filterType: "simulation" | "by_year" | "smart_review";
  questions: number;
  completedAt?: string;
  dateGroup: string;
  downloaded: boolean;
}

type ExamDownloadListItem = { kind: "date"; id: string; title: string } | { kind: "exam"; id: string; exam: ExamDownload };

const PAGE_SIZE = 10;
type DownloadFilter = "all" | ExamDownload["filterType"];

const parseExamDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const cleanValue = value.trim();
  if (cleanValue.includes("/")) {
    const [datePart, timePart] = cleanValue.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    if (day && month && year) {
      const [hours = 0, minutes = 0, seconds = 0] = (timePart ?? "").split(":").map(Number);
      const parsed = new Date(year, month - 1, day, hours, minutes, seconds);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }
  const parsed = new Date(cleanValue.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatExamDate = (value?: string) => {
  const date = parseExamDate(value);
  if (!date) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const formatExamDateGroup = (value?: string) => {
  const date = parseExamDate(value);
  if (!date) return "Sin fecha registrada";
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Hoy";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Ayer";
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

export default function DownloadExamsScreen() {
  const { colors, darkMode } = useTheme();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());
  const [downloadedExams, setDownloadedExams] = useState<Set<string>>(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<DownloadFilter>("all");
  const [downloadTarget, setDownloadTarget] = useState<string | "multiple" | null>(null);
  
  // Consume API GET /quiz/exam with lazy query to refetch on mount
  const [getExam, { currentData: examData, isLoading, isFetching, error }] = useLazyGetExamQuery();
  
  // Download exams mutation
  const [downloadExams, { isLoading: isDownloading }] = useDownloadExamsMutation();

  // Fetch the selected page/filter exactly as the history screen does.
  useEffect(() => {
    void getExam({
      limit: PAGE_SIZE,
      page,
      ...(activeFilter !== "all" && {
        exam_type: activeFilter === "smart_review" ? "smart review" : activeFilter,
      }),
    });
  }, [activeFilter, getExam, page]);

  // Transform API data to ExamDownload format
  const exams: ExamDownload[] = useMemo(() => {
    if (!examData) return [];
    
    // Handle different response structures
    const examList = Array.isArray(examData.data) ? examData.data : 
                    Array.isArray(examData) ? examData : 
                    (examData as any).exams || [];
    
    return [...examList].sort((first: any, second: any) => {
      const firstDate = parseExamDate(first.completed_at || first.finished_at || first.date || first.created_at || first.started_at)?.getTime() ?? 0;
      const secondDate = parseExamDate(second.completed_at || second.finished_at || second.date || second.created_at || second.started_at)?.getTime() ?? 0;
      return secondDate - firstDate;
    }).map((item: any, index: number) => {
      const completedAt = item.completed_at || item.finished_at || item.date || item.created_at || item.started_at;
      const normalizedTitle = String(item.title || item.name || "").toLowerCase();
      const stage = String(item.smart_review_stage || item.stage || "").toLowerCase();
      const filterType: ExamDownload["filterType"] = item.id_study_block || stage || normalizedTitle.includes("repaso") || normalizedTitle.includes("posttest") || normalizedTitle.includes("evaluación inicial")
        ? "smart_review"
        : normalizedTitle.includes("año") || normalizedTitle.includes("year")
          ? "by_year"
          : "simulation";
      return {
      id: item.uuid || item.id || (index + 1).toString(),
      title: item.title || item.name || "Examen sin título",
      year: item.year ? item.year.toString() : new Date().getFullYear().toString(),
      category: item.category || item.specialty || "General",
      filterType,
      questions: item.total_questions || item.question_count || 0,
      completedAt,
      dateGroup: formatExamDateGroup(completedAt),
      downloaded: downloadedExams.has(item.uuid || item.id || (index + 1).toString()),
      };
    });
  }, [examData, downloadedExams]);

  const filteredExams = exams.filter(
    (exam) => (activeFilter === "all" || exam.filterType === activeFilter) && (
      exam.title.toLowerCase().includes(searchText.toLowerCase()) ||
      exam.category.toLowerCase().includes(searchText.toLowerCase()) ||
      exam.year.includes(searchText)
    )
  );
  const totalPages = Math.max(
    1,
    typeof examData?.total_pages === "number"
      ? examData.total_pages
      : typeof (examData as any)?.last_page === "number"
        ? (examData as any).last_page
        : 1,
  );
  const paginatedExams = filteredExams;
  const paginatedListItems = useMemo<ExamDownloadListItem[]>(() => {
    const items: ExamDownloadListItem[] = [];
    let currentGroup = "";
    paginatedExams.forEach(exam => {
      if (exam.dateGroup !== currentGroup) {
        currentGroup = exam.dateGroup;
        items.push({ kind: "date", id: `date-${page}-${currentGroup}`, title: currentGroup });
      }
      items.push({ kind: "exam", id: exam.id, exam });
    });
    return items;
  }, [page, paginatedExams]);
  useEffect(() => {
    setPage(1);
  }, [activeFilter, searchText]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSelection = (examId: string) => {
    const newSelection = new Set(selectedExams);
    if (newSelection.has(examId)) {
      newSelection.delete(examId);
    } else {
      newSelection.add(examId);
    }
    setSelectedExams(newSelection);
  };

  const handleMultipleDownload = async () => {
    if (selectedExams.size === 0) {
      setModalTitle("Selecciona exámenes");
      setModalMessage("Por favor selecciona al menos un examen para descargar.");
      setModalVisible(true);
      return;
    }

    if (isDownloading) return;
    setDownloadTarget("multiple");
    const examsToDownload = Array.from(selectedExams);
    try {
      const result = await downloadExams({ exams: examsToDownload }).unwrap();
      setDownloadedExams((prev) => {
        const newSet = new Set(prev);
        examsToDownload.forEach((id) => newSet.add(id));
        return newSet;
      });
      setSelectedExams(new Set());
      setModalTitle("Descarga completada");
      setModalMessage(result.message || `${examsToDownload.length} examen(es) han sido descargado(s) exitosamente.`);
      setModalVisible(true);
    } catch {
      setModalTitle("Error");
      setModalMessage("Hubo un error al descargar los exámenes.");
      setModalVisible(true);
    } finally {
      setDownloadTarget(null);
    }
  };

  if (isLoading || isFetching) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card }]}>
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Descarga de Exámenes</Text>
          <ThemeToggle />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Cargando exámenes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card }]}>
            <ArrowLeft size={22} color={colors.text} />
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
        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card }]}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Descarga de Exámenes</Text>
        <ThemeToggle />
      </View>

      <FlatList
        data={paginatedListItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => item.kind === "date" ? (
          <Text style={[styles.dateSectionTitle, { color: colors.text }]}>{item.title}</Text>
        ) : (() => { const exam = item.exam; return (
          <Pressable
            style={[
              styles.examCard,
              selectedExams.has(exam.id) && styles.examCardSelected,
              { backgroundColor: selectedExams.has(exam.id) ? (darkMode ? "#102b45" : "#f0f9ff") : colors.card, borderColor: selectedExams.has(exam.id) ? "#0284c7" : colors.inputBorder }
            ]}
            disabled={exam.downloaded || isDownloading}
            onPress={() => toggleSelection(exam.id)}
          >
            <Pressable
              style={styles.checkboxContainer}
              onPress={(event) => {
                event.stopPropagation();
                if (!exam.downloaded) toggleSelection(exam.id);
              }}
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
              <Text style={[styles.examTitle, { color: colors.text }]} numberOfLines={1}>{exam.title}</Text>
              <Text style={[styles.examMeta, { color: colors.subtitle }]}>
                {exam.category} • {exam.questions} preguntas
              </Text>
              <Text style={[styles.examDate, { color: colors.subtitle }]}>{formatExamDate(exam.completedAt)}</Text>
            </View>
            {exam.downloaded ? (
              <View style={styles.downloadedBadge}>
                <CheckCircle size={20} color="#22c55e" />
              </View>
            ) : null}
          </Pressable>
        ); })()}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Buscar exámenes..."
            />

            <FilterTabs
              tabs={[
                { key: "all", label: "Todos" },
                { key: "simulation", label: "Simulacros" },
                { key: "by_year", label: "Por Año" },
                { key: "smart_review", label: "Repaso adaptativo" },
              ]}
              activeTab={activeFilter}
              onTabChange={key => {
                setActiveFilter(key as DownloadFilter);
                setPage(1);
              }}
            />

          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <EmptyState
            icon={FileText}
            title="No se encontraron exámenes"
            subtitle="No hay exámenes registrados para este filtro de búsqueda"
          />
        )}
        ListFooterComponent={() => filteredExams.length > 0 ? (
          <View style={styles.pagination}>
            <Pressable accessibilityLabel="Página anterior" disabled={page <= 1 || isFetching} onPress={() => setPage(current => Math.max(1, current - 1))} style={[styles.paginationButton, (page <= 1 || isFetching) && styles.paginationButtonDisabled]}>
              <ChevronLeft size={16} color="#0284c7" />
              <Text style={styles.paginationButtonText}>Anterior</Text>
            </Pressable>
            <Text style={[styles.paginationIndicator, { color: colors.text }]}>Página {page} de {totalPages}</Text>
            <Pressable accessibilityLabel="Página siguiente" disabled={page >= totalPages || isFetching} onPress={() => setPage(current => Math.min(totalPages, current + 1))} style={[styles.paginationButton, (page >= totalPages || isFetching) && styles.paginationButtonDisabled]}>
              <Text style={styles.paginationButtonText}>Siguiente</Text>
              <ChevronRight size={16} color="#0284c7" />
            </Pressable>
          </View>
        ) : null}
      />

      {selectedExams.size > 0 && (
        <View style={[styles.downloadBar, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
          <View>
            <Text style={[styles.downloadBarTitle, { color: colors.text }]}>Descargar exámenes</Text>
            <Text style={[styles.downloadBarCount, { color: colors.subtitle }]}>
              {selectedExams.size} {selectedExams.size === 1 ? "seleccionado" : "seleccionados"}
            </Text>
          </View>
          <Pressable
            style={[styles.downloadBarButton, isDownloading && { opacity: 0.65 }]}
            disabled={isDownloading}
            onPress={handleMultipleDownload}
          >
            {downloadTarget === "multiple" ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Download size={18} color="white" />
            )}
            <Text style={styles.downloadBarButtonText}>
              {isDownloading ? "Descargando..." : "Descargar"}
            </Text>
          </Pressable>
        </View>
      )}
      
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
