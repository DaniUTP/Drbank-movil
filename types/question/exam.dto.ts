export interface ExamRequestDTO {
    exam_type: string;
    title: string;
    description: string;
    total_questions: number;
    started_at: string;
}

export interface ExamResponseDTO {
    exam: string;
}

export interface GetExamRequestDTO {
    limit: number;
    page: number;
    exam_type?: string;
    id_study_block?: number;
    difficulty?: boolean;
}

export interface ExamSummaryItem {
    question_id: number;
    id_theme?: string | number;
    id_exam_type?: string;
    exam_type?: string;
    correct_answer: string;
    response: string;
    question: string;
    alt_a: string;
    alt_b: string;
    alt_c: string;
    alt_d: string;
    alt_e?: string | null;
    justification: string;
    reference: string;
    distractor_analysis: string;
    difficulty?: "hard" | "regular" | "easy";
    theme?: string;
    objective_learning?: string;
}
export interface ExamHistoryItemDTO {
    uuid: string;
    exam_type?: string;
    smart_review_stage?: "pretest" | "review" | "posttest" | string;
    stage?: "pretest" | "review" | "posttest" | string;
    id_study_block?: number;
    title: string;
    total_questions: number;
    score_percentage: number | string;
    time_spent: number;
    started_at: string;
    completed_at?: string;
    status?: string;
    recommendation?: string | null;
}

export interface GetExamResponseDTO {
    data: ExamHistoryItemDTO[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface UpdateExamStatusRequestDTO {
    exam: string;
    status: string;
    score_percentage: number;
    time_spent: number;
    exam_summary: ExamSummaryDTO[];
    completed_at: string;
}

export interface ExamSummaryDTO {
    question_id: number;
    response: string;
    difficulty: "hard" | "regular" | "easy";
}
export interface UpdateExamStatusResponseDTO {
    message: string;
}

export interface DownloadExamsRequestDTO {
    exams: string[];
}
export interface DownloadExamsResponseDTO {
    message: string;
}

export interface ExamDetailDTO extends Omit<ExamHistoryItemDTO, "score_percentage"> {
    exam_summary: ExamSummaryItem[];
    score_percentage?: number | string;
}

export interface GetExamDetailResponseDTO {
    status: boolean;
    data: ExamDetailDTO;
}
