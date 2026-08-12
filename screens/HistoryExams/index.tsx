import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Brain,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    TrendingUp
} from "lucide-react-native";
import React, { memo, useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../common/EmptyState";
import FilterTabs from "../../common/FilterTabs";
import SearchBar from "../../common/SearchBar";
import StatCard from "../../common/StatCard";
import { useTheme } from "../../common/ThemeContext";
import { styles } from "./styles";

// ============================================
// TYPES
// ============================================
interface Examen {
  id: string;
  date: Date;
  dateString: string;
  type: "simulacro" | "año" | "extraordinario";
  category: string;
  score: number;
  questions: number;
  correctAnswers: number;
  timeMinutes: number;
}

interface ExamGroup {
  title: string;
  data: Examen[];
}

// ============================================
// MEMOIZED EXAM CARD COMPONENT
// ============================================
interface ExamCardProps {
  exam: Examen;
  colors: ReturnType<typeof useTheme>["colors"];
}

const ExamCard = memo<ExamCardProps>(function ExamCard({ exam, colors }) {
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
    switch (exam.type) {
      case "simulacro":
        return <Brain size={24} color="#8b5cf6" />;
      case "año":
        return <Calendar size={24} color="#06b6d4" />;
      case "extraordinario":
        return <FileText size={24} color="#f43f5e" />;
    }
  };

  const getTypeBgColor = () => {
    switch (exam.type) {
      case "simulacro":
        return "#8b5cf620";
      case "año":
        return "#06b6d420";
      case "extraordinario":
        return "#f43f5e20";
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const scoreColor = getScoreColor(exam.score);
  const scoreBgColor = getScoreBgColor(exam.score);

  return (
    <Pressable 
      style={[styles.examCard, { backgroundColor: colors.card }]}
      onPress={() => router.push({
        pathname: "/history-detail",
        params: {
          id: exam.id,
          correct: exam.correctAnswers.toString(),
          total: exam.questions.toString(),
          percentage: exam.score.toString(),
          examType: exam.type,
          specialty: exam.category,
          timeSpent: (exam.timeMinutes * 60).toString()
        }
      })}
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
        <Text style={[styles.examType, { color: colors.text }]}>
          {exam.category}
        </Text>
        <View style={styles.examMeta}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Clock size={12} color={colors.subtitle} />
            <Text style={{ color: colors.subtitle, fontSize: 12 }}>
              {formatTime(exam.timeMinutes)}
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

// Prevent hydration mismatch
ExamCard.displayName = "ExamCard";

// ============================================
// MAIN SCREEN COMPONENT
// ============================================
type FilterType = "all" | "simulacro" | "año" | "extraordinario";

export default function HistoryExamsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Sample data - In production, this would come from AsyncStorage or API
  const examHistory = useMemo<Examen[]>(() => [
    {
      id: "1",
      date: new Date(),
      dateString: "Hoy",
      type: "simulacro",
      category: "Simulacro - Cardiología",
      score: 82,
      questions: 50,
      correctAnswers: 41,
      timeMinutes: 145,
    },
    {
      id: "2",
      date: new Date(Date.now() - 86400000),
      dateString: "Ayer",
      type: "año",
      category: "Examen por año 2023",
      score: 75,
      questions: 100,
      correctAnswers: 75,
      timeMinutes: 180,
    },
    {
      id: "3",
      date: new Date(Date.now() - 86400000 * 3),
      dateString: "18 Mar",
      type: "simulacro",
      category: "Simulacro - Pediatría",
      score: 68,
      questions: 50,
      correctAnswers: 34,
      timeMinutes: 132,
    },
    {
      id: "4",
      date: new Date(Date.now() - 86400000 * 5),
      dateString: "15 Mar",
      type: "extraordinario",
      category: "Examen Extraordinario",
      score: 91,
      questions: 80,
      correctAnswers: 73,
      timeMinutes: 165,
    },
    {
      id: "5",
      date: new Date(Date.now() - 86400000 * 7),
      dateString: "12 Mar",
      type: "simulacro",
      category: "Simulacro - Farmacología",
      score: 78,
      questions: 45,
      correctAnswers: 35,
      timeMinutes: 98,
    },
    {
      id: "6",
      date: new Date(Date.now() - 86400000 * 10),
      dateString: "9 Mar",
      type: "año",
      category: "Examen por año 2022",
      score: 72,
      questions: 100,
      correctAnswers: 72,
      timeMinutes: 175,
    },
    {
      id: "7",
      date: new Date(Date.now() - 86400000 * 12),
      dateString: "7 Mar",
      type: "simulacro",
      category: "Simulacro - Neurología",
      score: 65,
      questions: 50,
      correctAnswers: 33,
      timeMinutes: 140,
    },
    {
      id: "8",
      date: new Date(Date.now() - 86400000 * 15),
      dateString: "4 Mar",
      type: "simulacro",
      category: "Simulacro - Anatomía",
      score: 88,
      questions: 60,
      correctAnswers: 53,
      timeMinutes: 120,
    },
    {
      id: "9",
      date: new Date(Date.now() - 86400000 * 18),
      dateString: "1 Mar",
      type: "año",
      category: "Examen por año 2021",
      score: 79,
      questions: 100,
      correctAnswers: 79,
      timeMinutes: 190,
    },
    {
      id: "10",
      date: new Date(Date.now() - 86400000 * 20),
      dateString: "26 Feb",
      type: "extraordinario",
      category: "Simulacro General",
      score: 85,
      questions: 100,
      correctAnswers: 85,
      timeMinutes: 200,
    },
  ], []);

  // Filter and search exams
  const filteredExams = useMemo(() => {
    let filtered = examHistory;

    // Apply type filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((exam) => exam.type === activeFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((exam) =>
        exam.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [examHistory, activeFilter, searchQuery]);

  // Helper to format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalExams = examHistory.length;
    const avgScore = Math.round(
      examHistory.reduce((acc, exam) => acc + exam.score, 0) / totalExams
    );
    const totalQuestions = examHistory.reduce(
      (acc, exam) => acc + exam.questions,
      0
    );
    const totalTime = examHistory.reduce(
      (acc, exam) => acc + exam.timeMinutes,
      0
    );
    const days = Math.floor(totalTime / 1440); // 1440 minutes in a day
    const hours = Math.floor((totalTime % 1440) / 60);
    const minutes = totalTime % 60;
    
    let formattedTime: string;
    if (days > 0) {
      formattedTime = `${days}d ${hours}h`;
    } else if (hours > 0) {
      formattedTime = `${hours}h ${minutes}min`;
    } else {
      formattedTime = `${minutes}min`;
    }

    return {
      totalExams: formatNumber(totalExams),
      avgScore,
      totalQuestions: formatNumber(totalQuestions),
      totalTime: formattedTime,
    };
  }, [examHistory]);

  // Group exams by date category
  const groupedExams = useMemo<ExamGroup[]>(() => {
    const groups: { [key: string]: Examen[] } = {};

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

  const renderExamItem = ({ item }: { item: Examen }) => (
    <ExamCard exam={item} colors={colors} />
  );

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
  );

  // Filter tabs configuration
  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "simulacro", label: "Simulacros" },
    { key: "año", label: "Por Año" },
    { key: "extraordinario", label: "Por tema" },
  ];

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
          <StatCard
            icon={FileText}
            iconColor="#8b5cf6"
            iconBgColor="#8b5cf620"
            value={stats.totalExams.toString()}
            label="Exámenes"
            colors={colors}
          />
          <StatCard
            icon={TrendingUp}
            iconColor="#22c55e"
            iconBgColor="#22c55e20"
            value={`${stats.avgScore}%`}
            label="Promedio"
            colors={colors}
          />
          <StatCard
            icon={Clock}
            iconColor="#06b6d4"
            iconBgColor="#06b6d420"
            value={stats.totalTime}
            label="Tiempo Total"
            colors={colors}
          />
        </View>

        {/* Filter Tabs */}
        <FilterTabs
          tabs={filterTabs}
          activeTab={activeFilter}
          onTabChange={(key) => setActiveFilter(key as FilterType)}
        />

        {/* Exam List */}
        {filteredExams.length > 0 ? (
          groupedExams.map((group) => (
            <View key={group.title}>
              {renderSectionHeader(group.title)}
              {group.data.map((exam) => (
                <ExamCard key={exam.id} exam={exam} colors={colors} />
              ))}
            </View>
          ))
        ) : (
          <EmptyState
            icon={FileText}
            title="No se encontraron exámenes"
            subtitle="Intenta con otros filtros de búsqueda"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
