export interface StudentProgressResponseDTO {
  summary: StudentProgressSummaryDTO;
  calendar: StudentProgressCalendarDTO[];
  sunday_review: string[];
  weekly_history: StudentWeeklyHistoryDTO[];
}

export interface StudentProgressSummaryDTO {
  total_days: number;
  weekly_progress_percentage: number;
  total_week_topics: number;
  completed_week_topics: number;
  today_progress: number;
  today_total: number;
  today_name: string;
}

export interface StudentProgressCalendarDTO {
  day_name: string;
  date: string;
  percentage: number;
  is_today: boolean;
  topics: StudentProgressTopicDTO[];
  is_completed: boolean;
  total_topics: number;
  completed_topics: number;
}

export interface StudentProgressTopicDTO {
  theme_uuid: string;
  theme: string;
  ip_score: number;
  type: string;
  source: string;
  assigned_date: string;
  status: string;
  is_overdue: boolean;
  is_today: boolean;
}

export interface StudentWeeklyHistoryDTO {
  week_start: string;
  total_topics: number;
  completed_topics: number;
  percentage: number;
}

export interface MarkStudiedRequestDTO{
    theme_uuid:string;
}
export interface MarkStudiedResponseDTO{
    message:string;
}