import CommonModal from "@/common/Modal";
import { useTheme } from "@/common/ThemeContext";
import ThemeToggle from "@/common/ThemeToggle";
import TopicPerformance from "@/common/TopicPerformance";
import { styles as simulatorQuestionStyles } from "@/screens/Questions/styles";
import { styles as simulatorResultStyles } from "@/screens/SimulacreResults/styles";
import { useCompleteSmartReviewMutation, useCompleteSmartReviewPosttestMutation, useCompleteSmartReviewPretestMutation, useCreateSmartReviewBlocksMutation, useDeleteSmartReviewBlockMutation, useGenerateSmartReviewPretestMutation, useLazySmartReviewPosttestQuery, useSmartReviewBlocksQuery, useSmartReviewDueQuery, useSmartReviewPosttestsHistoryQuery, useSmartReviewPretestsQuery, useSmartReviewReviewsQuery, useSmartReviewThemesQuery } from "@/services/adaptiveReview/smart-review.rtkq";
import { useAreaQuery } from "@/services/question/area.rtkq";
import { useExamTypeQuery } from "@/services/question/exam-type.rtkq";
import { useLazyGetExamDetailQuery } from "@/services/question/exam.rtkq";
import { useHistoryMutation } from "@/services/question/history.rtkq";
import { useSaveRankingMutation } from "@/services/question/ranking.rtkq";
import { useSpecialtyQuery } from "@/services/question/specialty.rtkq";
import type { SmartReviewDifficulty, SmartReviewExamResultDTO, SmartReviewPretestAnswerDTO, SmartReviewPretestQuestionDTO, SmartReviewPretestResponseDTO, SmartReviewThemeResponseDTO } from "@/types/adaptiveReview/smart-review-theme.dto";
import type { ExamDetailDTO } from "@/types/question/exam.dto";
import type { HistoryRequestDTO } from "@/types/question/history.dto";
import { parseDistractorText } from "@/utils/distractorParser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertTriangle, ArrowLeft, Award, BookOpenCheck, CalendarClock, Check, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Circle, ClipboardCheck, Clock, Frown, GraduationCap, HelpCircle, Layers3, Meh, Plus, RotateCcw, Search, Smile, Sparkles, Stethoscope, Target, Trash2, Trophy, X, XCircle } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle as SvgCircle } from "react-native-svg";

type ViewMode = "welcome" | "blocksHistory" | "selection" | "plan" | "pretestLoading" | "pretest" | "completed" | "studyBlock" | "evaluationSummary";
type FilterKey = "exam" | "area" | "specialty";
type SelectOption = { id: string; label: string };
type StudyBlockContext = { examType: string; area: string; specialty: string; themeIds: string[]; themeNames: string[] };
type SelectedSmartReviewTheme = SmartReviewThemeResponseDTO & {
  selectionExamId: string;
  selectionExam: string;
  selectionAreaId: string;
  selectionArea: string;
  selectionSpecialtyId: string;
  selectionSpecialty: string;
};
const PRETEST_DURATION_SECONDS = 90 * 60;
const DEFAULT_MIN_SELECTED_THEMES = 4;
const DEFAULT_MAX_SELECTED_THEMES = 20;
type CompletedPretestSummary = { score: number; correct: number; incorrect: number; unanswered: number; total: number; timeSpent: number; examType: string };
type StoredEvaluationSummary = { label: string; title: string; score: number; completedAt: string; examType: string; total: number; timeSpent: number; examSummary: ExamDetailDTO["exam_summary"] };

