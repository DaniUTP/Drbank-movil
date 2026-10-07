export type AdaptiveReviewStage = "pretest" | "review" | "posttest";

export type PerceptionLevel = "difficult" | "regular" | "easy";

export interface AdaptiveReviewTopicDTO {
  id: string;
  title: string;
  specialty: string;
  dueLabel: string;
  questionCount: number;
  status: "available" | "completed" | "locked";
  progressPercentage: number;
}

export interface AdaptiveReviewOptionDTO {
  id: string;
  label: string;
  text: string;
}

export interface AdaptiveReviewQuestionDTO {
  id: string;
  prompt: string;
  options: AdaptiveReviewOptionDTO[];
}

export interface AdaptiveReviewSessionDTO {
  id: string;
  topicId: string;
  topicTitle: string;
  stage: AdaptiveReviewStage;
  questions: AdaptiveReviewQuestionDTO[];
}

export interface AdaptiveReviewAnswerRequestDTO {
  sessionId: string;
  questionId: string;
  optionId: string;
  perception?: PerceptionLevel;
  elapsedSeconds: number;
}

export interface AdaptiveReviewAnswerResponseDTO {
  accepted: boolean;
  feedback?: {
    title: string;
    explanation: string;
    tone: "success" | "warning" | "info";
  };
}

export interface AdaptiveReviewCompletionResponseDTO {
  sessionId: string;
  title: string;
  message: string;
  answeredQuestions: number;
  nextActionLabel?: string;
}
