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
}

export interface ExamSummaryItem{
    question_id:number;
    correct_answer:string;
    response:string;
    question:string;
    alt_a:string;
    alt_b:string;
    alt_c:string;
    alt_d:string;
    justification:string;
    reference:string;
    distractor_analysis:string;
}
export interface ExamHistoryItemDTO {
    uuid: string;
    title: string;
    total_questions: number;
    exam_summary: ExamSummaryItem[];
    score_percentage: number | string;
    time_spent: number;
    started_at: string;
    completed_at?: string;
    status?: string;
    recommendation?: string;
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
  correct_answer: string;
  response: string;
}
export interface UpdateExamStatusResponseDTO {
    message:string;
}