function formatLimaDateTime(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? "00";
  return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}:${value("second")}-05:00`;
}


export default function AdaptiveReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const routeParams = useLocalSearchParams<{ studyBlockId?: string; resumePretest?: string; startPosttest?: string; reviewAssignmentId?: string; reviewQuestions?: string; reviewTheme?: string; reviewPlanNumber?: string }>();
  const reviewAssignmentId = Number(routeParams.reviewAssignmentId);
  const initialReviewQuestions = (() => {
    if (!routeParams.reviewQuestions) return [];
    try {
      const questions = JSON.parse(routeParams.reviewQuestions) as SmartReviewPretestQuestionDTO[];
      return Array.isArray(questions) ? questions : [];
    } catch {
      return [];
    }
  })();
  const isReviewExam = Number.isInteger(reviewAssignmentId) && reviewAssignmentId > 0 && initialReviewQuestions.length > 0;
  const routeStudyBlockId = Number(routeParams.studyBlockId);
  const isPosttestExam = routeParams.startPosttest === "true" && Number.isInteger(routeStudyBlockId) && routeStudyBlockId > 0;
  const resumeStartedRef = useRef(false);
  const stayOnWelcomeAfterDeleteRef = useRef(false);
  const studyScrollRef = useRef<ScrollView>(null);
  const pretestStartedAtRef = useRef<Date | undefined>(isReviewExam ? new Date() : undefined);
  const submissionInProgressRef = useRef(false);
  const { colors, darkMode } = useTheme();
  const [mode, setMode] = useState<ViewMode>(() => isReviewExam ? "pretest" : routeParams.resumePretest === "true" || isPosttestExam ? "pretestLoading" : "welcome");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<SelectedSmartReviewTheme[]>([]);
  const [showCancel, setShowCancel] = useState(false);
  const [showSelected, setShowSelected] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>();
  const [filterSearch, setFilterSearch] = useState("");
  const [examType, setExamType] = useState<SelectOption>();
  const [area, setArea] = useState<SelectOption>();
  const [specialty, setSpecialty] = useState<SelectOption>();
  const [studyBlockContexts, setStudyBlockContexts] = useState<Record<number, StudyBlockContext[]>>({});
  const [planError, setPlanError] = useState<string>();
  const [studyBlockId, setStudyBlockId] = useState<number>();
  const [pretestQuestions, setPretestQuestions] = useState<SmartReviewPretestQuestionDTO[]>(initialReviewQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [pretestAnswers, setPretestAnswers] = useState<Record<number, { answer: string; difficulty?: SmartReviewDifficulty }>>({});
  const [showPerception, setShowPerception] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pretestSubmitError, setPretestSubmitError] = useState<string>();
  const [submissionInProgress, setSubmissionInProgress] = useState(false);
  const [timeLimitSubmitted, setTimeLimitSubmitted] = useState(false);
  const [resumedExamType, setResumedExamType] = useState<string>();
  const [completedSummary, setCompletedSummary] = useState<CompletedPretestSummary>();
  const [completedTab, setCompletedTab] = useState<"summary" | "exam">("summary");
  const [storedEvaluation, setStoredEvaluation] = useState<StoredEvaluationSummary>();
  const [storedEvaluationTab, setStoredEvaluationTab] = useState<"summary" | "exam">("summary");
  const [storedExamError, setStoredExamError] = useState<string>();
  const [storedExamLoading, setStoredExamLoading] = useState(false);
  const [selectedStudyBlockId, setSelectedStudyBlockId] = useState<number>();
  const [expandedHistoryGroups, setExpandedHistoryGroups] = useState<string[]>([]);
  const [expandedPlanTopicGroups, setExpandedPlanTopicGroups] = useState<string[]>([]);
  const [expandedBlockContextGroups, setExpandedBlockContextGroups] = useState<string[]>([]);
  const [deleteCandidate, setDeleteCandidate] = useState<{ idStudyBlock: number; planNumber: number }>();
  const { data: blocksStatus, isLoading: blocksStatusLoading, isError: blocksStatusError, refetch: refetchBlocksStatus } = useSmartReviewBlocksQuery(undefined, { refetchOnMountOrArgChange: true });
  const minimumThemes = blocksStatus?.data.minimum_themes_per_selection ?? DEFAULT_MIN_SELECTED_THEMES;
  const maximumThemes = blocksStatus?.data.maximum_themes_per_selection ?? DEFAULT_MAX_SELECTED_THEMES;
  const [createSmartReviewBlocks, { isLoading: blocksLoading }] = useCreateSmartReviewBlocksMutation();
  const [deleteSmartReviewBlock, { isLoading: deletingBlock }] = useDeleteSmartReviewBlockMutation();
  const [generateSmartReviewPretest, { isLoading: pretestLoading }] = useGenerateSmartReviewPretestMutation();
  const [getSmartReviewPosttest] = useLazySmartReviewPosttestQuery();
  const [completeSmartReviewPretest, { isLoading: completingPretest }] = useCompleteSmartReviewPretestMutation();
  const [completeSmartReview, { isLoading: completingReview }] = useCompleteSmartReviewMutation();
  const [completeSmartReviewPosttest, { isLoading: completingPosttest }] = useCompleteSmartReviewPosttestMutation();
  const [getStoredExamDetail] = useLazyGetExamDetailQuery();
  const [registerReviewHistory] = useHistoryMutation();
  const [saveReviewRanking] = useSaveRankingMutation();
  const submittingEvaluation = submissionInProgress || completingPretest || completingReview || completingPosttest;

  const studyBlocks = useMemo(() => [...(blocksStatus?.data?.blocks ?? [])].sort((first, second) => second.id_study_block - first.id_study_block), [blocksStatus]);
  const activeStudyBlock = useMemo(() => studyBlocks.find(block => block.id_study_block === selectedStudyBlockId) ?? studyBlocks[0], [selectedStudyBlockId, studyBlocks]);
  const activeStudyBlockContexts = useMemo(() => {
    if (!activeStudyBlock) return [];
    const stored = studyBlockContexts[activeStudyBlock.id_study_block] ?? [];
    const grouped = new Map<string, { key: string; examType: string; area: string; specialty: string; themeIds: string[]; themes: typeof activeStudyBlock.themes }>();
    activeStudyBlock.themes.forEach(theme => {
      const storedContext = stored.find(context => context.themeIds.includes(String(theme.uuid)) || context.themeNames.includes(theme.theme));
      const examTypeValue = theme.exam_type || theme.id_exam_type || storedContext?.examType || activeStudyBlock.exam_type || "No disponible";
      const areaValue = theme.area_name || theme.area || storedContext?.area || activeStudyBlock.area_name || activeStudyBlock.area || "No disponible";
      const specialtyValue = theme.specialty_name || theme.specialty || storedContext?.specialty || activeStudyBlock.specialty_name || activeStudyBlock.specialty || "No disponible";
      const key = `${examTypeValue}:${areaValue}:${specialtyValue}`;
      const group = grouped.get(key) ?? { key, examType: examTypeValue, area: areaValue, specialty: specialtyValue, themeIds: [], themes: [] };
      group.themeIds.push(String(theme.uuid));
      group.themes.push(theme);
      grouped.set(key, group);
    });
    return Array.from(grouped.values());
  }, [activeStudyBlock, studyBlockContexts]);
  const activeStudyBlockData = useMemo(() => {
    if (!activeStudyBlock) return undefined;
    const uniqueValues = (values: (string | undefined)[]) => Array.from(new Set(values.filter((value): value is string => Boolean(value && value !== "No disponible"))));
    return {
      examTypes: uniqueValues([...(activeStudyBlock.exam_types ?? []), ...activeStudyBlockContexts.map(context => context.examType), activeStudyBlock.exam_type]),
      areas: uniqueValues([...activeStudyBlockContexts.map(context => context.area), activeStudyBlock.area_name, activeStudyBlock.area]),
      specialties: uniqueValues([
        ...activeStudyBlock.themes.map(theme => theme.specialty_name || theme.specialty),
        ...activeStudyBlockContexts.map(context => context.specialty),
        activeStudyBlock.specialty_name,
        activeStudyBlock.specialty,
      ]),
    };
  }, [activeStudyBlock, activeStudyBlockContexts]);
  const activeStudyBlockExamGroups = useMemo(() => {
    const groups = new Map<string, { key: string; examType: string; selections: typeof activeStudyBlockContexts; topicCount: number }>();
    activeStudyBlockContexts.forEach(context => {
      const key = context.examType;
      const group = groups.get(key) ?? { key, examType: context.examType, selections: [], topicCount: 0 };
      group.selections.push(context);
      group.topicCount += context.themes.length;
      groups.set(key, group);
    });
    return Array.from(groups.values());
  }, [activeStudyBlockContexts]);
  const { currentData: dueReviewsStatus, isFetching: dueReviewsFetching } = useSmartReviewDueQuery(
    activeStudyBlock?.id_study_block ?? 0,
    { skip: !activeStudyBlock },
  );
  const { currentData: pretestHistoryResponse, isFetching: pretestHistoryFetching } = useSmartReviewPretestsQuery(
    activeStudyBlock?.id_study_block ?? 0,
    { skip: !activeStudyBlock },
  );
  const { currentData: reviewHistoryResponse, isFetching: reviewHistoryFetching } = useSmartReviewReviewsQuery(
    { idStudyBlock: activeStudyBlock?.id_study_block ?? 0, page: 1, limit: 100 },
    { skip: !activeStudyBlock },
  );
  const { currentData: posttestHistoryResponse, isFetching: posttestHistoryFetching } = useSmartReviewPosttestsHistoryQuery(
    { idStudyBlock: activeStudyBlock?.id_study_block ?? 0, page: 1, limit: 100 },
    { skip: !activeStudyBlock },
  );
  const activePlanNumber = useMemo(() => {
    if (!activeStudyBlock) return 0;
    return [...studyBlocks]
      .sort((first, second) => first.id_study_block - second.id_study_block)
      .findIndex(block => block.id_study_block === activeStudyBlock.id_study_block) + 1;
  }, [activeStudyBlock, studyBlocks]);
  const studyBlockDetailsLoading = Boolean(activeStudyBlock) && (
    dueReviewsFetching
    || pretestHistoryFetching
    || reviewHistoryFetching
    || posttestHistoryFetching
  );
  const getPlanNumber = useCallback((idStudyBlock?: number) => {
    if (isReviewExam && routeParams.reviewPlanNumber) return Number(routeParams.reviewPlanNumber) || 1;
    if (!idStudyBlock) return 1;
    const blockIds = Array.from(new Set([...studyBlocks.map(block => block.id_study_block), idStudyBlock])).sort((first, second) => first - second);
    return blockIds.indexOf(idStudyBlock) + 1;
  }, [isReviewExam, routeParams.reviewPlanNumber, studyBlocks]);
  const getQuestionExamType = useCallback((question: SmartReviewPretestQuestionDTO) => {
    const directExamType = question.exam_type || question.id_exam_type;
    if (directExamType) return directExamType;
    const questionThemeId = question.id_theme === undefined ? undefined : String(question.id_theme);
    const selectedTopic = selectedTopics.find(topic =>
      (questionThemeId && String(topic.id) === questionThemeId)
      || Boolean(question.theme && topic.theme === question.theme));
    if (selectedTopic) return selectedTopic.selectionExam;
    const blockTheme = studyBlocks
      .flatMap(block => block.themes)
      .find(theme => (questionThemeId && String(theme.uuid) === questionThemeId)
        || Boolean(question.theme && theme.theme === question.theme));
    return blockTheme?.id_exam_type;
  }, [selectedTopics, studyBlocks]);
  const selectionIsValid = selectedIds.length >= minimumThemes && selectedIds.length <= maximumThemes;
  const selectedTopicGroups = useMemo(() => {
    const groups = new Map<string, { key: string; exam: string; area: string; specialty: string; topics: SelectedSmartReviewTheme[] }>();
    selectedTopics.forEach(topic => {
      const key = `${topic.selectionExamId}:${topic.selectionAreaId}:${topic.selectionSpecialtyId}`;
      const group = groups.get(key) ?? {
        key,
        exam: topic.selectionExam,
        area: topic.selectionArea,
        specialty: topic.selectionSpecialty,
        topics: [],
      };
      group.topics.push(topic);
      groups.set(key, group);
    });
    return Array.from(groups.values());
  }, [selectedTopics]);
  const pretestExams = pretestHistoryResponse?.data ? [pretestHistoryResponse.data] : [];
  const reviewExams = reviewHistoryResponse?.data ?? [];
  const posttestExams = posttestHistoryResponse?.data ?? [];
  const visibleReviewExams = expandedHistoryGroups.includes("reviews") ? reviewExams : reviewExams.slice(-2);
  const visiblePosttestExams = expandedHistoryGroups.includes("posttests") ? posttestExams : posttestExams.slice(-2);
  const toggleHistoryGroup = (group: string) => setExpandedHistoryGroups(current => current.includes(group) ? current.filter(item => item !== group) : [...current, group]);
  const removeStudyBlock = async () => {
    if (!deleteCandidate || deletingBlock) return;
    try {
      await deleteSmartReviewBlock(deleteCandidate.idStudyBlock).unwrap();
      setDeleteCandidate(undefined);
      if (studyBlocks.length === 1) {
        clearConfiguration();
        stayOnWelcomeAfterDeleteRef.current = true;
        setSelectedStudyBlockId(undefined);
        setMode("welcome");
      }
    } catch {
      Alert.alert("No pudimos eliminar el plan", "Inténtalo nuevamente en unos momentos.");
    }
  };
  const openPendingReviews = () => {
    const reviews = dueReviewsStatus?.data?.reviews ?? [];
    const targetReview = [...reviews]
      .filter(review => review.review_status === "overdue" || review.review_status === "active")
      .sort((first, second) => {
        const priority = (status: string) => status === "overdue" ? 0 : 1;
        return priority(first.review_status) - priority(second.review_status)
          || first.scheduled_for.localeCompare(second.scheduled_for);
      })[0];
    if (!targetReview) {
      returnToStudyCalendar();
      return;
    }
    router.push({ pathname: "/calendar-detail", params: { day: targetReview.scheduled_for, studyBlockId: String(targetReview.id_study_block) } });
  };

  const { data: examTypesData = [], isLoading: examTypesLoading, isError: examTypesError } = useExamTypeQuery();
  const { currentData: areasData = [], isLoading: areasLoading, isFetching: areasFetching } = useAreaQuery(
    { exam: examType?.label ?? "" },
    { skip: !examType }
  );
  const { currentData: specialtiesData = [], isLoading: specialtiesLoading, isFetching: specialtiesFetching } = useSpecialtyQuery(
    { exam: examType?.label ?? "", area: area ? Number(area.id) : 0 },
    { skip: !examType || !area }
  );
  const { currentData: smartThemesData = [], isLoading: themesLoading, isFetching: themesFetching, isError: themesError, refetch: refetchThemes } = useSmartReviewThemesQuery(
    { id_exam_type: examType?.id ?? "", id_area: area ? Number(area.id) : 0, id_specialty: specialty ? Number(specialty.id) : 0 },
    { skip: !examType || !area || !specialty }
  );
  const examOptions = useMemo<SelectOption[]>(() => examTypesData.map(item => ({ id: String(item.exam), label: String(item.exam) })), [examTypesData]);
  const areaOptions = useMemo<SelectOption[]>(() => areasData.map(item => ({ id: String(item.id), label: item.name })), [areasData]);
  const specialtyOptions = useMemo<SelectOption[]>(() => specialtiesData.map(item => ({ id: String(item.id), label: item.name })), [specialtiesData]);
  const clearConfiguration = () => {
    stayOnWelcomeAfterDeleteRef.current = false;
    setSelectedIds([]);
    setSelectedTopics([]);
    setExamType(undefined);
    setArea(undefined);
    setSpecialty(undefined);
    setPlanError(undefined);
    setStudyBlockId(undefined);
    setPretestQuestions([]);
    setCurrentQuestionIndex(0);
    setPretestAnswers({});
    setShowPerception(false);
    setElapsedSeconds(0);
    setPretestSubmitError(undefined);
    setTimeLimitSubmitted(false);
    setCompletedSummary(undefined);
    pretestStartedAtRef.current = undefined;
    setActiveFilter(undefined);
    setFilterSearch("");
  };
  const returnToStudyCalendar = useCallback(() => router.replace("/(dashboard)/dashboard"), [router]);
  const goBack = () => {
    if (mode === "welcome" || mode === "blocksHistory") { router.back(); return; }
    if (mode === "pretest" || mode === "pretestLoading") return;
    if (mode === "evaluationSummary") { setMode("studyBlock"); return; }
    if (mode === "completed" && (isReviewExam || isPosttestExam)) { returnToStudyCalendar(); return; }
    if (mode === "studyBlock") { setMode("blocksHistory"); return; }
    if (mode === "completed") { router.back(); return; }
    if (mode === "selection" && studyBlocks.length > 0) { clearConfiguration(); setMode("blocksHistory"); return; }
    clearConfiguration();
    setMode(mode === "plan" ? "selection" : "welcome");
  };
  const toggleTopic = (topic: SmartReviewThemeResponseDTO) => {
    setSelectedIds(current => current.includes(topic.id) ? current.filter(value => value !== topic.id) : current.length < maximumThemes ? [...current, topic.id] : current);
    setSelectedTopics(current => current.some(item => item.id === topic.id)
      ? current.filter(item => item.id !== topic.id)
      : current.length < maximumThemes && examType && area && specialty
        ? [...current, {
          ...topic,
          selectionExamId: examType.id,
          selectionExam: examType.label,
          selectionAreaId: area.id,
          selectionArea: area.label,
          selectionSpecialtyId: specialty.id,
          selectionSpecialty: specialty.label,
        }]
        : current);
  };
  const createPlan = () => {
    if (!selectionIsValid || !examType || !area || !specialty) return;
    setPlanError(undefined);
    setExpandedPlanTopicGroups([]);
    setMode("plan");
  };
  const confirmPlan = async () => {
    if ((!studyBlockId && !selectionIsValid) || blocksLoading || pretestLoading) return;
    setPlanError(undefined);
    let id = studyBlockId;
    try {
      if (!id) {
        id = await createSmartReviewBlocks({
          themes: selectedTopics.map(topic => ({
            id_theme: topic.id,
            id_exam_type: topic.id_exam_type ?? examType?.id ?? examType?.label ?? "",
          })),
        }).unwrap();
        setStudyBlockId(id);
        if (examType?.label) await AsyncStorage.setItem(`smart_review_exam_type_${id}`, examType.label);
        const blockContexts: StudyBlockContext[] = selectedTopicGroups.map(group => ({
          examType: group.exam,
          area: group.area,
          specialty: group.specialty,
          themeIds: group.topics.map(topic => String(topic.id)),
          themeNames: group.topics.map(topic => topic.theme),
        }));
        await AsyncStorage.setItem(`smart_review_context_${id}`, JSON.stringify(blockContexts));
        setStudyBlockContexts(current => ({ ...current, [id!]: blockContexts }));
      }
      console.log("[SmartReview] Bloque creado. Solicitando pretest", { idStudyBlock: id });
      const pretest = await generateSmartReviewPretest(id).unwrap();
      if (!pretest.questions?.length) throw new Error("El pretest no contiene preguntas");
      setPretestQuestions(pretest.questions);
      setCurrentQuestionIndex(0);
      setPretestAnswers({});
      setElapsedSeconds(0);
      setTimeLimitSubmitted(false);
      pretestStartedAtRef.current = new Date();
      setMode("pretest");
    } catch (error) {
      console.error("[SmartReview] No se pudo preparar el pretest", error);
      setPlanError(id
        ? "El bloque fue creado, pero no pudimos preparar la evaluación inicial. Inténtalo nuevamente."
        : "No pudimos crear tu bloque de repaso adaptativo. Inténtalo nuevamente.");
    }
  };
  const submitPretest = useCallback(async (answers: Record<number, { answer: string; difficulty?: SmartReviewDifficulty }>) => {
    const selectedExamType = examType?.label ?? resumedExamType;
    if ((!isReviewExam && !isPosttestExam && (!studyBlockId || !selectedExamType)) || (isPosttestExam && !studyBlockId) || pretestQuestions.length === 0) return;
    if (submissionInProgressRef.current) return;
    submissionInProgressRef.current = true;
    setSubmissionInProgress(true);
    const completedAnswers: SmartReviewPretestAnswerDTO[] = pretestQuestions.map((question, index) => ({
      id_question: question.id,
      answer: answers[index]?.answer?.toUpperCase() ?? "",
      difficulty: answers[index]?.difficulty ?? "hard",
    }));
    const correctAnswers = pretestQuestions.filter((question, index) => {
      const selectedAnswer = answers[index]?.answer;
      return Boolean(selectedAnswer) && Boolean(question.response)
        && selectedAnswer.toUpperCase() === question.response!.toUpperCase();
    }).length;
    const questionExamTypes = Array.from(new Set(pretestQuestions.map(getQuestionExamType).filter((value): value is string => Boolean(value))));
    const examTypeSummary = questionExamTypes.join(" · ");
    setPretestSubmitError(undefined);
    try {
      const completedAt = new Date();
      const startedAt = pretestStartedAtRef.current ?? new Date(completedAt.getTime() - elapsedSeconds * 1000);
      const unanswered = completedAnswers.filter(answer => !answer.answer).length;
      const currentBlockId = studyBlockId ?? (Number.isInteger(routeStudyBlockId) ? routeStudyBlockId : undefined);
      const planNumber = getPlanNumber(currentBlockId);
      if (isPosttestExam) {
        const block = studyBlocks.find(item => item.id_study_block === currentBlockId);
        const posttestNumber = (block?.exam_counts.posttests ?? 0) + 1;
        await completeSmartReviewPosttest({
          idStudyBlock: studyBlockId!,
          body: {
            title: `Posttest ${posttestNumber} - Plan de repaso ${planNumber}`,
            time_spent: elapsedSeconds,
            started_at: formatLimaDateTime(startedAt),
            completed_at: formatLimaDateTime(completedAt),
            answers: completedAnswers.map(({ id_question, answer }) => ({ id_question, answer })),
          },
        }).unwrap();
        const scorePercentage = Math.round((correctAnswers / pretestQuestions.length) * 100);
        setCompletedSummary({
          score: scorePercentage,
          correct: correctAnswers,
          incorrect: Math.max(0, pretestQuestions.length - correctAnswers - unanswered),
          unanswered,
          total: pretestQuestions.length,
          timeSpent: elapsedSeconds,
          examType: examTypeSummary || "Posttest",
        });
        setMode("completed");
        return;
      }
      if (isReviewExam) {
        const block = studyBlocks.find(item => item.id_study_block === currentBlockId);
        const reviewNumber = (block?.exam_counts.reviews ?? 0) + 1;
        await completeSmartReview({
          title: `Repaso ${reviewNumber} - Plan de repaso ${planNumber}`,
          id_smart_review_assignment: reviewAssignmentId,
          time_spent: elapsedSeconds,
          started_at: formatLimaDateTime(startedAt),
          completed_at: formatLimaDateTime(completedAt),
          answers: completedAnswers,
        }).unwrap();

        // Los repasos sí alimentan el historial general y el ranking. El pretest y
        // el posttest quedan fuera porque este registro vive exclusivamente en la
        // rama de examen `review`.
        const historyPayload: HistoryRequestDTO[] = pretestQuestions.map((question, index) => {
          const selectedAnswer = completedAnswers[index]?.answer ?? "";
          const isAnswered = selectedAnswer.length > 0;
          const isCorrect = isAnswered && Boolean(question.response)
            && selectedAnswer === question.response!.toUpperCase();

          return {
            questionId: String(question.id),
            ok: isCorrect ? 1 : 0,
            error: isAnswered && !isCorrect ? 1 : 0,
            empty: isAnswered ? 0 : 1,
            count: 1,
          };
        });

        try {
          await Promise.all([
            registerReviewHistory(historyPayload).unwrap(),
            saveReviewRanking({ points: correctAnswers }).unwrap(),
          ]);
        } catch (historyError) {
          // El repaso ya fue completado en Smart Review. No se debe reenviar y
          // duplicar por un fallo secundario del historial/ranking.
          console.error("[SmartReview] No se pudo registrar el repaso en history/ranking", historyError);
        }
        setCompletedSummary({
          score: Math.round((correctAnswers / pretestQuestions.length) * 100),
          correct: correctAnswers,
          incorrect: Math.max(0, pretestQuestions.length - correctAnswers - unanswered),
          unanswered,
          total: pretestQuestions.length,
          timeSpent: elapsedSeconds,
          examType: examTypeSummary || "Repaso adaptativo",
        });
        setMode("completed");
        return;
      }
      const scorePercentage = pretestQuestions.length > 0
        ? Math.round((correctAnswers / pretestQuestions.length) * 100)
        : 0;
      const response = await completeSmartReviewPretest({
        idStudyBlock: studyBlockId!,
        body: {
          title: `Evaluación inicial - Plan de repaso ${planNumber}`,
          time_spent: elapsedSeconds,
          started_at: formatLimaDateTime(startedAt),
          completed_at: formatLimaDateTime(completedAt),
          score_percentage: scorePercentage,
          answers: completedAnswers.map(answer => ({
            id_question: answer.id_question,
            answer: answer.answer,
            difficulty: answer.difficulty,
          })),
        },
      }).unwrap();
      const serverScore = Number(response.data?.score_percentage ?? 0);
      const serverCorrectAnswers = Math.round((serverScore / 100) * pretestQuestions.length);
      setCompletedSummary({
        score: serverScore,
        correct: serverCorrectAnswers,
        incorrect: Math.max(0, pretestQuestions.length - serverCorrectAnswers - unanswered),
        unanswered,
        total: pretestQuestions.length,
        timeSpent: elapsedSeconds,
        examType: examTypeSummary || selectedExamType!,
      });
      setMode("completed");
    } catch (err) {
      console.error("[SmartReview] Error submitting pretest:", err);
      setPretestSubmitError(isPosttestExam ? "No pudimos enviar tu evaluación de progreso. Inténtalo nuevamente." : isReviewExam ? "No pudimos enviar tu repaso. Inténtalo nuevamente." : "No pudimos enviar tu evaluación inicial. Inténtalo nuevamente.");
    } finally {
      submissionInProgressRef.current = false;
      setSubmissionInProgress(false);
    }
  }, [completeSmartReview, completeSmartReviewPosttest, completeSmartReviewPretest, elapsedSeconds, examType, getPlanNumber, getQuestionExamType, isPosttestExam, isReviewExam, pretestQuestions, registerReviewHistory, resumedExamType, reviewAssignmentId, routeStudyBlockId, saveReviewRanking, studyBlockId, studyBlocks]);
  const selectPretestAnswer = (answer: string) => {
    const question = pretestQuestions[currentQuestionIndex];
    if (!question || pretestAnswers[currentQuestionIndex]?.difficulty || submittingEvaluation) return;
    const nextAnswers = { ...pretestAnswers, [currentQuestionIndex]: { answer: answer.toUpperCase() } };
    setPretestAnswers(nextAnswers);
    if (isPosttestExam) {
      if (currentQuestionIndex === pretestQuestions.length - 1) void submitPretest(nextAnswers);
      else setCurrentQuestionIndex(index => index + 1);
      return;
    }
    setShowPerception(true);
  };
  const selectDifficulty = async (difficulty: SmartReviewDifficulty) => {
    const question = pretestQuestions[currentQuestionIndex];
    if (!question) return;
    const nextAnswers = {
      ...pretestAnswers,
      [currentQuestionIndex]: { ...pretestAnswers[currentQuestionIndex], difficulty },
    };
    setPretestAnswers(nextAnswers);
    setShowPerception(false);
    if (currentQuestionIndex === pretestQuestions.length - 1) await submitPretest(nextAnswers);
    else setCurrentQuestionIndex(index => index + 1);
  };
  const showStoredExam = (exam: ExamDetailDTO, label: string, examKind: "pretest" | "review" | "posttest") => {
    const storedExamTypes = Array.from(new Set((exam.exam_summary ?? [])
      .map(item => item.exam_type || item.id_exam_type)
      .filter((value): value is string => Boolean(value))));
    setStoredEvaluation({
      label,
      title: exam.title,
      score: Number(exam.score_percentage ?? 0),
      completedAt: exam.completed_at ?? exam.started_at,
      examType: storedExamTypes.join(" · ") || exam.exam_type || examKind,
      total: exam.total_questions,
      timeSpent: Number(exam.time_spent ?? 0),
      examSummary: exam.exam_summary ?? [],
    });
    setStoredEvaluationTab("summary");
    setMode("evaluationSummary");
  };
  const openStoredEvaluation = async (result: SmartReviewExamResultDTO, label: string) => {
    if (!activeStudyBlock || storedExamLoading) return;
    setStoredExamError(undefined);
    setStoredExamLoading(true);
    try {
      const response = await getStoredExamDetail(result.uuid).unwrap();
      const exam = response.data;
      if (!exam) throw new Error("No exam found");
      showStoredExam(exam, label, result.stage);
    } catch (error) {
      console.error("[SmartReview] No se pudo consultar el examen guardado", error);
      setStoredExamError("No pudimos cargar el detalle de esta evaluación. Inténtalo nuevamente.");
    } finally {
      setStoredExamLoading(false);
    }
  };
  const cancelReview = () => { setShowCancel(false); setSelectedTopics([]); setSelectedIds([]); setExamType(undefined); setArea(undefined); setSpecialty(undefined); setStudyBlockId(undefined); setMode("welcome"); };
  const filtersComplete = Boolean(examType && area && specialty);
  const currentStep = !examType ? 1 : !area ? 2 : !specialty ? 3 : 4;
  const filterOptions = activeFilter === "exam" ? examOptions : activeFilter === "area" ? areaOptions : specialtyOptions;
  const visibleFilterOptions = filterOptions.filter(option => option.label.toLowerCase().includes(filterSearch.trim().toLowerCase()));
  const filterLoading = activeFilter === "exam" ? examTypesLoading : activeFilter === "area" ? (areasLoading || areasFetching) : (specialtiesLoading || specialtiesFetching);
  const filterTitle = activeFilter === "exam" ? "Tipo de Examen" : activeFilter === "area" ? "Área médica" : "Especialidad";
  const chooseFilter = (option: SelectOption) => {
    if (activeFilter === "exam") { setExamType(option); setArea(undefined); setSpecialty(undefined); }
    if (activeFilter === "area") { setArea(option); setSpecialty(undefined); }
    if (activeFilter === "specialty") setSpecialty(option);
    setActiveFilter(undefined);
    setFilterSearch("");
  };
  const closeFilter = () => { setActiveFilter(undefined); setFilterSearch(""); };
  const currentPretestQuestion = pretestQuestions[currentQuestionIndex];
  const currentPretestAnswer = currentPretestQuestion ? pretestAnswers[currentQuestionIndex] : undefined;
  const formatElapsedTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const currentTopicPerformance = pretestQuestions.map((question, index) => ({
    topicId: question.id_theme,
    topic: question.theme || (isReviewExam ? routeParams.reviewTheme : undefined) || question.objective_learning || "Tema no especificado",
    examType: getQuestionExamType(question),
    correct: Boolean(pretestAnswers[index]?.answer) && Boolean(question.response)
      && pretestAnswers[index].answer.toUpperCase() === question.response!.toUpperCase(),
  }));
  const storedTopicPerformance = storedEvaluation?.examSummary.map(item => ({
    topicId: item.id_theme,
    topic: item.theme || item.objective_learning || "Tema no especificado",
    examType: item.exam_type || item.id_exam_type,
    correct: Boolean(item.response) && item.response.toUpperCase() === item.correct_answer.toUpperCase(),
  })) ?? [];

  useEffect(() => {
    if (!studyBlocks.length) return;
    let active = true;
    void Promise.all(studyBlocks.map(async block => {
      const value = await AsyncStorage.getItem(`smart_review_context_${block.id_study_block}`);
      if (!value) return undefined;
      try {
        const parsed = JSON.parse(value) as StudyBlockContext[] | Omit<StudyBlockContext, "themeIds" | "themeNames">;
        const contexts: StudyBlockContext[] = Array.isArray(parsed)
          ? parsed.map(context => ({ ...context, themeIds: Array.isArray(context.themeIds) ? context.themeIds.map(String) : [], themeNames: Array.isArray(context.themeNames) ? context.themeNames.map(String) : [] }))
          : [{ ...parsed, themeIds: [], themeNames: [] }];
        return [block.id_study_block, contexts] as const;
      } catch {
        return undefined;
      }
    })).then(entries => {
      if (!active) return;
      const contexts = entries.filter((entry): entry is readonly [number, StudyBlockContext[]] => Boolean(entry));
      if (contexts.length) setStudyBlockContexts(current => ({ ...current, ...Object.fromEntries(contexts) }));
    });
    return () => { active = false; };
  }, [studyBlocks]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (activeFilter) { closeFilter(); return true; }
      if (mode === "pretest" || mode === "pretestLoading") return true;
      if (mode === "completed" && (isReviewExam || isPosttestExam)) { returnToStudyCalendar(); return true; }
      if (mode === "welcome" || mode === "blocksHistory") return false;
      if (mode === "evaluationSummary") { setMode("studyBlock"); return true; }
      if (mode === "studyBlock" || (mode === "selection" && studyBlocks.length > 0)) { clearConfiguration(); setMode("blocksHistory"); return true; }
      clearConfiguration();
      setMode(mode === "plan" ? "selection" : "welcome");
      return true;
    });
    return () => subscription.remove();
  }, [activeFilter, isPosttestExam, isReviewExam, mode, returnToStudyCalendar, studyBlocks.length]);

  useEffect(() => {
    if (mode !== "pretest" || showPerception || submittingEvaluation || elapsedSeconds >= PRETEST_DURATION_SECONDS) return;
    const timer = setInterval(() => setElapsedSeconds(value => Math.min(value + 1, PRETEST_DURATION_SECONDS)), 1000);
    return () => clearInterval(timer);
  }, [mode, showPerception, submittingEvaluation, elapsedSeconds]);

  useEffect(() => {
    if (mode !== "pretest" || elapsedSeconds < PRETEST_DURATION_SECONDS || timeLimitSubmitted) return;
    setTimeLimitSubmitted(true);
    setShowPerception(false);
    void submitPretest(pretestAnswers);
  }, [elapsedSeconds, mode, pretestAnswers, submitPretest, timeLimitSubmitted]);

  useEffect(() => {
    const id = Number(routeParams.studyBlockId);
    if (routeParams.resumePretest !== "true" || !Number.isInteger(id) || id <= 0 || resumeStartedRef.current) return;
    resumeStartedRef.current = true;
    setMode("pretestLoading");
    setStudyBlockId(id);
    void (async () => {
      try {
        const storedExamType = await AsyncStorage.getItem(`smart_review_exam_type_${id}`);
        setResumedExamType(storedExamType ?? "pretest");
        const pretest = await generateSmartReviewPretest(id).unwrap();
        if (!pretest.questions?.length) throw new Error("El pretest no contiene preguntas");
        setPretestQuestions(pretest.questions);
        setCurrentQuestionIndex(0);
        setPretestAnswers({});
        setElapsedSeconds(0);
        setTimeLimitSubmitted(false);
        pretestStartedAtRef.current = new Date();
        setMode("pretest");
      } catch (error) {
        console.warn("[SmartReview] No se pudo reanudar el pretest después de reintentar", error);
        setPlanError("No pudimos generar tu evaluación inicial. Inténtalo nuevamente.");
        setMode("plan");
      }
    })();
  }, [generateSmartReviewPretest, routeParams.resumePretest, routeParams.studyBlockId]);

  useEffect(() => {
    if (!isPosttestExam || resumeStartedRef.current) return;
    resumeStartedRef.current = true;
    setMode("pretestLoading");
    setStudyBlockId(routeStudyBlockId);
    void (async () => {
      try {
        console.log("[SmartReview] Solicitando posttest", { idStudyBlock: routeStudyBlockId });
        const rawPosttest = await getSmartReviewPosttest(routeStudyBlockId, false).unwrap() as unknown as SmartReviewPretestResponseDTO | { data: SmartReviewPretestResponseDTO };
        const posttest = "data" in rawPosttest ? rawPosttest.data : rawPosttest;
        const posttestQuestions = (posttest.questions ?? []).map(question => ({
          ...question,
          id: question.id_question ?? question.question_id ?? question.id,
        }));
        if (!posttestQuestions.length) throw new Error("El posttest no contiene preguntas");
        setPretestQuestions(posttestQuestions);
        setCurrentQuestionIndex(0);
        setPretestAnswers({});
        setElapsedSeconds(0);
        setTimeLimitSubmitted(false);
        pretestStartedAtRef.current = new Date();
        setMode("pretest");
      } catch (error) {
        console.warn("[SmartReview] No se pudo generar el posttest", error);
        setPlanError("No pudimos generar tu evaluación de progreso. Inténtalo nuevamente.");
        router.back();
      }
    })();
  }, [getSmartReviewPosttest, isPosttestExam, routeStudyBlockId, router]);

  useEffect(() => {
    if (stayOnWelcomeAfterDeleteRef.current || isReviewExam || isPosttestExam || routeParams.resumePretest === "true" || mode !== "welcome" || blocksStatusLoading || studyBlocks.length === 0) return;
    setMode("blocksHistory");
  }, [blocksStatusLoading, isPosttestExam, isReviewExam, mode, routeParams.resumePretest, studyBlocks.length]);

  return <SafeAreaView style={[s.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
    <View style={s.header}>{mode === "pretest" || mode === "pretestLoading" ? <View style={s.iconButton} /> : <Pressable onPress={goBack} style={[s.iconButton, { backgroundColor: colors.themeButton }]}><ArrowLeft size={22} color={colors.text} /></Pressable>}<Text style={[s.headerTitle, { color: colors.text }]}>{mode === "pretest" || mode === "pretestLoading" ? (isPosttestExam ? "Evaluación de progreso" : isReviewExam ? "Repaso adaptativo" : "Evaluación inicial") : mode === "completed" || mode === "evaluationSummary" ? "Resultados" : mode === "blocksHistory" ? "Historial de repaso" : mode === "studyBlock" ? "Mi repaso adaptativo" : "Repaso Adaptativo"}</Text><ThemeToggle /></View>

    {mode === "welcome" && blocksStatusLoading && <View style={s.blockState}><ActivityIndicator size="large" color="#0284c7" /><Text style={[s.blockStateText, { color: colors.subtitle }]}>Consultando tu repaso adaptativo...</Text></View>}
    {mode === "welcome" && blocksStatusError && <View style={s.blockState}><AlertTriangle size={34} color="#ef4444" /><Text style={[s.blockStateTitle, { color: colors.text }]}>No pudimos consultar tu repaso</Text><Text style={[s.blockStateText, { color: colors.subtitle }]}>Revisa tu conexión e inténtalo nuevamente.</Text><Pressable onPress={() => refetchBlocksStatus()} style={s.retryButton}><Text style={s.retryText}>Reintentar</Text></Pressable></View>}

    {mode === "blocksHistory" && <ScrollView contentContainerStyle={s.blocksHistoryContent} showsVerticalScrollIndicator={false}>
      <View style={[s.blocksHistoryHero, { backgroundColor: darkMode ? "#102b3a" : "#f0f9ff", borderColor: darkMode ? "#155e75" : "#bae6fd" }]}><View style={s.blocksHistoryHeroIcon}><Layers3 size={25} color="#fff" /></View><View style={{ flex: 1 }}><Text style={[s.blocksHistoryTitle, { color: colors.text }]}>{studyBlocks.length === 1 ? "Cuentas con 1 bloque de repaso" : `Cuentas con ${studyBlocks.length} bloques de repaso`}</Text><Text style={[s.blocksHistoryText, { color: colors.subtitle }]}>Consulta el avance y los resultados de cada plan.</Text></View></View>
      {blocksStatus?.data?.can_select_new_themes ? <Pressable onPress={() => { clearConfiguration(); setMode("selection"); }} style={({ pressed }) => [s.newCycleBanner, { backgroundColor: darkMode ? "#123525" : "#f0fdf4", borderColor: darkMode ? "#166534" : "#86efac" }, pressed && { transform: [{ scale: .99 }] }]}><View style={s.newCycleIcon}><Plus size={20} color="#fff" /></View><View style={{ flex: 1 }}><Text style={[s.newCycleTitle, { color: colors.text }]}>{blocksStatus.data.theme_selection_message}</Text><Text style={[s.newCycleText, { color: colors.subtitle }]}>Toca para comenzar un nuevo ciclo.</Text></View><ChevronRight size={20} color="#16a34a" /></Pressable> : null}
      <View style={s.blocksList}>{studyBlocks.map((block, index) => {
        const planNumber = studyBlocks.length - index;
        const hasPretest = Boolean(block.pretest_completed_at);
        const visibleThemes = block.themes.slice(0, 2).map(theme => theme.theme).join(" · ");
        const remainingThemes = Math.max(0, block.themes.length - 2);
        const completedReviewCount = block.exam_counts?.reviews ?? block.completed_reviews;
        return <Pressable key={block.id_study_block} onPress={() => { if (!hasPretest) { router.push({ pathname: "/adaptive-review", params: { studyBlockId: String(block.id_study_block), resumePretest: "true" } }); return; } setSelectedStudyBlockId(block.id_study_block); setMode("studyBlock"); }} style={({ pressed }) => [s.blockHistoryCard, { backgroundColor: colors.card, borderColor: colors.inputBorder }, pressed && { borderColor: "#38bdf8", transform: [{ scale: .99 }] }]}> 
          <View style={s.blockHistoryTop}><View style={s.blockHistoryNumber}><BookOpenCheck size={22} color="#0284c7" /></View><View style={{ flex: 1 }}><View style={s.blockHistoryTitleRow}><Text style={[s.blockHistoryTitle, { color: colors.text }]}>Plan de repaso {planNumber}</Text><View style={[s.blockStatusPill, { backgroundColor: block.status === "active" ? (darkMode ? "#14532d" : "#dcfce7") : colors.themeButton }]}><Text style={[s.blockStatusText, { color: block.status === "active" ? (darkMode ? "#86efac" : "#15803d") : colors.subtitle }]}>{block.status === "active" ? "ACTIVO" : block.status.toUpperCase()}</Text></View></View><Text style={[s.blockHistoryDate, { color: colors.subtitle }]}>{hasPretest ? `Iniciado el ${formatStudyDate(block.pretest_completed_at)}` : "Evaluación inicial pendiente"}</Text></View><ChevronRight size={19} color="#0284c7" /></View>
          <View style={s.blockHistoryChips}><View style={[s.blockHistoryChip, { backgroundColor: colors.themeButton }]}><Layers3 size={14} color="#0284c7" /><Text style={[s.blockHistoryChipText, { color: colors.text }]}>{block.themes.length} temas</Text></View><View style={[s.blockHistoryChip, { backgroundColor: colors.themeButton }]}><CheckCircle2 size={14} color="#16a34a" /><Text style={[s.blockHistoryChipText, { color: colors.text }]}>{completedReviewCount} {completedReviewCount === 1 ? "repaso realizado" : "repasos realizados"}</Text></View></View>
          <Text numberOfLines={2} style={[s.blockHistoryThemes, { color: colors.subtitle }]}>{visibleThemes}{remainingThemes ? ` · +${remainingThemes} temas` : ""}</Text>
          <View style={s.blockHistoryActions}>
            <Pressable
              disabled={deletingBlock}
              onPress={event => {
                event.stopPropagation();
                setDeleteCandidate({ idStudyBlock: block.id_study_block, planNumber });
              }}
              style={({ pressed }) => [
                s.blockDeleteAction,
                { backgroundColor: darkMode ? "#3f1722" : "#fff1f2" },
                pressed && { opacity: .68 },
              ]}
            >
              <Trash2 size={14} color={darkMode ? "#fda4af" : "#e11d48"} />
              <Text style={[s.blockDeleteActionText, darkMode && { color: "#fda4af" }]}>Eliminar</Text>
            </Pressable>
          </View>
        </Pressable>;
      })}</View>
    </ScrollView>}

    {mode === "studyBlock" && activeStudyBlock && studyBlockDetailsLoading && <View style={s.studyBlockLoading}>
      <View style={[s.studyBlockLoadingIcon, { backgroundColor: colors.themeButton }]}><ActivityIndicator size="large" color="#0284c7" /></View>
      <Text style={[s.studyBlockLoadingTitle, { color: colors.text }]}>Cargando tu plan de repaso</Text>
      <Text style={[s.studyBlockLoadingText, { color: colors.subtitle }]}>Estamos actualizando el historial y los datos del bloque seleccionado.</Text>
    </View>}

    {mode === "studyBlock" && activeStudyBlock && !studyBlockDetailsLoading && <ScrollView ref={studyScrollRef} contentContainerStyle={s.studyContent} showsVerticalScrollIndicator={false}>
      {activeStudyBlockData && <View style={[s.studyContextCard, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
        <View style={s.studyContextCardHeader}><View><Text style={[s.studyContextTitle, { color: colors.text }]}>Datos del bloque de estudio</Text><Text style={[s.studyContextCardSubtitle, { color: colors.subtitle }]}>Resumen general de tu selección</Text></View></View>
        <View style={s.studyContextStats}>
          <StudyContextStat value={activeStudyBlockData.examTypes.length} label="Exámenes" color="#0284c7" colors={colors} />
          <StudyContextStat value={activeStudyBlockData.areas.length} label="Áreas" color="#9333ea" colors={colors} />
          <StudyContextStat value={activeStudyBlockData.specialties.length} label="Especialidades" color="#16a34a" colors={colors} />
          <StudyContextStat value={activeStudyBlock.themes.length} label="Temas" color="#ea580c" colors={colors} />
        </View>
      </View>}

      <View style={s.studySectionHeader}><View style={{ flex: 1 }}><Text style={[s.studySectionTitle, { color: colors.text }]}>Historial del plan</Text><Text style={[s.studySectionText, { color: colors.subtitle }]}>Todo lo realizado durante este ciclo de repaso</Text></View><View style={[s.studyCount, { backgroundColor: colors.themeButton }]}><ClipboardCheck size={17} color="#0284c7" /></View></View>
      <View style={[s.historySummary, { backgroundColor: darkMode ? "#102b3a" : "#f0f9ff", borderColor: darkMode ? "#155e75" : "#bae6fd" }]}>
        <View style={s.historySummaryItem}><Text style={[s.historySummaryValue, { color: colors.text }]}>{pretestExams.length}</Text><Text style={[s.historySummaryLabel, { color: colors.subtitle }]}>Inicial</Text></View>
        <View style={[s.historySummaryDivider, { backgroundColor: colors.inputBorder }]} />
        <View style={s.historySummaryItem}><Text style={[s.historySummaryValue, { color: colors.text }]}>{reviewExams.length}</Text><Text style={[s.historySummaryLabel, { color: colors.subtitle }]}>Repasos</Text></View>
        <View style={[s.historySummaryDivider, { backgroundColor: colors.inputBorder }]} />
        <View style={s.historySummaryItem}><Text style={[s.historySummaryValue, { color: colors.text }]}>{posttestExams.length}</Text><Text style={[s.historySummaryLabel, { color: colors.subtitle }]}>Posttests</Text></View>
      </View>
      <View style={s.evaluationList}>
        <EvaluationGroupTitle title="Evaluación inicial" count={pretestExams.length} colors={colors} />
        {pretestExams.map((exam, index) => { const evaluationLabel = pretestExams.length > 1 ? `Evaluación inicial ${index + 1}` : "Evaluación inicial"; const label = `${evaluationLabel} - Plan de repaso ${activePlanNumber}`; return <EvaluationInfoCard key={exam.uuid} label={label} detail={exam.title} description={formatStudyDate(exam.completed_at ?? null)} score={Number(exam.score_percentage)} completedAt={exam.completed_at ?? null} availableAt={null} onPress={() => void openStoredEvaluation(exam, label)} color="#0284c7" colors={colors} />; })}

        <EvaluationGroupTitle title="Repasos realizados" count={reviewExams.length} colors={colors} expanded={expandedHistoryGroups.includes("reviews")} collapsible={reviewExams.length > 2} onToggle={() => toggleHistoryGroup("reviews")} />
        {reviewExams.length === 0 && <HistoryEmptyState icon={<ClipboardCheck size={18} color={colors.subtitle} />} title="No hay repasos realizados" text="Tus repasos completados aparecerán aquí." colors={colors} />}
        {visibleReviewExams.map(exam => { const position = reviewExams.findIndex(item => item.uuid === exam.uuid) + 1; const label = `Repaso ${position}`; return <EvaluationInfoCard key={exam.uuid} label={label} detail={exam.title} description={formatStudyDate(exam.completed_at ?? null)} score={Number(exam.score_percentage)} completedAt={exam.completed_at ?? null} availableAt={null} onPress={() => void openStoredEvaluation(exam, label)} color="#0891b2" colors={colors} />; })}

        <EvaluationGroupTitle title="Posttests realizados" count={posttestExams.length} colors={colors} expanded={expandedHistoryGroups.includes("posttests")} collapsible={posttestExams.length > 2} onToggle={() => toggleHistoryGroup("posttests")} />
        {visiblePosttestExams.map(exam => { const position = posttestExams.findIndex(item => item.uuid === exam.uuid) + 1; const label = `Posttest ${position} - Plan de repaso ${activePlanNumber}`; return <EvaluationInfoCard key={exam.uuid} label={label} detail={exam.title} description={formatStudyDate(exam.completed_at ?? null)} score={Number(exam.score_percentage)} completedAt={exam.completed_at ?? null} availableAt={null} onPress={() => void openStoredEvaluation(exam, label)} color="#0369a1" colors={colors} />; })}
        <EvaluationInfoCard label={`Próximo posttest ${posttestExams.length + 1} - Plan de repaso ${activePlanNumber}`} detail="Evaluación de progreso del ciclo" description="" score={null} completedAt={null} availableAt={activeStudyBlock.posttest_available_at} onPress={() => undefined} color="#0369a1" colors={colors} />
      </View>
      {storedExamError && <View style={[s.inlineError, { borderColor: colors.inputBorder }]}><Text style={[s.blockStateText, { color: colors.subtitle }]}>{storedExamError}</Text></View>}

      {activeStudyBlock.due_reviews > 0 && <Pressable onPress={openPendingReviews} style={({ pressed }) => [s.dueReviewCard, { backgroundColor: darkMode ? "#422006" : "#fffbeb", borderColor: darkMode ? "#92400e" : "#fbbf24" }, pressed && { transform: [{ scale: .985 }], backgroundColor: darkMode ? "#4f2707" : "#fef3c7" }]}><View style={s.dueReviewIcon}><CalendarClock size={21} color="#d97706" /></View><View style={{ flex: 1 }}><View style={s.dueReviewHeading}><Text style={[s.dueReviewTitle, { color: colors.text }]}>{activeStudyBlock.due_reviews === 1 ? "1 revisión por realizar" : `${activeStudyBlock.due_reviews} revisiones por realizar`}</Text><View style={s.dueReviewBadge}><Text style={s.dueReviewBadgeText}>PENDIENTE</Text></View></View><Text style={[s.dueReviewText, { color: colors.subtitle }]}>Toca para ver tus revisiones vencidas o disponibles.</Text></View><View style={s.dueReviewAction}><Text style={s.dueReviewActionText}>Ver</Text><ChevronRight size={16} color="#b45309" /></View></Pressable>}

      {activeStudyBlockContexts.length > 0 && <View style={s.studyContextSection}>
        <Text style={[s.studyContextTitle, { color: colors.text }]}>Temas de estudio</Text>
        <Text style={[s.studyContextDescription, { color: colors.subtitle }]}>Organizados por tipo de examen, área y especialidad</Text>
        <View style={s.planTopicGroups}>{activeStudyBlockExamGroups.map(group => {
          const expanded = expandedBlockContextGroups.includes(group.key);
          return <View key={group.key} style={[s.planTopicsAccordion, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpandedBlockContextGroups(current => current.includes(group.key) ? current.filter(key => key !== group.key) : [...current, group.key])} style={({ pressed }) => [s.planTopicsAccordionHeader, pressed && { opacity: .75 }]}>
              <View style={s.planTopicsAccordionIcon}><GraduationCap size={20} color="#0284c7" /></View>
              <View style={{ flex: 1 }}><Text style={[s.planTopicsExam, { color: colors.text }]}>{group.examType}</Text><Text style={[s.planTopicsPath, { color: colors.subtitle }]}>{group.selections.length === 1 ? "1 selección" : `${group.selections.length} selecciones`} · {group.topicCount} temas</Text></View>
              <View style={s.planTopicsAccordionCount}><Text style={s.planTopicsAccordionCountText}>{group.topicCount}</Text></View>
              {expanded ? <ChevronUp size={20} color="#0284c7" /> : <ChevronDown size={20} color="#0284c7" />}
            </Pressable>
            {expanded && <View style={[s.studyExamSelections, { borderTopColor: colors.inputBorder }]}>{group.selections.map(selection => <View key={selection.key} style={[s.studySelectionGroup, { backgroundColor: colors.background, borderColor: colors.inputBorder }]}>
              <View style={s.studySelectionPath}><View style={s.studySelectionPathIcon}><Target size={16} color="#9333ea" /></View><View style={{ flex: 1 }}><Text style={[s.studySelectionMetaLabel, { color: colors.subtitle }]}>ÁREA</Text><Text style={[s.studySelectionArea, { color: colors.text }]}>{selection.area}</Text><View style={s.studySelectionSpecialtyRow}><Stethoscope size={12} color="#16a34a" /><Text style={[s.studySelectionSpecialty, { color: colors.subtitle }]}>Especialidad: {selection.specialty}</Text></View></View></View>
              <View style={s.studySelectionTopics}>{selection.themes.map((theme, index) => <View key={theme.uuid} style={s.studySelectionTopic}><View style={s.studySelectionTopicNumber}><Text style={s.studySelectionTopicNumberText}>{String(index + 1).padStart(2, "0")}</Text></View><Text style={[s.studySelectionTopicText, { color: colors.text }]}>{theme.theme}</Text></View>)}</View>
            </View>)}</View>}
          </View>;
        })}</View>
      </View>}
    </ScrollView>}

    {mode === "evaluationSummary" && storedEvaluation && <View style={{ flex: 1 }}>
      <View style={[simulatorResultStyles.tabsWrapper, { backgroundColor: colors.background }]}>
        <Pressable style={[simulatorResultStyles.tabBtn, { backgroundColor: colors.themeButton }, storedEvaluationTab === "summary" && simulatorResultStyles.tabBtnActive]} onPress={() => setStoredEvaluationTab("summary")}><Text style={[simulatorResultStyles.tabBtnText, s.resultsTabText, { color: storedEvaluationTab === "summary" ? "#fff" : colors.subtitle }]}>Resumen</Text></Pressable>
        <Pressable style={[simulatorResultStyles.tabBtn, { backgroundColor: colors.themeButton }, storedEvaluationTab === "exam" && simulatorResultStyles.tabBtnActive]} onPress={() => setStoredEvaluationTab("exam")}><Text style={[simulatorResultStyles.tabBtnText, s.resultsTabText, { color: storedEvaluationTab === "exam" ? "#fff" : colors.subtitle }]}>Visualización del examen</Text></Pressable>
      </View>
      {storedEvaluationTab === "summary" ? <ScrollView contentContainerStyle={s.resultsContent} showsVerticalScrollIndicator>
      <View style={[s.resultsCard, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}> 
        <View style={s.resultsHeading}><View style={s.resultsTrophy}><Trophy size={24} color="#f59e0b" /></View><View style={s.resultsHeadingText}><Text style={[s.resultsTitle, { color: colors.text }]}>{storedEvaluation.label}</Text><Text style={[s.resultsSubtitle, { color: colors.subtitle }]}>Resumen de tu evaluación</Text></View></View>
        <PretestDoughnut percentage={storedEvaluation.score} darkMode={darkMode} />
        <View style={[s.storedResultBanner, { backgroundColor: darkMode ? (storedEvaluation.score >= 50 ? "#422006" : "#450a0a") : (storedEvaluation.score >= 50 ? "#fffbeb" : "#fef2f2") }]}><Award size={18} color={storedEvaluation.score >= 50 ? "#d97706" : "#ef4444"} /><View><Text style={[s.storedResultTitle, { color: colors.text }]}>Resultado registrado</Text><Text style={[s.storedResultText, { color: colors.subtitle }]}>Obtuviste {Math.round(storedEvaluation.score)}% en esta evaluación.</Text></View></View>
      </View>
      <TopicPerformance items={storedTopicPerformance} colors={colors} darkMode={darkMode} />
      <View style={[s.examDetailCard, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
        <View style={s.examDetailHeader}><Award size={21} color="#0284c7" /><Text style={[s.examDetailTitle, { color: colors.text }]}>Detalle de la evaluación</Text></View>
        <View style={[s.examDetailRow, { borderBottomColor: colors.inputBorder }]}><Text style={[s.examDetailLabel, { color: colors.subtitle }]}>Examen</Text><Text style={[s.examDetailValue, { color: colors.text }]}>{storedEvaluation.label}</Text></View>
        <View style={[s.examDetailRow, { borderBottomColor: colors.inputBorder }]}><Text style={[s.examDetailLabel, { color: colors.subtitle }]}>{storedEvaluation.examType.includes(" · ") ? "Tipos de examen" : "Tipo de examen"}</Text><Text style={[s.examDetailValue, { color: colors.text }]}>{storedEvaluation.examType}</Text></View>
        <View style={[s.examDetailRow, { borderBottomColor: colors.inputBorder }]}><Text style={[s.examDetailLabel, { color: colors.subtitle }]}>Preguntas</Text><Text style={[s.examDetailValue, { color: colors.text }]}>{storedEvaluation.total}</Text></View>
        <View style={[s.examDetailRow, { borderBottomColor: colors.inputBorder }]}><Text style={[s.examDetailLabel, { color: colors.subtitle }]}>Tiempo empleado</Text><Text style={[s.examDetailValue, { color: colors.text }]}>{formatElapsedTime(storedEvaluation.timeSpent)}</Text></View>
        <View style={[s.examDetailRow, { borderBottomWidth: 0 }]}><Text style={[s.examDetailLabel, { color: colors.subtitle }]}>Fecha realizada</Text><Text style={[s.examDetailValue, { color: colors.text }]}>{formatStudyDate(storedEvaluation.completedAt)}</Text></View>
      </View>
      <Pressable onPress={() => setMode("studyBlock")} style={s.primary}><Text style={s.primaryText}>Volver a mi repaso</Text><ChevronRight size={20} color="#fff" /></Pressable>
      </ScrollView> : <FlatList
        data={storedEvaluation.examSummary}
        keyExtractor={(item, index) => `${item.question_id}-${index}`}
        contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
        ListHeaderComponent={<View style={{ marginBottom: 16 }}><Text style={[simulatorResultStyles.examenTitle, { color: colors.text }]}>Revisión de preguntas</Text><Text style={[simulatorResultStyles.examenSubtitle, { color: colors.subtitle }]}>Revisa tus respuestas, la justificación y los distractores.</Text></View>}
        ListEmptyComponent={<View style={s.blockState}><Text style={[s.blockStateText, { color: colors.subtitle }]}>Este examen no contiene preguntas para visualizar.</Text></View>}
        renderItem={({ item, index }) => <PretestReviewCard item={{ id: item.question_id, id_theme: item.id_theme, theme: item.theme, objective_learning: item.objective_learning ?? "", question: item.question, image: null, alternatives: { a: item.alt_a, b: item.alt_b, c: item.alt_c, d: item.alt_d, e: item.alt_e ?? null }, response: item.correct_answer, justification: item.justification, distractor_analysis: item.distractor_analysis, reference: item.reference }} index={index} selectedAnswer={item.response} difficulty={item.difficulty} />}
        showsVerticalScrollIndicator={false}
      />}
    </View>}

    {mode === "welcome" && !blocksStatusLoading && !blocksStatusError && <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.hero}>
        <View style={s.heroDecorationOne} />
        <View style={s.heroDecorationTwo} />
        <View style={s.heroCopy}>
          <View style={s.heroBadge}><Sparkles size={12} color="#075985" /><Text style={s.eyebrow}>TU NUEVO CICLO</Text></View>
          <Text style={s.heroTitle}>Bienvenido a tu repaso adaptativo</Text>
          <Text style={s.heroText}>Elige lo que quieres reforzar y sigue tu progreso cada mes.</Text>
        </View>
        <View style={s.heroVisual}>
          <View style={s.heroIcon}><GraduationCap size={36} color="#0369a1" /></View>
          <View style={s.heroCheck}><Check size={14} color="#fff" /></View>
        </View>
      </View>
      <Text style={[s.sectionTitle, { color: colors.text }]}>¿Cómo funciona?</Text>
      <Step icon={<Target size={23} color="#0284c7" />} title="Selecciona de 4 a 20 temas" text="Elige como mínimo 4 y como máximo 20 temas para construir tu ciclo de repaso." colors={colors} />
      <Step icon={<ClipboardCheck size={23} color="#7c3aed" />} title="Evaluación inicial" text="Realiza una evaluación para conocer tu nivel inicial." colors={colors} />
      <Step icon={<BookOpenCheck size={23} color="#0891b2" />} title="Repaso personalizado" text="Repasa los conocimientos que necesitas reforzar." colors={colors} />
      <Step icon={<CalendarClock size={23} color="#16a34a" />} title="Evaluación de progreso" text="Después de un mes evalúa cuánto has mejorado." colors={colors} />
      <Step icon={<RotateCcw size={23} color="#ea580c" />} title="Incorpora nuevos temas" text="Cuando estén disponibles, podrás crear otro ciclo con 4 a 20 temas nuevos." colors={colors} />
      <Pressable onPress={() => setMode("selection")} style={s.primary}><Text style={s.primaryText}>Comenzar</Text><ChevronRight size={20} color="#fff" /></Pressable>
    </ScrollView>}

    {mode === "selection" && <View style={{ flex: 1 }}>
      <View style={s.selectionIntro}>
        <View style={s.selectionHeading}><View><Text style={[s.selectionKicker, { color: "#0284c7" }]}>PASO {currentStep} DE 4</Text><Text style={[s.selectionTitle, { color: colors.text }]}>{filtersComplete ? "Elige tus temas" : "Configura tu repaso"}</Text></View><View style={[s.stepBadge, { backgroundColor: colors.themeButton }]}><Text style={s.stepBadgeText}>{currentStep}/4</Text></View></View>
        <Text style={[s.selectionText, { color: colors.subtitle }]}>{filtersComplete ? "Selecciona entre 4 y 20 temas para crear tu ciclo." : "Completa cada dato para mostrarte los temas disponibles."}</Text>
        <View style={s.progressSteps}>{[1, 2, 3, 4].map((step, index) => <View key={step} style={s.progressItem}>{index > 0 && <View style={[s.progressLine, { backgroundColor: step <= currentStep ? "#0284c7" : colors.inputBorder }]} />}<View style={[s.progressDot, { backgroundColor: step <= currentStep ? "#0284c7" : colors.card, borderColor: step <= currentStep ? "#0284c7" : colors.inputBorder }]}>{step < currentStep ? <Check size={13} color="#fff" /> : <Text style={[s.progressDotText, { color: step === currentStep ? "#fff" : colors.subtitle }]}>{step}</Text>}</View></View>)}</View>
        <View style={s.progressLabels}><Text style={[s.progressLabel, { color: colors.subtitle }]}>Examen</Text><Text style={[s.progressLabel, { color: colors.subtitle }]}>Área</Text><Text style={[s.progressLabel, { color: colors.subtitle }]}>Especialidad</Text><Text style={[s.progressLabel, { color: colors.subtitle }]}>Temas</Text></View>
      </View>
      <ScrollView contentContainerStyle={s.formContent} showsVerticalScrollIndicator={false}>
        <View style={[s.filterGroup, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
          <FilterField step="01" label="Tipo de examen" value={examType?.label} icon={<ClipboardCheck size={21} color="#0284c7" />} onPress={() => setActiveFilter("exam")} colors={colors} />
          <FilterField step="02" label="Área médica" value={area?.label} icon={<Layers3 size={21} color="#7c3aed" />} loading={areasLoading || areasFetching} disabled={!examType} onPress={() => setActiveFilter("area")} colors={colors} />
          <FilterField step="03" label="Especialidad" value={specialty?.label} icon={<Stethoscope size={21} color="#16a34a" />} loading={specialtiesLoading || specialtiesFetching} disabled={!area} onPress={() => setActiveFilter("specialty")} colors={colors} />
        </View>
        {filtersComplete && <>
          <Pressable disabled={selectedIds.length === 0} onPress={() => setShowSelected(true)} style={[s.selectionBar, { backgroundColor: selectionIsValid ? (darkMode ? "#123525" : "#f0fdf4") : (darkMode ? "#102b3a" : "#f0f9ff"), borderColor: selectionIsValid ? "#86efac" : "#bae6fd" }]}><View style={[s.selectionBarIcon, { backgroundColor: selectionIsValid ? "#16a34a" : "#0284c7" }]}>{selectionIsValid ? <Check size={20} color="#fff" /> : <Text style={s.selectionBarNumber}>{selectedIds.length}</Text>}</View><View style={{ flex: 1 }}><Text style={[s.selectionBarTitle, { color: colors.text }]}>Selecciona {minimumThemes} a {maximumThemes} temas para armar el bloque de repaso</Text><Text style={[s.selectionBarText, { color: colors.subtitle }]}>{selectedIds.length ? `${selectedIds.length} temas seleccionados` : "Selecciona temas de la lista"}</Text></View>{selectedIds.length > 0 && <ChevronRight size={19} color={colors.subtitle} />}</Pressable>
          <View style={s.availableHeader}><View style={{ flex: 1 }}><Text style={[s.topicsTitle, { color: colors.text }]}>Elige tus temas</Text><Text style={[s.filterContext, { color: colors.subtitle }]}>{area?.label} · {specialty?.label}</Text></View><Pressable onPress={() => setActiveFilter("area")} style={[s.changeFilter, { backgroundColor: colors.themeButton }]}><Text style={s.changeFilterText}>Cambiar</Text></Pressable></View>
          <View style={s.inlineTopics}>{themesLoading || themesFetching ? <ActivityIndicator size="large" color="#0284c7" /> : themesError ? <View style={s.themeState}><Text style={[s.themeStateText, { color: colors.subtitle }]}>No pudimos cargar los temas.</Text><Pressable onPress={refetchThemes} style={s.retryButton}><Text style={s.retryText}>Reintentar</Text></Pressable></View> : smartThemesData.length === 0 ? <Text style={[s.themeStateText, { color: colors.subtitle }]}>No hay temas disponibles para esta selección.</Text> : smartThemesData.map(topic => { const active = selectedIds.includes(topic.id); const disabled = topic.blocked || (selectedIds.length >= maximumThemes && !active); return <Pressable key={topic.id} disabled={disabled} onPress={() => toggleTopic(topic)} style={[s.topic, { backgroundColor: active ? (darkMode ? "#123525" : "#f0fdf4") : colors.card, borderColor: active ? "#22c55e" : colors.inputBorder }, disabled && !active && { opacity: .45 }]}><View style={[s.topicIcon, { backgroundColor: active ? "#16a34a" : colors.themeButton }]}>{active ? <Check size={19} color="#fff" /> : topic.blocked ? <X size={18} color={colors.subtitle} /> : <BookOpenCheck size={19} color="#0284c7" />}</View><View style={{ flex: 1 }}><Text style={[s.topicTitle, { color: active ? "#15803d" : colors.text }]}>{topic.theme}</Text>{topic.blocked && <Text style={[s.topicMeta, { color: colors.subtitle }]}>Ya pertenece a tu repaso</Text>}</View>{!topic.blocked && !active && <View style={s.addTopic}><Plus size={17} color="#0284c7" /></View>}</Pressable>; })}</View>
        </>}
      </ScrollView>
      <View style={[s.footer, { backgroundColor: colors.background, borderTopColor: colors.inputBorder }]}>{planError && <Text style={s.objectivesError}>{planError}</Text>}<Pressable disabled={!filtersComplete || !selectionIsValid} onPress={createPlan} style={[s.primary, (!filtersComplete || !selectionIsValid) && s.disabled]}><Text style={s.primaryText}>Armar mi repaso</Text><ChevronRight size={20} color="#fff" /></Pressable></View>
    </View>}

    {mode === "plan" && <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.planReviewHero}><View style={s.planReviewDecoration} /><View style={s.planReviewIcon}><BookOpenCheck size={27} color="#0369a1" /></View><View style={{ flex: 1 }}><Text style={s.planReviewEyebrow}>ÚLTIMO PASO</Text><Text style={s.planReviewTitle}>Revisa tu selección</Text><Text style={s.planReviewText}>Estos temas formarán tu nuevo bloque de repaso adaptativo.</Text></View></View>
      <View style={[s.planReviewSummary, { backgroundColor: darkMode ? "#123525" : "#f0fdf4", borderColor: darkMode ? "#166534" : "#86efac" }]}><View style={s.planReviewSummaryIcon}><Check size={18} color="#fff" /></View><View style={{ flex: 1 }}><Text style={[s.planReviewSummaryTitle, { color: darkMode ? "#bbf7d0" : "#166534" }]}>Selección lista</Text><Text style={[s.planReviewSummaryText, { color: darkMode ? "#86efac" : "#15803d" }]}>{selectedIds.length} temas seleccionados de un máximo de {maximumThemes}</Text></View><View style={s.planReviewCount}><Text style={s.planReviewCountText}>{selectedIds.length}</Text></View></View>
      <View style={s.planReviewSectionHeader}><View><Text style={[s.planReviewSectionTitle, { color: colors.text }]}>Contenido del bloque</Text><Text style={[s.planReviewSectionText, { color: colors.subtitle }]}>Organizado según tu selección</Text></View><Layers3 size={20} color="#0284c7" /></View>
      <View style={s.planTopicGroups}>{selectedTopicGroups.map(group => {
        const expanded = expandedPlanTopicGroups.includes(group.key);
        return <View key={group.key} style={[s.planTopicsAccordion, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}> 
          <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpandedPlanTopicGroups(current => current.includes(group.key) ? current.filter(key => key !== group.key) : [...current, group.key])} style={({ pressed }) => [s.planTopicsAccordionHeader, pressed && { opacity: .75 }]}> 
            <View style={s.planTopicsAccordionIcon}><Layers3 size={20} color="#0284c7" /></View>
            <View style={{ flex: 1 }}>
              <Text style={[s.planTopicsExam, { color: colors.text }]}>{group.exam}</Text>
              <Text style={[s.planTopicsPath, { color: colors.subtitle }]}>{group.area} · {group.specialty}</Text>
            </View>
            <View style={s.planTopicsAccordionCount}><Text style={s.planTopicsAccordionCountText}>{group.topics.length}</Text></View>
            {expanded ? <ChevronUp size={20} color="#0284c7" /> : <ChevronDown size={20} color="#0284c7" />}
          </Pressable>
          {expanded && <View style={[s.planTopicList, s.planTopicsAccordionBody, { borderTopColor: colors.inputBorder }]}>{group.topics.map((item, index) => <View key={item.id} style={[s.planTopicCard, { backgroundColor: colors.background, borderColor: colors.inputBorder }]}><View style={s.planTopicNumber}><Text style={s.planTopicNumberText}>{String(index + 1).padStart(2, "0")}</Text></View><View style={{ flex: 1 }}><Text style={[s.planTopicLabel, { color: colors.subtitle }]}>TEMA DE ESTUDIO</Text><Text style={[s.planTopicTitle, { color: colors.text }]}>{item.theme}</Text></View><View style={[s.planTopicCheck, { backgroundColor: darkMode ? "#123525" : "#dcfce7" }]}><Check size={15} color="#16a34a" /></View></View>)}</View>}
        </View>;
      })}</View>
      {planError && <Text style={s.objectivesError}>{planError}</Text>}
      <View style={s.detailActions}><Pressable disabled={Boolean(studyBlockId) || blocksLoading || pretestLoading} onPress={() => setMode("selection")} style={[s.detailSecondary, { borderColor: colors.inputBorder, backgroundColor: colors.card }, (Boolean(studyBlockId) || blocksLoading || pretestLoading) && s.disabled]}><ArrowLeft size={17} color={colors.text} /><Text style={[s.detailSecondaryText, { color: colors.text }]}>Editar selección</Text></Pressable><Pressable disabled={blocksLoading || pretestLoading} onPress={confirmPlan} style={[s.detailPrimary, (blocksLoading || pretestLoading) && s.disabled]}>{blocksLoading || pretestLoading ? <ActivityIndicator color="#fff" /> : <><Check size={18} color="#fff" /><Text style={s.primaryText}>{studyBlockId ? "Reintentar" : "Crear bloque"}</Text></>}</Pressable></View>
    </ScrollView>}

    {mode === "pretest" && currentPretestQuestion && <View style={s.pretestScreen}>
      <View style={s.pretestTopbar}>
        <View>
          <Text style={s.pretestEyebrow}>{isPosttestExam ? "EVALUACIÓN DE PROGRESO" : isReviewExam ? "REPASO ADAPTATIVO" : "EVALUACIÓN INICIAL"}</Text>
          <Text style={[s.pretestProgressText, { color: colors.text }]}>Pregunta {currentQuestionIndex + 1} de {pretestQuestions.length}</Text>
        </View>
        <View style={[s.pretestTimer, { backgroundColor: darkMode ? "#102b3a" : "#e0f2fe" }]}>
          <Clock size={17} color="#0284c7" />
          <Text style={s.pretestTimerText}>{formatElapsedTime(Math.max(PRETEST_DURATION_SECONDS - elapsedSeconds, 0))}</Text>
        </View>
      </View>
      <View style={[s.pretestProgressTrack, { backgroundColor: colors.inputBorder }]}>
        <View style={[s.pretestProgressFill, { width: `${((currentQuestionIndex + 1) / pretestQuestions.length) * 100}%` }]} />
      </View>
      <ScrollView contentContainerStyle={s.pretestContent} showsVerticalScrollIndicator={false}>
        <View style={[s.pretestQuestionCard, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
          <Text style={[s.pretestQuestion, { color: colors.text }]}>{currentPretestQuestion.question}</Text>
        </View>
        <View style={s.pretestOptions}>
          {Object.entries(currentPretestQuestion.alternatives).filter(([, text]) => Boolean(text?.trim())).map(([letter, text]) => {
            const answered = Boolean(currentPretestAnswer);
            return <Pressable
              key={letter}
              disabled={answered || submittingEvaluation}
              onPress={() => selectPretestAnswer(letter)}
              style={({ pressed }) => [
                s.pretestOption,
                { backgroundColor: colors.card, borderColor: colors.inputBorder },
                pressed && {
                  backgroundColor: darkMode ? "#0c4a6e" : "#f0f9ff",
                  borderColor: "#0284c7",
                  transform: [{ scale: 0.99 }],
                },
              ]}
            >
              <View style={[s.pretestOptionLetter, { backgroundColor: colors.themeButton }]}>
                <Text style={[s.pretestOptionLetterText, { color: colors.text }]}>{letter.toUpperCase()}</Text>
              </View>
              <Text style={[s.pretestOptionText, { color: colors.text }]}>{text}</Text>
            </Pressable>;
          })}
        </View>
        {pretestSubmitError && <View style={s.pretestRetryBox}>
          <Text style={s.objectivesError}>{pretestSubmitError}</Text>
          <Pressable onPress={() => submitPretest(pretestAnswers)} style={s.retryButton}><Text style={s.retryText}>Reintentar envío</Text></Pressable>
        </View>}
      </ScrollView>
    </View>}

    {mode === "completed" && completedSummary && <View style={{ flex: 1 }}>
      <View style={[simulatorResultStyles.tabsWrapper, { backgroundColor: colors.background }]}>
        <Pressable style={[simulatorResultStyles.tabBtn, { backgroundColor: colors.themeButton }, completedTab === "summary" && simulatorResultStyles.tabBtnActive]} onPress={() => setCompletedTab("summary")}>
          <Text style={[simulatorResultStyles.tabBtnText, s.resultsTabText, { color: completedTab === "summary" ? "#fff" : colors.subtitle }]}>Resumen</Text>
        </Pressable>
        <Pressable style={[simulatorResultStyles.tabBtn, { backgroundColor: colors.themeButton }, completedTab === "exam" && simulatorResultStyles.tabBtnActive]} onPress={() => setCompletedTab("exam")}>
          <Text style={[simulatorResultStyles.tabBtnText, s.resultsTabText, { color: completedTab === "exam" ? "#fff" : colors.subtitle }]}>Visualización del examen</Text>
        </Pressable>
      </View>
      {completedTab === "summary" ? <ScrollView contentContainerStyle={s.resultsContent} showsVerticalScrollIndicator>
      <View style={[s.resultsCard, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}> 
        <View style={s.resultsHeading}><View style={s.resultsTrophy}><Trophy size={24} color="#f59e0b" /></View><View style={s.resultsHeadingText}><Text style={[s.resultsTitle, { color: colors.text }]}>{isPosttestExam ? "¡Evaluación de progreso finalizada!" : isReviewExam ? "¡Repaso completado!" : "¡Evaluación inicial finalizada!"}</Text><Text style={[s.resultsSubtitle, { color: colors.subtitle }]}>{isPosttestExam ? "Revisa cuánto has mejorado" : isReviewExam ? "Tus respuestas fueron registradas" : "Este es tu punto de partida"}</Text></View></View>
        <PretestDoughnut percentage={completedSummary.score} darkMode={darkMode} />
        <View style={[s.resultsStats, { borderTopColor: colors.inputBorder }]}>
          <ResultStat icon={<CheckCircle2 size={17} color="#16a34a" />} label="Correctas" value={`${completedSummary.correct}/${completedSummary.total}`} background={darkMode ? "#14532d" : "#dcfce7"} colors={colors} />
          <ResultStat icon={<XCircle size={17} color="#ef4444" />} label="Incorrectas" value={`${completedSummary.incorrect}/${completedSummary.total}`} background={darkMode ? "#450a0a" : "#fee2e2"} colors={colors} />
          <ResultStat icon={<HelpCircle size={17} color="#f59e0b" />} label="Sin responder" value={`${completedSummary.unanswered}/${completedSummary.total}`} background={darkMode ? "#78350f" : "#fef3c7"} colors={colors} />
        </View>
      </View>
      <TopicPerformance items={currentTopicPerformance} colors={colors} darkMode={darkMode} />
      <View style={[s.examDetailCard, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
        <View style={s.examDetailHeader}><Award size={21} color="#0284c7" /><Text style={[s.examDetailTitle, { color: colors.text }]}>Detalle de la evaluación</Text></View>
        <View style={[s.examDetailRow, { borderBottomColor: colors.inputBorder }]}><Text style={[s.examDetailLabel, { color: colors.subtitle }]}>{completedSummary.examType.includes(" · ") ? "Tipos de examen" : "Tipo de examen"}</Text><Text style={[s.examDetailValue, { color: colors.text }]}>{completedSummary.examType}</Text></View>
        <View style={[s.examDetailRow, { borderBottomColor: colors.inputBorder }]}><Text style={[s.examDetailLabel, { color: colors.subtitle }]}>Preguntas</Text><Text style={[s.examDetailValue, { color: colors.text }]}>{completedSummary.total}</Text></View>
        <View style={[s.examDetailRow, { borderBottomWidth: 0 }]}><Text style={[s.examDetailLabel, { color: colors.subtitle }]}>Tiempo empleado</Text><Text style={[s.examDetailValue, { color: colors.text }]}>{formatElapsedTime(completedSummary.timeSpent)}</Text></View>
      </View>
      <Pressable onPress={() => isReviewExam || isPosttestExam ? returnToStudyCalendar() : router.back()} style={s.primary}><Text style={s.primaryText}>Finalizar</Text><ChevronRight size={20} color="#fff" /></Pressable>
      </ScrollView> : <FlatList
        data={pretestQuestions}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
        ListHeaderComponent={<View style={{ marginBottom: 16 }}><Text style={[simulatorResultStyles.examenTitle, { color: colors.text }]}>Revisión de preguntas</Text><Text style={[simulatorResultStyles.examenSubtitle, { color: colors.subtitle }]}>Revisa tus respuestas, la justificación y los distractores.</Text></View>}
        renderItem={({ item, index }) => <PretestReviewCard item={item} index={index} selectedAnswer={pretestAnswers[index]?.answer} difficulty={pretestAnswers[index]?.difficulty} />}
        showsVerticalScrollIndicator={false}
      />}
    </View>}

    <Modal visible={Boolean(deleteCandidate)} transparent animationType="fade" onRequestClose={() => !deletingBlock && setDeleteCandidate(undefined)}><View style={s.overlay}><View style={[s.deleteConfirmModal, { backgroundColor: colors.card }]}><View style={s.deleteConfirmHeader}><View style={s.deleteModalIcon}><Trash2 size={25} color="#e11d48" /></View><Pressable disabled={deletingBlock} onPress={() => setDeleteCandidate(undefined)} style={[s.close, { backgroundColor: colors.themeButton }]}><X size={20} color={colors.text} /></Pressable></View><Text style={[s.deleteConfirmTitle, { color: colors.text }]}>Eliminar plan de repaso</Text><Text style={[s.deleteConfirmText, { color: colors.subtitle }]}>¿Deseas eliminar el Plan de repaso {deleteCandidate?.planNumber}?</Text><View style={[s.deleteWarning, { backgroundColor: darkMode ? "#3f1722" : "#fff1f2", borderColor: darkMode ? "#881337" : "#fecdd3" }]}><AlertTriangle size={18} color={darkMode ? "#fda4af" : "#e11d48"} /><Text style={[s.deleteWarningText, { color: darkMode ? "#fecdd3" : "#9f1239" }]}>También se eliminará todo su historial. Esta acción no se puede deshacer.</Text></View><View style={s.deleteConfirmActions}><Pressable disabled={deletingBlock} onPress={() => setDeleteCandidate(undefined)} style={[s.deleteKeepButton, { borderColor: colors.inputBorder }, deletingBlock && s.disabled]}><Text style={[s.secondaryText, { color: colors.text }]}>Conservar</Text></Pressable><Pressable disabled={deletingBlock} onPress={() => void removeStudyBlock()} style={[s.deleteConfirmButton, deletingBlock && s.disabled]}>{deletingBlock ? <ActivityIndicator size="small" color="#fff" /> : <Trash2 size={16} color="#fff" />}<Text style={s.dangerText}>{deletingBlock ? "Eliminando..." : "Sí, eliminar"}</Text></Pressable></View></View></View></Modal>
    <Modal visible={showCancel} transparent animationType="fade" onRequestClose={() => setShowCancel(false)}><View style={s.overlay}><View style={[s.modal, { backgroundColor: colors.card }]}><View style={s.modalTop}><View style={s.dangerIcon}><AlertTriangle size={28} color="#dc2626" /></View><Pressable onPress={() => setShowCancel(false)} style={[s.close, { backgroundColor: colors.themeButton }]}><X size={20} color={colors.text} /></Pressable></View><Text style={[s.modalTitle, { color: colors.text }]}>¿Cancelar tu repaso?</Text><Text style={[s.modalText, { color: colors.subtitle }]}>Se removerán los temas seleccionados y todo el repaso armado.</Text><View style={s.actions}><Pressable onPress={() => setShowCancel(false)} style={[s.secondary, { borderColor: colors.inputBorder }]}><Text style={[s.secondaryText, { color: colors.text }]}>Conservar</Text></Pressable><Pressable onPress={cancelReview} style={s.danger}><Text style={s.dangerText}>Sí, cancelar</Text></Pressable></View></View></View></Modal>
    <Modal visible={showSelected} transparent animationType="slide" onRequestClose={() => setShowSelected(false)}><View style={s.selectorOverlay}><Pressable style={s.selectorBackdrop} onPress={() => setShowSelected(false)} /><View style={[s.selectedModal, { backgroundColor: colors.background, paddingBottom: Math.max(24, insets.bottom + 12) }]}><View style={s.sheetHandle} /><View style={s.selectorHeader}><View><Text style={[s.selectorTitle, { color: colors.text }]}>Temas seleccionados</Text><Text style={[s.selectorSubtitle, { color: colors.subtitle }]}>{selectedIds.length} de {maximumThemes} temas como máximo</Text></View><Pressable onPress={() => setShowSelected(false)} style={[s.close, { backgroundColor: colors.themeButton }]}><X size={20} color={colors.text} /></Pressable></View><ScrollView style={s.selectedModalScroll} contentContainerStyle={s.selectedModalList} showsVerticalScrollIndicator>{selectedTopics.map((topic, index) => <View key={topic.id} style={[s.selectedModalItem, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}><View style={s.selectedIndex}><Text style={s.selectedIndexText}>{index + 1}</Text></View><Text style={[s.selectedModalText, { color: colors.text }]}>{topic.theme}</Text><Pressable onPress={() => toggleTopic(topic)} style={s.removeSelected}><X size={17} color="#ef4444" /></Pressable></View>)}</ScrollView><Pressable disabled={selectedIds.length >= maximumThemes} onPress={() => setShowSelected(false)} style={[s.primary, { marginHorizontal: 20, marginTop: 8 }, selectedIds.length >= maximumThemes && s.disabled]}><Text style={s.primaryText}>{selectedIds.length >= maximumThemes ? "Máximo alcanzado" : "Seguir eligiendo"}</Text></Pressable></View></View></Modal>
    <Modal visible={Boolean(activeFilter)} transparent animationType="slide" onRequestClose={closeFilter}><View style={s.selectorOverlay}><Pressable style={s.selectorBackdrop} onPress={closeFilter} /><View style={[s.selectorModal, { backgroundColor: colors.background, paddingBottom: Math.max(24, insets.bottom + 12) }]}><View style={[s.filterSelectorHeader, { borderBottomColor: colors.inputBorder }]}><Text style={[s.selectorTitle, { color: colors.text }]}>{filterTitle}</Text><Pressable onPress={closeFilter} style={s.filterSelectorClose}><X size={27} color={colors.text} /></Pressable></View><View style={[s.filterSearchBox, { borderBottomColor: colors.subtitle }]}><Search size={22} color={colors.subtitle} /><TextInput value={filterSearch} onChangeText={setFilterSearch} placeholder="Buscar..." placeholderTextColor={colors.subtitle} style={[s.filterSearchInput, { color: colors.text }]} /></View>{filterLoading ? <ActivityIndicator style={{ marginVertical: 30 }} color="#0284c7" /> : examTypesError && activeFilter === "exam" ? <Text style={[s.themeStateText, { color: colors.subtitle }]}>No se pudieron cargar las opciones.</Text> : filterOptions.length === 0 ? <Text style={[s.themeStateText, { color: colors.subtitle }]}>No hay opciones disponibles.</Text> : visibleFilterOptions.length === 0 ? <Text style={[s.themeStateText, { color: colors.subtitle }]}>No se encontraron coincidencias.</Text> : <ScrollView style={s.selectorList} contentContainerStyle={s.filterSelectorListContent} showsVerticalScrollIndicator keyboardShouldPersistTaps="handled" nestedScrollEnabled>{visibleFilterOptions.map(option => <Pressable key={option.id} onPress={() => chooseFilter(option)} style={[s.filterSelectorOption, { borderBottomColor: colors.inputBorder }]}><Text style={[s.filterSelectorText, { color: colors.text }]}>{option.label}</Text></Pressable>)}</ScrollView>}</View></View></Modal>
    <Modal visible={showPerception} transparent animationType="fade" onRequestClose={() => undefined}>
      <View style={s.perceptionOverlay}>
        <View style={[s.perceptionCard, { backgroundColor: colors.card }]}>
          <Text style={[s.perceptionTitle, { color: colors.text }]}>¿Qué tan difícil te costó responder esta pregunta?</Text>
          <Text style={[s.perceptionSubtitle, { color: colors.subtitle }]}>El cronómetro está pausado mientras eliges.</Text>
          <View style={s.perceptionOptions}>
            <PerceptionOption label="Difícil" color="#ef4444" icon={<Frown size={31} color="#ef4444" />} onPress={() => selectDifficulty("hard")} />
            <PerceptionOption label="Regular" color="#d97706" icon={<Meh size={31} color="#d97706" />} onPress={() => selectDifficulty("regular")} />
            <PerceptionOption label="Fácil" color="#15803d" icon={<Smile size={31} color="#15803d" />} onPress={() => selectDifficulty("easy")} />
          </View>
        </View>
      </View>
    </Modal>
    <CommonModal
      visible={blocksLoading || pretestLoading || submittingEvaluation || storedExamLoading || mode === "pretestLoading"}
      onClose={() => undefined}
      title={storedExamLoading ? "Cargando examen" : submittingEvaluation ? (isPosttestExam ? "Enviando tu evaluación de progreso" : isReviewExam ? "Enviando tu repaso" : "Enviando tu evaluación inicial") : isPosttestExam ? "Generando evaluación de progreso" : pretestLoading || mode === "pretestLoading" ? "Generando examen inicial" : "Creando tu bloque de repaso adaptativo"}
      logoSource={require("../../assets/logo_app.png")}
      logoStyle={s.blockLoadingLogo}
      showFooter={false}
      compactBody
    >
      <View style={s.blockLoadingContent}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={[s.blockLoadingText, { color: colors.subtitle }]}>{storedExamLoading ? "Estamos recuperando el detalle de tu examen." : submittingEvaluation ? "Estamos guardando tus respuestas." : pretestLoading || mode === "pretestLoading" ? "Estamos preparando las preguntas de tu evaluación." : "Estamos preparando tu plan personalizado."}</Text>
      </View>
    </CommonModal>
  </SafeAreaView>;
}

function formatStudyDate(value: string | null) {
  if (!value) return "Pendiente";
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function EvaluationInfoCard({ label, detail, description, score, completedAt, availableAt, onPress, color, colors }: { label: string; detail?: string; description: string; score: number | null; completedAt: string | null; availableAt: string | null; onPress: () => void; color: string; colors: ReturnType<typeof useTheme>["colors"] }) {
  const completed = Boolean(completedAt);
  return <Pressable disabled={!completed} onPress={onPress} style={({ pressed }) => [s.evaluationCard, { backgroundColor: colors.card, borderColor: colors.inputBorder }, !completed && { opacity: .78 }, pressed && { borderColor: color, transform: [{ scale: .985 }] }]}> 
    <View style={s.evaluationHeader}>
      <View style={[s.evaluationIcon, { backgroundColor: `${color}18` }]}>{completed ? <Award size={22} color={color} /> : <CalendarClock size={22} color={color} />}</View>
      <View style={s.evaluationCopy}><Text style={[s.evaluationTitle, { color: colors.text }]}>{label}</Text>{detail && detail !== label ? <Text numberOfLines={2} style={[s.evaluationDetail, { color: colors.subtitle }]}>{detail}</Text> : null}{description ? <Text style={[s.evaluationDescription, { color }]}>{description}</Text> : null}</View>
      <View style={s.evaluationHeaderRight}>{completed ? <EvaluationScoreRing score={score ?? 0} colors={colors} /> : <Text style={[s.evaluationPending, { color }]}>{formatStudyDate(availableAt)}</Text>}</View>
    </View>
  </Pressable>;
}

function EvaluationScoreRing({ score, colors }: { score: number; colors: ReturnType<typeof useTheme>["colors"] }) {
  const size = 48;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.max(0, Math.min(100, Math.round(score)));
  const progressColor = percentage >= 70 ? "#16a34a" : percentage >= 50 ? "#f59e0b" : "#ef4444";
  return <View style={s.evaluationScoreRing}>
    <Svg width={size} height={size}>
      <SvgCircle cx={size / 2} cy={size / 2} r={radius} stroke={colors.inputBorder} strokeWidth={strokeWidth} fill="none" />
      <SvgCircle cx={size / 2} cy={size / 2} r={radius} stroke={progressColor} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={circumference - (percentage / 100) * circumference} strokeLinecap="round" fill="none" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </Svg>
    <Text style={[s.evaluationScoreRingText, { color: colors.text }]}>{percentage}%</Text>
  </View>;
}

function EvaluationGroupTitle({ title, count, colors, collapsible = false, expanded = false, onToggle }: { title: string; count: number; colors: ReturnType<typeof useTheme>["colors"]; collapsible?: boolean; expanded?: boolean; onToggle?: () => void }) {
  return <View style={s.evaluationGroupTitle}><View style={s.evaluationGroupHeading}><Text style={[s.evaluationGroupTitleText, { color: colors.subtitle }]}>{title}</Text>{count > 0 && <View style={[s.evaluationGroupCount, { backgroundColor: colors.themeButton }]}><Text style={s.evaluationGroupCountText}>{count}</Text></View>}</View>{collapsible ? <Pressable onPress={onToggle} hitSlop={8} style={({ pressed }) => [s.evaluationGroupToggle, { backgroundColor: colors.themeButton }, pressed && { opacity: .7 }]}><Text style={s.evaluationGroupToggleText}>{expanded ? "Ver menos" : "Ver todos"}</Text>{expanded ? <ChevronUp size={14} color="#0284c7" /> : <ChevronDown size={14} color="#0284c7" />}</Pressable> : null}</View>;
}

function HistoryEmptyState({ icon, title, text, colors }: { icon: React.ReactNode; title: string; text: string; colors: ReturnType<typeof useTheme>["colors"] }) {
  return <View style={[s.historyEmptyState, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}><View style={[s.historyEmptyIcon, { backgroundColor: colors.themeButton }]}>{icon}</View><View style={{ flex: 1 }}><Text style={[s.historyEmptyTitle, { color: colors.text }]}>{title}</Text><Text style={[s.historyEmptyText, { color: colors.subtitle }]}>{text}</Text></View></View>;
}

function DifficultyBadge({ difficulty }: { difficulty: SmartReviewDifficulty }) {
  const config = difficulty === "hard"
    ? { label: "Difícil", color: "#ef4444", background: "#fef2f2", icon: <Frown size={15} color="#ef4444" /> }
    : difficulty === "regular"
      ? { label: "Regular", color: "#d97706", background: "#fffbeb", icon: <Meh size={15} color="#d97706" /> }
      : { label: "Fácil", color: "#15803d", background: "#f0fdf4", icon: <Smile size={15} color="#15803d" /> };
  return <View style={[s.difficultyBadge, { backgroundColor: config.background, borderColor: `${config.color}55` }]}>{config.icon}<Text style={[s.difficultyBadgeText, { color: config.color }]}>{config.label}</Text></View>;
}

function PretestReviewCard({ item, index, selectedAnswer, difficulty }: { item: SmartReviewPretestQuestionDTO; index: number; selectedAnswer?: string; difficulty?: SmartReviewDifficulty }) {
  const { colors, darkMode } = useTheme();
  const justification = item.justification?.trim() ?? "";
  const distractorAnalysis = item.distractor_analysis?.trim() ?? "";
  const reference = item.reference?.trim() ?? "";
  const availableTabs = [
    ...(justification ? [{ id: "justification" as const, label: "Justificación" }] : []),
    ...(distractorAnalysis ? [{ id: "distractors" as const, label: "Distractores" }] : []),
  ];
  const [requestedTab, setRequestedTab] = useState<"justification" | "distractors">("justification");
  const activeTab = availableTabs.some(tab => tab.id === requestedTab) ? requestedTab : availableTabs[0]?.id;
  const selected = selectedAnswer?.toUpperCase() ?? "";
  const correct = item.response?.toUpperCase() ?? "";
  const isAnswered = Boolean(selected);
  const isCorrect = isAnswered && selected === correct;
  const statusBackground = darkMode ? (isCorrect ? "#14532d" : isAnswered ? "#450a0a" : "#78350f") : (isCorrect ? "#dcfce7" : isAnswered ? "#fee2e2" : "#fef3c7");
  const statusColor = darkMode ? "#fff" : isCorrect ? "#166534" : isAnswered ? "#991b1b" : "#9a3412";

  return <View style={[simulatorQuestionStyles.questionContainer, { backgroundColor: colors.card, borderColor: colors.inputBorder, marginTop: 0, marginBottom: 18 }]}> 
    <View style={simulatorQuestionStyles.questionHeader}>
      <View style={simulatorQuestionStyles.questionHeaderRow}>
      <Text style={[simulatorQuestionStyles.questionNumber, { color: colors.subtitle }]}>Pregunta {index + 1}</Text>
      <View style={s.questionBadges}>{difficulty ? <DifficultyBadge difficulty={difficulty} /> : null}<View style={[simulatorResultStyles.statusTag, { backgroundColor: statusBackground }]}><Text style={[simulatorResultStyles.statusTagText, { color: statusColor }]}>{isCorrect ? "Correcta" : isAnswered ? "Incorrecta" : "Sin responder"}</Text></View></View>
      </View>
    </View>
    <Text style={[simulatorQuestionStyles.questionText, { color: colors.text }]}>{item.question}</Text>
    <View style={simulatorQuestionStyles.optionsContainer}>
      {Object.entries(item.alternatives).filter(([, text]) => Boolean(text?.trim())).map(([letter, text]) => {
        const option = letter.toUpperCase();
        const isSelected = selected === option;
        const isCorrectOption = correct === option;
        const borderColor = isCorrectOption ? "#22c55e" : isSelected ? "#ef4444" : colors.inputBorder;
        const backgroundColor = isCorrectOption ? (darkMode ? "#14532d" : "#f0fdf4") : isSelected ? (darkMode ? "#450a0a" : "#fef2f2") : (darkMode ? "#111c2f" : "#fff");
        return <View key={letter} style={[simulatorQuestionStyles.option, { borderColor, backgroundColor }]}> 
          <View style={simulatorQuestionStyles.optionContent}>
          <View style={[simulatorQuestionStyles.optionLetter, darkMode && { backgroundColor: "#1e293b" }, isCorrectOption && simulatorQuestionStyles.optionLetterCorrect, isSelected && !isCorrectOption && simulatorQuestionStyles.optionLetterIncorrect]}><Text style={[simulatorQuestionStyles.optionLetterText, { color: isCorrectOption || isSelected ? "#fff" : colors.text }]}>{option}</Text></View>
          <Text style={[simulatorQuestionStyles.optionText, { color: colors.text }]}>{text}</Text>
          </View>
        </View>;
      })}
    </View>
    {availableTabs.length > 0 ? <>
      <View style={simulatorQuestionStyles.feedbackSection}>
      <View style={[simulatorQuestionStyles.feedbackContainer, { backgroundColor: darkMode ? (isCorrect ? "#14532d" : isAnswered ? "#450a0a" : "#78350f") : (isCorrect ? "#dcfce7" : isAnswered ? "#fee2e2" : "#fef3c7") }]}><Text style={[simulatorQuestionStyles.feedbackText, { color: statusColor }]}>{isCorrect ? "¡Correcto!" : isAnswered ? "Incorrecto" : "Sin responder"}</Text></View>
      <View style={[simulatorQuestionStyles.feedbackTabsContainer, darkMode && { backgroundColor: "#1e293b" }]}> 
        {availableTabs.map(tab => { const active = activeTab === tab.id; return <Pressable key={tab.id} onPress={() => setRequestedTab(tab.id)} style={[simulatorQuestionStyles.feedbackTabItem, active && simulatorQuestionStyles.feedbackTabItemActive, darkMode && active && { backgroundColor: "#164e63" }]}> 
          {tab.id === "justification" ? <Sparkles size={16} color={active ? "#0284c7" : "#64748b"} /> : <HelpCircle size={16} color={active ? "#ea580c" : "#64748b"} />}
          <Text style={[simulatorQuestionStyles.feedbackTabText, active && simulatorQuestionStyles.feedbackTabTextActive, { color: active ? colors.text : colors.subtitle }]}>{tab.label}</Text>
        </Pressable>; })}
      </View>
      {activeTab === "justification" && justification ? <View><View style={[simulatorQuestionStyles.explanationImmediate, darkMode && { backgroundColor: "#111c2f", borderColor: colors.inputBorder, borderLeftColor: "#0284c7" }]}><View style={simulatorQuestionStyles.explanationHeader}><View style={simulatorQuestionStyles.explanationHeaderLeft}><View style={[simulatorQuestionStyles.explanationIconBadge, darkMode && { backgroundColor: "#164e63" }]}><Sparkles size={18} color="#0284c7" /></View><Text style={[simulatorQuestionStyles.explanationTitle, { color: colors.text }]}>Justificación</Text></View></View><Text style={[simulatorQuestionStyles.explanationText, { color: colors.text }]}>{justification}</Text></View>{reference ? <View style={[simulatorQuestionStyles.referenceImmediate, darkMode && { backgroundColor: "#1e1b3b", borderColor: "#493b70", borderLeftColor: "#a78bfa" }]}><View style={simulatorQuestionStyles.referenceHeader}><BookOpenCheck size={15} color={darkMode ? "#c4b5fd" : "#6d28d9"} /><Text style={[simulatorQuestionStyles.referenceTitle, darkMode && { color: "#c4b5fd" }]}>Fuente bibliográfica</Text></View><Text style={[simulatorQuestionStyles.referenceText, { color: colors.subtitle }]}>{reference}</Text></View> : null}</View> : null}
      {activeTab === "distractors" && distractorAnalysis ? <View style={simulatorQuestionStyles.distractorImmediate}><View style={simulatorQuestionStyles.distractorHeader}><View style={simulatorQuestionStyles.distractorHeaderLeft}><View style={[simulatorQuestionStyles.distractorIconBadge, darkMode && { backgroundColor: "#7c2d12" }]}><HelpCircle size={18} color={darkMode ? "#fb923c" : "#ea580c"} /></View><Text style={[simulatorQuestionStyles.distractorTitle, { color: colors.text }]}>Análisis de distractores</Text></View></View><DistractorContent value={distractorAnalysis} darkMode={darkMode} colors={colors} /></View> : null}
      </View>
    </> : <Text style={[simulatorResultStyles.examenSubtitle, { color: colors.subtitle, marginTop: 14 }]}>Esta pregunta no incluye justificación ni distractores.</Text>}
  </View>;
}

function DistractorContent({ value, darkMode, colors }: { value: string; darkMode: boolean; colors: ReturnType<typeof useTheme>["colors"] }) {
  const items = parseDistractorText(value);
  if (!items.length || !items.some(item => item.letter || item.label)) return <Text style={[simulatorQuestionStyles.distractorText, { color: colors.text }]}>{value}</Text>;
  return <View style={simulatorQuestionStyles.distractorList}>{items.map((item, index) => <View key={`${item.letter}-${index}`} style={[simulatorQuestionStyles.distractorItemCard, darkMode && { backgroundColor: "#111c2f", borderColor: colors.inputBorder, borderLeftColor: "#fb923c" }]}><View style={simulatorQuestionStyles.distractorItemHeader}>{item.letter ? <View style={[simulatorQuestionStyles.distractorItemBadge, darkMode && { backgroundColor: "#7c2d12" }]}><Text style={simulatorQuestionStyles.distractorItemBadgeText}>{item.letter}</Text></View> : null}{item.label ? <Text style={[simulatorQuestionStyles.distractorItemLabel, { color: colors.text }]}>{item.label}</Text> : null}</View><Text style={[simulatorQuestionStyles.distractorItemBody, { color: colors.subtitle }]}>{item.text}</Text></View>)}</View>;
}

function PretestDoughnut({ percentage, darkMode }: { percentage: number; darkMode: boolean }) { const size = 174; const strokeWidth = 17; const radius = (size - strokeWidth) / 2; const circumference = 2 * Math.PI * radius; const safePercentage = Math.max(0, Math.min(100, Math.round(percentage))); const color = safePercentage >= 70 ? "#16a34a" : safePercentage >= 50 ? "#f59e0b" : "#ef4444"; return <View style={s.resultChart}><Svg width={size} height={size}><SvgCircle cx={size / 2} cy={size / 2} r={radius} stroke={darkMode ? "#334155" : "#e2e8f0"} strokeWidth={strokeWidth} fill="none" /><SvgCircle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={circumference - (safePercentage / 100) * circumference} strokeLinecap="round" fill="none" transform={`rotate(-90 ${size / 2} ${size / 2})`} /></Svg><View style={s.resultChartCenter}><Text style={[s.resultScore, { color: darkMode ? "#fff" : "#0f172a" }]}>{safePercentage}%</Text><Text style={s.resultScoreLabel}>Puntuación</Text></View></View>; }
function ResultStat({ icon, label, value, background, colors }: { icon: React.ReactNode; label: string; value: string; background: string; colors: ReturnType<typeof useTheme>["colors"] }) { return <View style={s.resultStat}><View style={[s.resultStatIcon, { backgroundColor: background }]}>{icon}</View><Text style={[s.resultStatValue, { color: colors.text }]}>{value}</Text><Text style={[s.resultStatLabel, { color: colors.subtitle }]}>{label}</Text></View>; }
function StudyContextStat({ value, label, color, colors }: { value: number; label: string; color: string; colors: ReturnType<typeof useTheme>["colors"] }) { return <View style={[s.studyContextStat, { backgroundColor: colors.background, borderColor: colors.inputBorder }]}><Text style={[s.studyContextStatValue, { color }]}>{value}</Text><Text numberOfLines={1} style={[s.studyContextStatLabel, { color: colors.subtitle }]}>{label}</Text></View>; }
function Step({ icon, title, text, colors }: { icon: React.ReactNode; title: string; text: string; colors: ReturnType<typeof useTheme>["colors"] }) { return <View style={[s.step, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}><View style={s.stepIcon}>{icon}</View><View style={{ flex: 1 }}><Text style={[s.stepTitle, { color: colors.text }]}>{title}</Text><Text style={[s.stepText, { color: colors.subtitle }]}>{text}</Text></View></View>; }
function PerceptionOption({ label, color, icon, onPress }: { label: string; color: string; icon: React.ReactNode; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [s.perceptionOption, { borderColor: color, backgroundColor: `${color}0D` }, pressed && { backgroundColor: `${color}26`, transform: [{ scale: 0.96 }] }]}>{icon}<Text style={[s.perceptionOptionText, { color }]}>{label}</Text></Pressable>; }
function FilterField({ step, label, value, icon, loading = false, disabled, onPress, colors }: { step: string; label: string; value?: string; icon: React.ReactNode; loading?: boolean; disabled?: boolean; onPress: () => void; colors: ReturnType<typeof useTheme>["colors"] }) {
  const unavailable = disabled || loading;
  return <Pressable disabled={unavailable} onPress={onPress} accessibilityState={{ disabled: unavailable, busy: loading }} style={[s.filterField, { backgroundColor: colors.card, borderColor: colors.inputBorder }, unavailable && s.filterFieldDisabled]}><View style={[s.filterIcon, { backgroundColor: colors.themeButton }]}>{icon}</View><View style={{ flex: 1 }}><View style={s.filterLabelRow}><Text style={[s.filterStep, { color: unavailable ? colors.subtitle : "#0284c7" }]}>{step}</Text><Text style={[s.filterLabel, { color: colors.subtitle }]}>{label}</Text></View><Text style={[s.filterValue, { color: value && !loading ? colors.text : colors.subtitle }]}>{loading ? "Cargando..." : value ?? `Selecciona ${label.toLowerCase()}`}</Text></View>{loading ? <ActivityIndicator size="small" color="#0284c7" /> : value ? <View style={s.fieldComplete}><Check size={14} color="#fff" /></View> : <ChevronDown size={20} color={colors.subtitle} />}</Pressable>;
}

const s = StyleSheet.create({
    screen: {
      flex: 1
    },
    header: {
      height: 58,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "800"
    },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center"
    },
    content: {
      padding: 20,
      paddingTop: 8,
      paddingBottom: 36
    },
    hero: {
      minHeight: 210,
      backgroundColor: "#0369a1",
      borderRadius: 26,
      padding: 22,
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden"
    },
    heroCopy: {
      flex: 1,
      zIndex: 2,
      paddingRight: 10
    },
    heroBadge: {
      alignSelf: "flex-start",
      backgroundColor: "#e0f2fe",
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 5
    },
    eyebrow: {
      color: "#075985",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1
    },
    heroTitle: {
      color: "#fff",
      fontSize: 24,
      lineHeight: 29,
      fontWeight: "900",
      marginTop: 13
    },
    heroText: {
      color: "#e0f2fe",
      fontSize: 13,
      lineHeight: 19,
      marginTop: 9
    },
    heroVisual: {
      width: 92,
      height: 110,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2
    },
    heroIcon: {
      width: 82,
      height: 82,
      borderRadius: 27,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      transform: [{
        rotate: "-4deg"
      }],
      shadowColor: "#082f49",
      shadowOpacity: .22,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 5
      },
      elevation: 5
    },
    heroCheck: {
      position: "absolute",
      right: 0,
      bottom: 4,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "#22c55e",
      borderWidth: 3,
      borderColor: "#0369a1",
      alignItems: "center",
      justifyContent: "center"
    },
    heroDecorationOne: {
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: "rgba(56,189,248,.18)",
      right: -55,
      top: -65
    },
    heroDecorationTwo: {
      position: "absolute",
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 15,
      borderColor: "rgba(255,255,255,.07)",
      left: -35,
      bottom: -45
    },
    sectionTitle: {
      fontSize: 19,
      fontWeight: "900",
      marginTop: 24,
      marginBottom: 14
    },
    step: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
      flexDirection: "row",
      gap: 12,
      marginBottom: 10
    },
    stepIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(2,132,199,.09)",
      alignItems: "center",
      justifyContent: "center"
    },
    stepTitle: {
      fontSize: 15,
      fontWeight: "800"
    },
    stepText: {
      fontSize: 12,
      lineHeight: 18,
      marginTop: 3
    },
    warning: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
      flexDirection: "row",
      gap: 10,
      marginVertical: 8
    },
    warningText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18
    },
    primary: {
      minHeight: 54,
      borderRadius: 15,
      backgroundColor: "#0284c7",
      flexDirection: "row",
      gap: 7,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20
    },
    primaryText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "900"
    },
    disabled: {
      opacity: .45
    },
    selectionIntro: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 18
    },
    selectionHeading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    selectionKicker: {
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.1,
      marginBottom: 4
    },
    selectionTitle: {
      fontSize: 24,
      fontWeight: "900"
    },
    selectionText: {
      fontSize: 13,
      lineHeight: 19,
      marginTop: 6
    },
    stepBadge: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center"
    },
    stepBadgeText: {
      color: "#0284c7",
      fontSize: 13,
      fontWeight: "900"
    },
    progressSteps: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20
    },
    progressItem: {
      flex: 1,
      alignItems: "center",
      position: "relative"
    },
    progressLine: {
      position: "absolute",
      height: 3,
      width: "100%",
      right: "50%",
      top: 14
    },
    progressDot: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2
    },
    progressDotText: {
      fontSize: 11,
      fontWeight: "900"
    },
    progressLabels: {
      flexDirection: "row",
      marginTop: 7
    },
    progressLabel: {
      flex: 1,
      fontSize: 9,
      fontWeight: "700",
      textAlign: "center"
    },
    counter: {
      color: "#0284c7",
      fontSize: 13,
      fontWeight: "900"
    },
    track: {
      height: 7,
      borderRadius: 4,
      overflow: "hidden",
      marginTop: 8
    },
    fill: {
      height: "100%",
      backgroundColor: "#0284c7"
    },
    formContent: {
      paddingHorizontal: 20,
      paddingBottom: 24
    },
    filterGroup: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 10,
      gap: 10,
      shadowColor: "#0f172a",
      shadowOpacity: .04,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3
      },
      elevation: 1
    },
    filterField: {
      minHeight: 76,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12
    },
    filterFieldDisabled: {
      opacity: .55
    },
    fieldDivider: {
      height: 1,
      marginLeft: 54
    },
    filterIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center"
    },
    filterLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6
    },
    filterStep: {
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: .5
    },
    filterLabel: {
      fontSize: 11,
      fontWeight: "700"
    },
    filterValue: {
      fontSize: 14,
      fontWeight: "800",
      marginTop: 3
    },
    fieldComplete: {
      width: 25,
      height: 25,
      borderRadius: 13,
      backgroundColor: "#16a34a",
      alignItems: "center",
      justifyContent: "center"
    },
    selectionSection: {
      marginTop: 20
    },
    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12
    },
    countBadge: {
      backgroundColor: "#e0f2fe",
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 6
    },
    countBadgeComplete: {
      backgroundColor: "#dcfce7"
    },
    countBadgeText: {
      color: "#0284c7",
      fontSize: 11,
      fontWeight: "900"
    },
    countBadgeTextComplete: {
      color: "#16a34a"
    },
    selectionTiles: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8
    },
    selectionTile: {
      width: "48%",
      minHeight: 66,
      borderWidth: 1,
      borderRadius: 14,
      padding: 10,
      paddingRight: 28,
      justifyContent: "center",
      position: "relative"
    },
    emptyTile: {
      borderStyle: "dashed",
      alignItems: "center",
      flexDirection: "row",
      gap: 6,
      paddingRight: 10
    },
    tileCheck: {
      position: "absolute",
      left: 8,
      top: 8,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "#16a34a",
      alignItems: "center",
      justifyContent: "center"
    },
    tileText: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "800",
      paddingLeft: 22
    },
    tileRemove: {
      position: "absolute",
      right: 7,
      top: 7,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#fef2f2",
      alignItems: "center",
      justifyContent: "center"
    },
    emptyNumber: {
      fontSize: 11,
      fontWeight: "900"
    },
    emptyText: {
      fontSize: 11,
      fontWeight: "700"
    },
    selectionBar: {
      minHeight: 72,
      borderWidth: 1,
      borderRadius: 17,
      padding: 12,
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 11
    },
    selectionBarIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center"
    },
    selectionBarNumber: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "900"
    },
    selectionBarTitle: {
      fontSize: 14,
      fontWeight: "900"
    },
    selectionBarText: {
      fontSize: 11,
      marginTop: 3
    },
    availableHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 22
    },
    filterContext: {
      fontSize: 11,
      marginTop: 3
    },
    changeFilter: {
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8
    },
    changeFilterText: {
      color: "#0284c7",
      fontSize: 10,
      fontWeight: "900"
    },
    topicsHeading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 22,
      marginBottom: 8
    },
    topicsTitle: {
      fontSize: 18,
      fontWeight: "900"
    },
    inlineTopics: {
      gap: 10,
      marginTop: 14
    },
    topicList: {
      paddingHorizontal: 20,
      paddingBottom: 18,
      gap: 10
    },
    topic: {
      minHeight: 62,
      borderWidth: 1,
      borderRadius: 15,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 11
    },
    topicIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center"
    },
    addTopic: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "#e0f2fe",
      alignItems: "center",
      justifyContent: "center"
    },
    topicTitle: {
      fontSize: 14,
      fontWeight: "800"
    },
    topicMeta: {
      fontSize: 11,
      marginTop: 3
    },
    themeState: {
      alignItems: "center",
      paddingVertical: 24,
      gap: 10
    },
    themeStateText: {
      fontSize: 13,
      textAlign: "center",
      paddingVertical: 14
    },
    retryButton: {
      borderRadius: 10,
      backgroundColor: "#0284c7",
      paddingHorizontal: 16,
      paddingVertical: 9
    },
    retryText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "800"
    },
    footer: {
      padding: 14,
      paddingHorizontal: 20,
      borderTopWidth: 1
    },
    error: {
      color: "#dc2626",
      fontSize: 12,
      textAlign: "center"
    },
    objectivesError: {
      color: "#dc2626",
      fontSize: 12,
      textAlign: "center",
      marginBottom: 8
    },
    detailHeading: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start"
    },
    detailHeadingIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: "#e0f2fe",
      alignItems: "center",
      justifyContent: "center"
    },
    detailEyebrow: {
      color: "#0284c7",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1
    },
    detailTitle: {
      fontSize: 20,
      fontWeight: "900",
      marginTop: 3
    },
    detailText: {
      fontSize: 12,
      lineHeight: 18,
      marginTop: 5
    },
    planReviewHero: {
      minHeight: 132,
      borderRadius: 24,
      padding: 19,
      backgroundColor: "#0284c7",
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      overflow: "hidden",
      marginBottom: 14
    },
    planReviewDecoration: {
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: 75,
      right: -62,
      top: -78,
      backgroundColor: "rgba(255,255,255,.10)"
    },
    planReviewIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center"
    },
    planReviewEyebrow: {
      color: "#bae6fd",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1.2
    },
    planReviewTitle: {
      color: "#fff",
      fontSize: 21,
      fontWeight: "900",
      marginTop: 3
    },
    planReviewText: {
      color: "#e0f2fe",
      fontSize: 11,
      lineHeight: 17,
      marginTop: 5
    },
    planReviewSummary: {
      minHeight: 72,
      borderWidth: 1,
      borderRadius: 18,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 18
    },
    planReviewSummaryIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor: "#16a34a",
      alignItems: "center",
      justifyContent: "center"
    },
    planReviewSummaryTitle: {
      fontSize: 12,
      fontWeight: "900"
    },
    planReviewSummaryText: {
      fontSize: 10,
      lineHeight: 15,
      marginTop: 2
    },
    planReviewCount: {
      minWidth: 36,
      height: 36,
      borderRadius: 18,
      paddingHorizontal: 8,
      backgroundColor: "#16a34a",
      alignItems: "center",
      justifyContent: "center"
    },
    planReviewCountText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "900"
    },
    planReviewSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    },
    planReviewSectionTitle: {
      fontSize: 16,
      fontWeight: "900"
    },
    planReviewSectionText: {
      fontSize: 10,
      marginTop: 3
    },
    planTopicGroups: {
      gap: 10
    },
    planTopicsAccordion: {
      borderWidth: 1,
      borderRadius: 18,
      overflow: "hidden"
    },
    planTopicsAccordionHeader: {
      minHeight: 76,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 11
    },
    planTopicsAccordionIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: "#e0f2fe",
      alignItems: "center",
      justifyContent: "center"
    },
    planTopicsExam: {
      fontSize: 14,
      fontWeight: "900"
    },
    planTopicsPath: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "600",
      marginTop: 3
    },
    planTopicsAccordionCount: {
      minWidth: 30,
      height: 30,
      paddingHorizontal: 8,
      borderRadius: 15,
      backgroundColor: "#0284c7",
      alignItems: "center",
      justifyContent: "center"
    },
    planTopicsAccordionCountText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "900"
    },
    planTopicsAccordionBody: {
      borderTopWidth: 1,
      padding: 12
    },
    planTopicList: {
      gap: 9
    },
    planTopicCard: {
      minHeight: 66,
      borderWidth: 1,
      borderRadius: 17,
      padding: 11,
      flexDirection: "row",
      alignItems: "center",
      gap: 11
    },
    planTopicNumber: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: "#e0f2fe",
      alignItems: "center",
      justifyContent: "center"
    },
    planTopicNumberText: {
      color: "#0284c7",
      fontSize: 12,
      fontWeight: "900"
    },
    planTopicLabel: {
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: .7
    },
    planTopicTitle: {
      fontSize: 13,
      fontWeight: "900",
      marginTop: 3
    },
    planTopicCheck: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center"
    },
    detailSummary: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    },
    detailSummaryText: {
      fontSize: 12,
      fontWeight: "700"
    },
    detailSummaryPill: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6
    },
    detailSummaryPillText: {
      color: "#0284c7",
      fontSize: 9,
      fontWeight: "900"
    },
    accordionList: {
      gap: 10
    },
    accordion: {
      borderWidth: 1,
      borderRadius: 17,
      overflow: "hidden"
    },
    accordionExpanded: {
      shadowColor: "#0284c7",
      shadowOpacity: .08,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3
      },
      elevation: 2
    },
    accordionHeader: {
      minHeight: 68,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 11
    },
    accordionNumber: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center"
    },
    accordionNumberText: {
      fontSize: 13,
      fontWeight: "900"
    },
    accordionTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: "900"
    },
    accordionRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7
    },
    objectiveCount: {
      minWidth: 26,
      height: 26,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 7
    },
    objectiveCountText: {
      color: "#0284c7",
      fontSize: 10,
      fontWeight: "900"
    },
    chevronButton: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center"
    },
    accordionMeta: {
      fontSize: 11,
      marginTop: 3
    },
    accordionBody: {
      borderTopWidth: 1,
      padding: 12,
      gap: 9
    },
    objectiveRow: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 11,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 9
    },
    objectiveDot: {
      width: 24,
      height: 24,
      borderRadius: 8,
      backgroundColor: "#e0f2fe",
      alignItems: "center",
      justifyContent: "center"
    },
    objectiveDotText: {
      color: "#0284c7",
      fontSize: 10,
      fontWeight: "900"
    },
    objectiveText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18
    },
    emptyObjectives: {
      fontSize: 12,
      textAlign: "center",
      paddingVertical: 8
    },
    detailActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20
    },
    detailSecondary: {
      flex: 1,
      minHeight: 52,
      borderWidth: 1,
      borderRadius: 14,
      flexDirection: "row",
      gap: 7,
      alignItems: "center",
      justifyContent: "center"
    },
    detailSecondaryText: {
      fontSize: 14,
      fontWeight: "800"
    },
    detailPrimary: {
      flex: 1,
      minHeight: 52,
      borderRadius: 14,
      backgroundColor: "#0284c7",
      flexDirection: "row",
      gap: 7,
      alignItems: "center",
      justifyContent: "center"
    },
    confirmedBanner: {
      borderWidth: 1,
      borderColor: "#86efac",
      backgroundColor: "#f0fdf4",
      borderRadius: 15,
      padding: 13,
      marginTop: 16,
      flexDirection: "row",
      gap: 10,
      alignItems: "center"
    },
    confirmedTitle: {
      color: "#15803d",
      fontSize: 14,
      fontWeight: "900"
    },
    confirmedText: {
      color: "#166534",
      fontSize: 11,
      marginTop: 2
    },
    planHero: {
      borderWidth: 1,
      borderRadius: 22,
      padding: 22,
      alignItems: "center"
    },
    successIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#16a34a",
      alignItems: "center",
      justifyContent: "center"
    },
    planTitle: {
      fontSize: 22,
      fontWeight: "900",
      marginTop: 13
    },
    planText: {
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
      marginTop: 6
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10
    },
    selectedTopic: {
      width: "48%",
      minHeight: 76,
      borderWidth: 1,
      borderRadius: 15,
      padding: 12
    },
    number: {
      color: "#0284c7",
      fontSize: 11,
      fontWeight: "900"
    },
    selectedText: {
      fontSize: 13,
      fontWeight: "800",
      marginTop: 7
    },
    assessment: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginVertical: 18
    },
    assessmentTitle: {
      fontSize: 15,
      fontWeight: "800"
    },
    cancel: {
      minHeight: 50,
      alignItems: "center",
      justifyContent: "center"
    },
    cancelText: {
      color: "#dc2626",
      fontSize: 14,
      fontWeight: "800"
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(15,23,42,.62)",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    },
    modal: {
      width: "100%",
      maxWidth: 420,
      borderRadius: 24,
      padding: 20
    },
    modalTop: {
      flexDirection: "row",
      justifyContent: "space-between"
    },
    dangerIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: "#fee2e2",
      alignItems: "center",
      justifyContent: "center"
    },
    deleteModalIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: "#fff1f2",
      alignItems: "center",
      justifyContent: "center"
    },
    deleteConfirmModal: {
      width: "100%",
      maxWidth: 390,
      borderRadius: 24,
      padding: 20,
      shadowColor: "#0f172a",
      shadowOpacity: .2,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10
    },
    deleteConfirmHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    deleteConfirmTitle: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "900",
      marginTop: 16
    },
    deleteConfirmText: {
      fontSize: 14,
      lineHeight: 20,
      marginTop: 5
    },
    deleteWarning: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 13,
      marginTop: 17,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10
    },
    deleteWarningText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "700"
    },
    deleteConfirmActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20
    },
    deleteKeepButton: {
      flex: 1,
      minHeight: 50,
      borderWidth: 1,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center"
    },
    deleteConfirmButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: 14,
      backgroundColor: "#e11d48",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    },
    close: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center"
    },
    modalTitle: {
      fontSize: 21,
      fontWeight: "900",
      marginTop: 16
    },
    modalText: {
      fontSize: 14,
      lineHeight: 21,
      marginTop: 7
    },
    actions: {
      flexDirection: "row",
      gap: 9,
      marginTop: 20
    },
    secondary: {
      flex: 1,
      minHeight: 50,
      borderWidth: 1,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center"
    },
    secondaryText: {
      fontSize: 13,
      fontWeight: "800"
    },
    danger: {
      flex: 1,
      minHeight: 50,
      borderRadius: 13,
      backgroundColor: "#dc2626",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7
    },
    dangerText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "800"
    },
    selectedModal: {
      width: "100%",
      maxHeight: "75%",
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      paddingBottom: 24
    },
    selectedModalList: {
      paddingHorizontal: 20,
      paddingBottom: 8,
      gap: 9
    },
    selectedModalScroll: {
      flexShrink: 1
    },
    selectedModalItem: {
      minHeight: 58,
      borderWidth: 1,
      borderRadius: 14,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10
    },
    selectedIndex: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor: "#dcfce7",
      alignItems: "center",
      justifyContent: "center"
    },
    selectedIndexText: {
      color: "#16a34a",
      fontSize: 12,
      fontWeight: "900"
    },
    selectedModalText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "800"
    },
    removeSelected: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "#fef2f2",
      alignItems: "center",
      justifyContent: "center"
    },
    selectorOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(15,23,42,.52)"
    },
    selectorBackdrop: {
      ...StyleSheet.absoluteFillObject
    },
    selectorModal: {
      width: "100%",
      maxHeight: "82%",
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      paddingBottom: 24,
      overflow: "hidden"
    },
    sheetHandle: {
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: "#cbd5e1",
      alignSelf: "center",
      marginTop: 9
    },
    selectorHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12
    },
    selectorTitle: {
      fontSize: 20,
      fontWeight: "900"
    },
    filterSelectorHeader: {
      minHeight: 66,
      borderBottomWidth: 1,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    filterSelectorClose: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center"
    },
    filterSearchBox: {
      minHeight: 58,
      borderBottomWidth: 1,
      marginHorizontal: 30,
      flexDirection: "row",
      alignItems: "center",
      gap: 12
    },
    filterSearchInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 12
    },
    filterSelectorListContent: {
      paddingHorizontal: 30,
      paddingTop: 18
    },
    filterSelectorOption: {
      minHeight: 62,
      borderBottomWidth: 1,
      paddingHorizontal: 16,
      justifyContent: "center"
    },
    filterSelectorText: {
      fontSize: 16,
      fontWeight: "400"
    },
    selectorSubtitle: {
      fontSize: 12,
      marginTop: 3
    },
    searchBox: {
      minHeight: 48,
      borderWidth: 1,
      borderRadius: 14,
      marginHorizontal: 20,
      marginBottom: 10,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 9
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      paddingVertical: 10
    },
    selectorList: {
      flexGrow: 0
    },
    selectorListContent: {
      paddingHorizontal: 20,
      paddingBottom: 10
    },
    selectorOption: {
      minHeight: 58,
      borderWidth: 1,
      borderRadius: 14,
      marginBottom: 8,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    selectorText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      paddingRight: 12
    },
    pretestScreen: {
      flex: 1
    },
    pretestTopbar: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    pretestEyebrow: {
      color: "#0284c7",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1
    },
    pretestProgressText: {
      fontSize: 18,
      fontWeight: "900",
      marginTop: 3
    },
    pretestTimer: {
      minWidth: 88,
      height: 40,
      paddingHorizontal: 12,
      borderRadius: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7
    },
    pretestTimerText: {
      color: "#0284c7",
      fontSize: 14,
      fontWeight: "900"
    },
    pretestProgressTrack: {
      height: 5,
      marginHorizontal: 20,
      borderRadius: 3,
      overflow: "hidden"
    },
    pretestProgressFill: {
      height: "100%",
      backgroundColor: "#0284c7",
      borderRadius: 3
    },
    pretestContent: {
      padding: 20,
      paddingBottom: 36
    },
    pretestQuestionCard: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 18
    },
    pretestQuestion: {
      fontSize: 17,
      lineHeight: 25,
      fontWeight: "800"
    },
    pretestOptions: {
      gap: 10,
      marginTop: 16
    },
    pretestOption: {
      minHeight: 62,
      borderWidth: 1,
      borderRadius: 16,
      padding: 11,
      flexDirection: "row",
      alignItems: "center",
      gap: 11
    },
    pretestOptionLetter: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center"
    },
    pretestOptionLetterText: {
      fontSize: 14,
      fontWeight: "900"
    },
    pretestOptionText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600"
    },
    pretestRetryBox: {
      alignItems: "center",
      gap: 10,
      marginTop: 18
    },
    perceptionOverlay: {
      flex: 1,
      backgroundColor: "rgba(15,23,42,.65)",
      justifyContent: "center",
      padding: 20
    },
    blockState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      gap: 12
    },
    blockStateTitle: {
      fontSize: 18,
      fontWeight: "900",
      textAlign: "center"
    },
    blockStateText: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center"
    },
    studyContent: {
      padding: 20,
      paddingTop: 8,
      paddingBottom: 40,
      gap: 16
    },
    studyBlockLoading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 36
    },
    studyBlockLoadingIcon: {
      width: 76,
      height: 76,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18
    },
    studyBlockLoadingTitle: {
      fontSize: 17,
      fontWeight: "900",
      textAlign: "center"
    },
    studyBlockLoadingText: {
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      marginTop: 7
    },
    studyContextSection: {
      gap: 4
    },
    studyContextCard: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 16
    },
    studyContextCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 8
    },
    studyContextCardSubtitle: {
      fontSize: 10,
      marginTop: 3
    },
    studyContextTitle: {
      fontSize: 16,
      fontWeight: "900",
      marginBottom: 0
    },
    studyContextDescription: {
      fontSize: 10,
      lineHeight: 15,
      marginBottom: 8
    },
    studyContextStats: {
      flexDirection: "row",
      gap: 7
    },
    studyContextStat: {
      flex: 1,
      minWidth: 0,
      height: 58,
      borderWidth: 1,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 3
    },
    studyContextStatValue: {
      fontSize: 18,
      fontWeight: "900"
    },
    studyContextStatLabel: {
      fontSize: 8,
      fontWeight: "800",
      marginTop: 2
    },
    studyExamSelections: {
      borderTopWidth: 1,
      padding: 10,
      gap: 9
    },
    studySelectionGroup: {
      borderWidth: 1,
      borderRadius: 14,
      padding: 11
    },
    studySelectionPath: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      marginBottom: 10
    },
    studySelectionPathIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: "#f3e8ff",
      alignItems: "center",
      justifyContent: "center"
    },
    studySelectionArea: {
      fontSize: 12,
      fontWeight: "900"
    },
    studySelectionMetaLabel: {
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: .6,
      marginBottom: 2
    },
    studySelectionSpecialty: {
      fontSize: 9,
      fontWeight: "700"
    },
    studySelectionSpecialtyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 3
    },
    studySelectionTopics: {
      gap: 6
    },
    studySelectionTopic: {
      minHeight: 34,
      flexDirection: "row",
      alignItems: "center",
      gap: 9
    },
    studySelectionTopicNumber: {
      width: 29,
      height: 29,
      borderRadius: 9,
      backgroundColor: "#e0f2fe",
      alignItems: "center",
      justifyContent: "center"
    },
    studySelectionTopicNumberText: {
      color: "#0284c7",
      fontSize: 9,
      fontWeight: "900"
    },
    studySelectionTopicText: {
      flex: 1,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "800"
    },
    studyHero: {
      backgroundColor: "#0369a1",
      borderRadius: 24,
      padding: 20
    },
    studyHeroTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13
    },
    studyHeroIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: "rgba(255,255,255,.18)",
      alignItems: "center",
      justifyContent: "center"
    },
    blocksHistoryContent: { padding: 20, paddingTop: 10, paddingBottom: 40, gap: 14 },
    blocksHistoryHero: { borderWidth: 1, borderRadius: 22, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
    blocksHistoryHeroIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: "#0284c7", alignItems: "center", justifyContent: "center" },
    blocksHistoryTitle: { fontSize: 18, fontWeight: "900" },
    blocksHistoryText: { fontSize: 11, lineHeight: 16, marginTop: 3 },
    blocksHistoryTotal: { minWidth: 34, height: 34, paddingHorizontal: 9, borderRadius: 17, alignItems: "center", justifyContent: "center" },
    blocksHistoryTotalText: { color: "#0284c7", fontSize: 14, fontWeight: "900" },
    newCycleBanner: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", gap: 11 },
    newCycleIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center" },
    newCycleTitle: { fontSize: 13, lineHeight: 18, fontWeight: "900" },
    newCycleText: { fontSize: 10, marginTop: 3 },
    blocksList: { gap: 12 },
    blockHistoryCard: { borderWidth: 1, borderRadius: 22, padding: 16, shadowColor: "#0f172a", shadowOpacity: .04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
    blockHistoryTop: { flexDirection: "row", alignItems: "center", gap: 11 },
    blockHistoryNumber: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#e0f2fe", alignItems: "center", justifyContent: "center" },
    blockHistoryTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    blockHistoryTitle: { fontSize: 15, fontWeight: "900" },
    blockHistoryDate: { fontSize: 10, marginTop: 3 },
    blockHistoryChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
    blockHistoryChip: { minHeight: 30, paddingHorizontal: 10, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 6 },
    blockHistoryChipText: { fontSize: 10, fontWeight: "800" },
    blockStatusPill: { marginLeft: "auto", borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5 },
    blockStatusText: { fontSize: 9, fontWeight: "900" },
    blockHistoryThemes: { fontSize: 10, lineHeight: 15, marginTop: 11 },
    blockHistoryActions: { marginTop: 10, flexDirection: "row", justifyContent: "flex-end" },
    blockDeleteAction: { minHeight: 32, borderRadius: 10, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 6 },
    blockDeleteActionText: { color: "#e11d48", fontSize: 10, fontWeight: "900" },
    studyEyebrow: {
      color: "#bae6fd",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1
    },
    studyHeroTitle: {
      color: "#fff",
      fontSize: 21,
      fontWeight: "900",
      marginTop: 2
    },
    studyHeroText: {
      color: "#e0f2fe",
      fontSize: 12,
      marginTop: 3
    },
    studyProgressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
      marginBottom: 8
    },
    studyProgressLabel: { color: "#e0f2fe", fontSize: 12, fontWeight: "700" },
    studyProgressValue: { color: "#fff", fontSize: 13, fontWeight: "900" },
    studyProgressTrack: { height: 9, borderRadius: 5, overflow: "hidden", backgroundColor: "rgba(255,255,255,.2)" },
    studyProgressFill: { height: "100%", borderRadius: 5, backgroundColor: "#4ade80" },
    studyProgressCaption: { color: "#bae6fd", fontSize: 10, marginTop: 7 },
    studyProgressHint: { color: "#e0f2fe", fontSize: 9, marginTop: 3 },
    studyScores: { flexDirection: "row", gap: 12 },
    studyScoreCard: { flex: 1, minHeight: 150, borderWidth: 1, borderRadius: 19, padding: 14 },
    studyScoreIcon: { width: 37, height: 37, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 11 },
    studyScoreLabel: { fontSize: 10, fontWeight: "700", minHeight: 28 },
    studyScoreValue: { fontSize: 21, fontWeight: "900", marginTop: 3 },
    studyScoreDate: { fontSize: 9, lineHeight: 13, marginTop: 5 },
    historySummary: { minHeight: 76, borderWidth: 1, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 8, flexDirection: "row", alignItems: "center" },
    historySummaryItem: { flex: 1, alignItems: "center", justifyContent: "center" },
    historySummaryValue: { fontSize: 20, fontWeight: "900" },
    historySummaryLabel: { fontSize: 9, fontWeight: "800", marginTop: 2, textTransform: "uppercase", letterSpacing: .35 },
    historySummaryDivider: { width: 1, height: 34 },
    evaluationList: { gap: 12 },
    evaluationGroupTitle: { marginTop: 4, paddingHorizontal: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    evaluationGroupHeading: { flex: 1, flexDirection: "row", alignItems: "center", gap: 7 },
    evaluationGroupTitleText: { fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: .5 },
    evaluationGroupCount: { minWidth: 24, height: 24, paddingHorizontal: 7, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    evaluationGroupCountText: { color: "#0284c7", fontSize: 11, fontWeight: "900" },
    historyEmptyState: { minHeight: 66, borderWidth: 1, borderStyle: "dashed", borderRadius: 16, padding: 11, flexDirection: "row", alignItems: "center", gap: 10 },
    historyEmptyIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    historyEmptyTitle: { fontSize: 12, fontWeight: "900" },
    historyEmptyText: { fontSize: 9, lineHeight: 14, marginTop: 3 },
    evaluationGroupToggle: { minHeight: 32, borderRadius: 10, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 3 },
    evaluationGroupToggleText: { color: "#0284c7", fontSize: 9, fontWeight: "900" },
    evaluationCard: { borderWidth: 1, borderRadius: 20, overflow: "hidden" },
    evaluationHeader: { minHeight: 92, padding: 14, flexDirection: "row", alignItems: "center", gap: 11 },
    evaluationIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    evaluationCopy: { flex: 1, minWidth: 0 },
    evaluationTitle: { fontSize: 14, fontWeight: "900" },
    evaluationDetail: { fontSize: 10, lineHeight: 14, marginTop: 3 },
    evaluationDescription: { fontSize: 9, fontWeight: "800", marginTop: 5, textTransform: "uppercase" },
    evaluationHeaderRight: { flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 0 },
    evaluationScoreRing: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
    evaluationScoreRingText: { position: "absolute", fontSize: 11, fontWeight: "900" },
    evaluationPending: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
    evaluationBody: { borderTopWidth: 1, padding: 14, gap: 13 },
    evaluationResultBox: { borderRadius: 16, padding: 16, alignItems: "center" },
    evaluationResultCaption: { fontSize: 10, fontWeight: "700" },
    evaluationResultScore: { fontSize: 34, fontWeight: "900", marginTop: 3 },
    evaluationResultDate: { fontSize: 10, marginTop: 3 },
    evaluationAvailableDate: { fontSize: 18, fontWeight: "900", marginTop: 6, textTransform: "capitalize" },
    evaluationInfoRow: { flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 3 },
    evaluationInfoText: { flex: 1, fontSize: 11, lineHeight: 17 },
    historyLoading: { minHeight: 76, borderWidth: 1, borderRadius: 18, alignItems: "center", justifyContent: "center", gap: 8 },
    storedResultBanner: { width: "100%", borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
    storedResultTitle: { fontSize: 12, fontWeight: "900" },
    storedResultText: { fontSize: 10, marginTop: 2 },
    questionBadges: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap", gap: 6, flexShrink: 1 },
    difficultyBadge: { minHeight: 27, paddingHorizontal: 8, borderRadius: 9, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 4 },
    difficultyBadgeText: { fontSize: 9, fontWeight: "900" },
    dueReviewCard: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", gap: 11 },
    dueReviewIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center" },
    dueReviewTitle: { fontSize: 13, fontWeight: "900" },
    dueReviewText: { fontSize: 10, lineHeight: 15, marginTop: 3 },
    dueReviewHeading: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7 },
    dueReviewBadge: { backgroundColor: "#fef3c7", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
    dueReviewBadgeText: { color: "#b45309", fontSize: 7, fontWeight: "900", letterSpacing: .5 },
    dueReviewAction: { minWidth: 43, height: 32, borderRadius: 10, backgroundColor: "#fef3c7", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 1 },
    dueReviewActionText: { color: "#b45309", fontSize: 10, fontWeight: "900" },
    studySectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
    studySectionTitle: { fontSize: 18, fontWeight: "900" },
    studySectionText: { fontSize: 11, marginTop: 3 },
    studyCount: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    studyCountText: { color: "#0284c7", fontSize: 13, fontWeight: "900" },
    studyObjectiveCount: { fontSize: 9, marginTop: 3 },
    inlineError: { borderWidth: 1, borderRadius: 18, padding: 18, alignItems: "center", gap: 10 },
    perceptionCard: {
      borderRadius: 24,
      padding: 20
    },
    perceptionTitle: {
      fontSize: 20,
      lineHeight: 27,
      fontWeight: "900",
      textAlign: "center"
    },
    perceptionSubtitle: {
      fontSize: 12,
      textAlign: "center",
      marginTop: 7
    },
    perceptionOptions: {
      flexDirection: "row",
      gap: 9,
      marginTop: 20
    },
    perceptionOption: {
      flex: 1,
      minHeight: 104,
      borderWidth: 2,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      gap: 9
    },
    perceptionOptionText: {
      fontSize: 12,
      fontWeight: "900"
    },
    resultsContent: {
      padding: 20,
      paddingTop: 10,
      paddingBottom: 36,
      gap: 16
    },
    resultsCard: {
      borderWidth: 1,
      borderRadius: 26,
      padding: 20,
      alignItems: "center",
      shadowColor: "#0f172a",
      shadowOpacity: 0.06,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 7 },
      elevation: 3
    },
    resultsHeading: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 11
    },
    resultsHeadingText: {
      flex: 1,
      justifyContent: "center"
    },
    resultsTabText: {
      fontSize: 12,
      lineHeight: 16,
      textAlign: "center"
    },
    resultsTrophy: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: "#fef3c7",
      alignItems: "center",
      justifyContent: "center"
    },
    resultsTitle: {
      flexShrink: 1,
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "900"
    },
    resultsSubtitle: {
      fontSize: 12,
      marginTop: 3
    },
    resultChart: {
      width: 174,
      height: 174,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 22
    },
    resultChartCenter: {
      position: "absolute",
      alignItems: "center"
    },
    resultScore: {
      fontSize: 37,
      fontWeight: "900"
    },
    resultScoreLabel: {
      color: "#64748b",
      fontSize: 12,
      fontWeight: "700"
    },
    resultsStats: {
      width: "100%",
      borderTopWidth: 1,
      paddingTop: 17,
      flexDirection: "row",
      justifyContent: "space-between"
    },
    resultStat: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 3
    },
    resultStatIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 7
    },
    resultStatValue: {
      fontSize: 14,
      fontWeight: "900"
    },
    resultStatLabel: {
      fontSize: 9,
      fontWeight: "700",
      textAlign: "center",
      marginTop: 2
    },
    examDetailCard: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 16
    },
    examDetailHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      marginBottom: 8
    },
    examDetailTitle: {
      fontSize: 16,
      fontWeight: "900"
    },
    examDetailRow: {
      minHeight: 52,
      borderBottomWidth: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 14,
      gap: 12
    },
    examDetailLabel: {
      width: "31%",
      flexShrink: 0,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "600"
    },
    examDetailValue: {
      flex: 1,
      flexShrink: 1,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "right",
      fontWeight: "900"
    },
    blockLoadingContent: {
      alignItems: "center",
      gap: 14,
      paddingVertical: 8
    },
    blockLoadingLogo: {
      width: 138,
      height: 138
    },
    blockLoadingText: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center"
    }
  });
