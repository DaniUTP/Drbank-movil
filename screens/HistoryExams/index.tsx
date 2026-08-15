import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  TrendingUp
} from "lucide-react-native";
import React, { memo, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../common/EmptyState";
import FilterTabs from "../../common/FilterTabs";
import SearchBar from "../../common/SearchBar";
import { useTheme } from "../../common/ThemeContext";
import { styles } from "./styles";

import { useGetExamQuery } from "@/services/question/exam.rtkq";
import { ExamHistoryItemDTO, ExamSummaryItem } from "@/types/question/exam.dto";

// ============================================
// TYPES
// ============================================
export interface FormattedExam {
  id: string;
  dateString: string;
  type: string;
  category: string;
  score: number;
  questions: number;
  correctAnswers: number;
  timeSpentSeconds: number;
  status?: string;
  startedAt?: string;
  examSummary?: ExamSummaryItem[];
  recommendation?: string;
}

// ============================================
// UTILS
// ============================================
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

interface ExamGroup {
  title: string;
  data: FormattedExam[];
}

// ============================================
// MEMOIZED EXAM CARD COMPONENT
// ============================================
interface ExamCardProps {
  exam: FormattedExam;
  colors: ReturnType<typeof useTheme>["colors"];
  isPressed: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}

const ExamCard = memo<ExamCardProps>(function ExamCard({ exam, colors, isPressed, onPressIn, onPressOut }) {
  const router = useRouter();
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "#22c55e20";
    if (score >= 60) return "#f59e0b20";
    return "#ef444420";
  };

  const getTypeIcon = () => {
    const t = (exam.category || exam.type || "").toLowerCase();
    if (t.includes("año") || t.includes("year")) {
      return <Calendar size={24} color="#06b6d4" />;
    }
    if (t.includes("tema") || t.includes("theme") || t.includes("extra")) {
      return <FileText size={24} color="#f43f5e" />;
    }
    return <Brain size={24} color="#8b5cf6" />;
  };

  const getTypeBgColor = () => {
    const t = (exam.category || exam.type || "").toLowerCase();
    if (t.includes("año") || t.includes("year")) {
      return "#06b6d420";
    }
    if (t.includes("tema") || t.includes("theme") || t.includes("extra")) {
      return "#f43f5e20";
    }
    return "#8b5cf620";
  };

  const formatTime = (seconds: number) => {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const scoreColor = getScoreColor(exam.score);
  const scoreBgColor = getScoreBgColor(exam.score);

  return (
    <Pressable 
      style={[
        styles.examCard, 
        { backgroundColor: colors.card, borderWidth: 2, borderColor: "#e2e8f0" },
        isPressed && { borderColor: "#0284c7", backgroundColor: "#f0f9ff" }
      ]}
      onPress={() => router.push({
        pathname: "/history-detail",
        params: {
          id: exam.id,
          correct: exam.correctAnswers.toString(),
          total: exam.questions.toString(),
          percentage: exam.score.toString(),
          examType: exam.type,
          specialty: exam.category,
          timeSpent: exam.timeSpentSeconds.toString(),
          examSummary: JSON.stringify(exam.examSummary || []),
          recommendation: exam.recommendation || ""
        }
      })}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <View
        style={[
          styles.examIconContainer,
          { backgroundColor: getTypeBgColor() },
        ]}
      >
        {getTypeIcon()}
      </View>
      <View style={styles.examInfo}>
        <Text style={[styles.examType, { color: colors.text }]} numberOfLines={1}>
          {exam.category}
        </Text>
        <View style={styles.examMeta}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Clock size={12} color={colors.subtitle} />
            <Text style={{ color: colors.subtitle, fontSize: 12 }}>
              {formatTime(exam.timeSpentSeconds)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <CheckCircle size={12} color={colors.subtitle} />
            <Text style={{ color: colors.subtitle, fontSize: 12 }}>
              {exam.correctAnswers}/{exam.questions} correctas
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.examScoreContainer}>
        <View
          style={[
            {
              backgroundColor: scoreBgColor,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            },
          ]}
        >
          <Text style={[styles.examScore, { color: scoreColor }]}>
            {exam.score}%
          </Text>
        </View>
        <Text style={[styles.examQuestions, { color: colors.subtitle }]}>
          {exam.questions} preg.
        </Text>
      </View>
    </Pressable>
  );
});

ExamCard.displayName = "ExamCard";

// ============================================
// MAIN SCREEN COMPONENT
// ============================================
type FilterType = "all" | "simulation" | "by_year" | "by_topic";

const PAGE_LIMIT = 10;

export default function HistoryExamsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [pressedCard, setPressedCard] = useState<string | null>(null);

  // Prepare query payload
  const queryParams = useMemo(() => {
    const params: { limit: number; page: number; exam_type?: string } = {
      limit: PAGE_LIMIT,
      page,
    };
    if (activeFilter !== "all") {
      params.exam_type = activeFilter;
    }
    return params;
  }, [page, activeFilter]);

  // Consume API GET /quiz/exam with params
  const {
    data: examDataRaw,
    isLoading,
    isFetching
  } = useGetExamQuery(queryParams);

  // Extract raw exam list
  const rawList: ExamHistoryItemDTO[] = useMemo(() => {
    if (!examDataRaw) return [];
    if (Array.isArray(examDataRaw.data)) return examDataRaw.data;
    if (Array.isArray(examDataRaw)) return examDataRaw;
    if (Array.isArray((examDataRaw as any).exams)) return (examDataRaw as any).exams;
    return [];
  }, [examDataRaw]);

  // Last page from pagination
  const lastPage = useMemo(() => {
    if (examDataRaw && typeof examDataRaw.total_pages === 'number' && examDataRaw.total_pages > 0) {
      return examDataRaw.total_pages;
    }
    if (examDataRaw && typeof (examDataRaw as any).last_page === 'number' && (examDataRaw as any).last_page > 0) {
      return (examDataRaw as any).last_page;
    }
    return rawList.length === PAGE_LIMIT ? page + 1 : page;
  }, [examDataRaw, rawList.length, page]);

  const hasNextPage = page < lastPage;
  const hasPrevPage = page > 1;

  // Custom date parser for DD/MM/YYYY HH:mm:ss and standard ISO formats
  const parseCustomDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const cleanStr = dateStr.trim();

    if (cleanStr.includes("/")) {
      const [datePart, timePart] = cleanStr.split(" ");
      const dParts = datePart.split("/");
      if (dParts.length === 3) {
        const day = parseInt(dParts[0], 10);
        const month = parseInt(dParts[1], 10) - 1;
        const year = parseInt(dParts[2], 10);

        let hours = 0;
        let minutes = 0;
        let seconds = 0;
        if (timePart) {
          const tParts = timePart.split(":");
          hours = parseInt(tParts[0], 10) || 0;
          minutes = parseInt(tParts[1], 10) || 0;
          seconds = parseInt(tParts[2], 10) || 0;
        }
        const d = new Date(year, month, day, hours, minutes, seconds);
        if (!isNaN(d.getTime())) return d;
      }
    }

    const standard = new Date(cleanStr);
    return isNaN(standard.getTime()) ? null : standard;
  };

  const formatDateGroup = (dateString?: string): string => {
    if (!dateString) return "Historial de Evaluaciones";
    const date = parseCustomDate(dateString);
    if (!date) return "Historial de Evaluaciones";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return "Hoy";

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Ayer";

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };
  console.log("data:",rawList);
  // Convert raw items into formatted items
  const formattedExams: FormattedExam[] = useMemo(() => {
    return rawList.map((item, index) => {
      const questions = Number(item.total_questions) || (Array.isArray(item.exam_summary) ? item.exam_summary.length : 0);
      const score = Math.round(Number(item.score_percentage) || 0);
      const correctAnswers = Array.isArray(item.exam_summary) && item.exam_summary.length > 0
        ? item.exam_summary.filter(s => (s.correct_answer || '').toLowerCase() === (s.response || '').toLowerCase()).length
        : Math.round((score / 100) * questions);
      const timeSpentSeconds = Number(item.time_spent) || 0;

      return {
        id: (item.uuid || (item as any).id || (index + 1)).toString(),
        dateString: formatDateGroup(item.started_at || item.completed_at),
        type: item.title?.toLowerCase().includes("año") ? "año" : item.title?.toLowerCase().includes("tema") ? "theme" : "simulacro",
        category: item.title || "Simulacro Médico",
        score,
        questions,
        correctAnswers,
        timeSpentSeconds,
        status: item.status,
        startedAt: item.started_at,
        examSummary: item.exam_summary,
        recommendation: (item as any).recommendation || ""
      };
    });
  }, [rawList]);

  // Filter by search query
  const filteredExams = useMemo(() => {
    if (!searchQuery.trim()) return formattedExams;
    const query = searchQuery.toLowerCase();
    return formattedExams.filter((exam) =>
      exam.category.toLowerCase().includes(query)
    );
  }, [formattedExams, searchQuery]);



  // Calculate stats
  const stats = useMemo(() => {
    const totalExams = (typeof examDataRaw?.total === 'number') ? examDataRaw.total : formattedExams.length;
    const avgScore = formattedExams.length > 0
      ? Math.round(formattedExams.reduce((acc, exam) => acc + exam.score, 0) / formattedExams.length)
      : 0;

    const totalSeconds = formattedExams.reduce((acc, exam) => acc + exam.timeSpentSeconds, 0);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    let formattedTime: string;
    if (hours > 0) {
      formattedTime = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      formattedTime = `${minutes}m ${seconds}s`;
    } else {
      formattedTime = `${seconds}s`;
    }

    return {
      totalExams: formatNumber(totalExams),
      avgScore,
      totalTime: formattedTime,
    };
  }, [examDataRaw, formattedExams]);

  // Group exams by date category
  const groupedExams = useMemo<ExamGroup[]>(() => {
    const groups: { [key: string]: FormattedExam[] } = {};

    filteredExams.forEach((exam) => {
      const key = exam.dateString;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(exam);
    });

    return Object.entries(groups).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filteredExams]);

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
  );

  // Filter tabs configuration
  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "simulation", label: "Simulacros" },
    { key: "by_year", label: "Por Año" },
    { key: "by_topic", label: "Por Tema" },
  ];

  const handleFilterChange = (key: string) => {
    setActiveFilter(key as FilterType);
    setPage(1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card }]}
        >
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Historial de Exámenes
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar exámenes..."
        />

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: "#7c3aed" }]}>
            <View style={[styles.statIcon, { backgroundColor: "#7c3aed15" }]}>
              <FileText size={20} color="#7c3aed" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalExams}</Text>
            <Text style={[styles.statLabel, { color: colors.subtitle }]}>Exámenes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: "#10b981" }]}>
            <View style={[styles.statIcon, { backgroundColor: "#10b98115" }]}>
              <TrendingUp size={20} color="#10b981" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.avgScore}%</Text>
            <Text style={[styles.statLabel, { color: colors.subtitle }]}>Promedio</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: "#0891b2" }]}>
            <View style={[styles.statIcon, { backgroundColor: "#0891b215" }]}>
              <Clock size={20} color="#0891b2" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalTime}</Text>
            <Text style={[styles.statLabel, { color: colors.subtitle }]}>Tiempo</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <FilterTabs
          tabs={filterTabs}
          activeTab={activeFilter}
          onTabChange={handleFilterChange}
        />

        {/* Exam List or Loading/Empty */}
        {isLoading || isFetching ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0284c7" />
            <Text style={{ marginTop: 10, color: colors.subtitle || "#64748b", fontSize: 13 }}>
              Cargando historial de exámenes...
            </Text>
          </View>
        ) : filteredExams.length > 0 ? (
          <>
            {groupedExams.map((group) => (
              <View key={group.title}>
                {renderSectionHeader(group.title)}
                {group.data.map((exam) => (
                  <ExamCard 
                    key={exam.id} 
                    exam={exam} 
                    colors={colors} 
                    isPressed={pressedCard === exam.id}
                    onPressIn={() => setPressedCard(exam.id)}
                    onPressOut={() => setPressedCard(null)}
                  />
                ))}
              </View>
            ))}

            {/* Pagination Controls */}
            <View style={styles.paginationContainer}>
              <Pressable
                style={[
                  styles.paginationButton,
                  !hasPrevPage && styles.paginationButtonDisabled
                ]}
                disabled={!hasPrevPage || isFetching}
                onPress={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} color="#0284c7" />
                <Text style={styles.paginationButtonText}>Anterior</Text>
              </Pressable>

              <Text style={[styles.paginationIndicator, { color: colors.text }]}>
                Página {page} de {lastPage}
              </Text>

              <Pressable
                style={[
                  styles.paginationButton,
                  !hasNextPage && styles.paginationButtonDisabled
                ]}
                disabled={!hasNextPage || isFetching}
                onPress={() => setPage(p => p + 1)}
              >
                <Text style={styles.paginationButtonText}>Siguiente</Text>
                <ChevronRight size={16} color="#0284c7" />
              </Pressable>
            </View>
          </>
        ) : (
          <EmptyState
            icon={FileText}
            title="No se encontraron exámenes"
            subtitle="No hay exámenes registrados para este filtro de búsqueda"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
