export interface SmartReviewThemesRequestDTO {
  id_exam_type: string;
  id_specialty: number;
  id_area: number;
}

export interface SmartReviewThemeResponseDTO {
  id: string;
  theme: string;
  blocked: boolean;
  id_exam_type?: string;
}

export interface SmartReviewBlocksRequestDTO {
  themes: {
    id_theme: string;
    id_exam_type: string;
  }[];
}

export interface SmartReviewBlockThemeDTO {
  uuid: string;
  theme: string;
  id_exam_type: string;
  exam_type?: string;
  id_area?: string | number;
  area?: string;
  area_name?: string;
  id_specialty?: string | number;
  specialty?: string;
  specialty_name?: string;
}

export type SmartReviewExamStage = "pretest" | "review" | "posttest";

export interface SmartReviewExamResultDTO {
  id_exam: number;
  uuid: string;
  exam_type: string;
  stage: SmartReviewExamStage;
  title: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
  score_percentage: number;
  time_spent: number;
  started_at: string;
  completed_at: string;
  status: string;
}

export interface SmartReviewPretestHistoryResponseDTO {
  status: boolean;
  data: SmartReviewExamResultDTO | null;
}

export interface SmartReviewExamHistoryResponseDTO {
  status: boolean;
  data: SmartReviewExamResultDTO[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SmartReviewExamHistoryRequestDTO {
  idStudyBlock: number;
  page?: number;
  limit?: number;
}

export interface SmartReviewBlockDTO {
  id_study_block: number;
  status: string;
  exam_type: string;
  exam_types: string[];
  area?: string;
  area_name?: string;
  specialty?: string;
  specialty_name?: string;
  pretest_score_percentage: number | null;
  pretest_completed_at: string | null;
  posttest_score_percentage: number | null;
  posttest_completed_at: string | null;
  posttest_available_at: string | null;
  posttest_available: boolean;
  due_reviews: number;
  total_reviews: number;
  completed_reviews: number;
  review_progress_percentage: number;
  exam_counts: {
    pretests: number;
    reviews: number;
    posttests: number;
  };
  themes: SmartReviewBlockThemeDTO[];
}

export interface SmartReviewBlocksStatusResponseDTO {
  status: boolean;
  data: {
    has_smart_review: boolean;
    blocks: SmartReviewBlockDTO[];
    can_select_new_themes: boolean;
    theme_selection_status: string;
    minimum_themes_per_selection: number;
    maximum_themes_per_selection: number;
    selection_blocked_by_study_block: number | null;
    next_selection_posttest_at: string | null;
    theme_selection_message: string;
  };
}

export type SmartReviewDueStatus = "active" | "overdue" | "upcoming";

export interface SmartReviewDueItemDTO {
  id_smart_review_assignment: number | null;
  id_student_theme_review: number;
  id_study_block: number;
  id_theme: string;
  theme: string;
  id_exam_type: string;
  initialized_at: string;
  last_reviewed_at: string | null;
  next_review_at: string;
  scheduled_for: string;
  review_status: SmartReviewDueStatus;
  questions_available: boolean;
}

export interface SmartReviewDueResponseDTO {
  status: boolean;
  data: {
    total: number;
    active_reviews: number;
    overdue_reviews: number;
    upcoming_reviews: number;
    has_active_reviews: boolean;
    has_overdue_reviews: boolean;
    has_upcoming_reviews: boolean;
    modal_type: string | null;
    reviews: SmartReviewDueItemDTO[];
  };
}

export interface SmartReviewDueQuestionsRequestDTO {
  id_smart_review_assignment: number;
  id_student_theme_review: number;
}

export interface SmartReviewDueQuestionsResponseDTO {
  status: boolean;
  data: {
    id_study_block: number;
    id_smart_review_assignment: number;
    id_student_theme_review: number;
    id_theme: string;
    theme: string;
    id_exam_type: string;
    scheduled_for: string;
    questions: SmartReviewPretestQuestionDTO[];
  };
}

export interface SmartReviewPretestQuestionDTO {
  id: number;
  id_question?: number;
  question_id?: number;
  id_exam_type?: string;
  exam_type?: string;
  id_theme?: string | number;
  objective_learning?: string;
  theme?: string;
  question: string;
  image: string | null;
  alternatives: Record<"a" | "b" | "c" | "d" | "e", string | null>;
  response?: string;
  justification?: string | null;
  distractor_analysis?: string | null;
  reference?: string | null;
}

export interface SmartReviewPretestResponseDTO {
  id_study_block: number;
  questions: SmartReviewPretestQuestionDTO[];
}

export type SmartReviewDifficulty = "hard" | "regular" | "easy";

export interface SmartReviewPretestAnswerDTO {
  id_question: number;
  answer: string;
  difficulty: SmartReviewDifficulty;
}

export interface SmartReviewExamAnswerDTO {
  id_question: number;
  answer: string;
  difficulty: SmartReviewDifficulty;
}

export interface CompleteSmartReviewPretestRequestDTO {
  title: string;
  time_spent: number;
  started_at: string;
  completed_at: string;
  score_percentage: number;
  answers: SmartReviewExamAnswerDTO[];
}

export interface CompleteSmartReviewPretestResponseDTO {
  status: boolean;
  message: string;
  data: {
    id_exam: number;
    uuid: string;
    id_study_block: number;
    exam_type: string;
    score_percentage: number;
    processing_status: string;
    pretest_completed_at: string;
    posttest_available_at: string;
  };
}

export interface CompleteSmartReviewRequestDTO {
  title: string;
  id_smart_review_assignment: number;
  time_spent: number;
  started_at: string;
  completed_at: string;
  answers: SmartReviewPretestAnswerDTO[];
}

export interface CompleteSmartReviewResponseDTO {
  status: boolean;
  message?: string;
  data?: unknown;
}

export interface SmartReviewPosttestAnswerDTO {
  id_question: number;
  answer: string;
}

export interface CompleteSmartReviewPosttestRequestDTO {
  title: string;
  time_spent: number;
  started_at: string;
  completed_at: string;
  answers: SmartReviewPosttestAnswerDTO[];
}

export interface CompleteSmartReviewPosttestResponseDTO {
  status: boolean;
  message?: string;
  data?: {
    score_percentage?: number;
  };
}
