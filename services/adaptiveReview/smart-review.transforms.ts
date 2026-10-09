import type {
  SmartReviewBlocksStatusResponseDTO,
  SmartReviewDueQuestionsResponseDTO,
  SmartReviewDueResponseDTO,
  SmartReviewPretestResponseDTO,
} from "@/types/adaptiveReview/smart-review-theme.dto";

const DEFAULT_MINIMUM_THEMES = 4;
const DEFAULT_MAXIMUM_THEMES = 20;
const EMPTY_EXAM_COUNTS = { pretests: 0, reviews: 0, posttests: 0 };

const getDateKeyInLima = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
};

const isAvailableByCalendarDate = (
  availableAt: string | null,
  today = getDateKeyInLima(),
) => {
  const availableDate = availableAt?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  return Boolean(availableDate && availableDate <= today);
};

export const normalizeGeneratedQuestions = (
  response: SmartReviewPretestResponseDTO,
): SmartReviewPretestResponseDTO => ({
  ...response,
  questions: (response.questions ?? []).map(question => ({
    ...question,
    id: question.id_question ?? question.question_id ?? question.id,
  })),
});

export const normalizeSmartReviewBlocks = (
  response: SmartReviewBlocksStatusResponseDTO,
): SmartReviewBlocksStatusResponseDTO => ({
  ...response,
  data: {
    ...response.data,
    can_select_new_themes: Boolean(response.data.can_select_new_themes),
    minimum_themes_per_selection:
      response.data.minimum_themes_per_selection || DEFAULT_MINIMUM_THEMES,
    maximum_themes_per_selection:
      response.data.maximum_themes_per_selection || DEFAULT_MAXIMUM_THEMES,
    theme_selection_message: response.data.theme_selection_message ?? "",
    blocks: (response.data.blocks ?? []).map(block => ({
      ...block,
      themes: block.themes ?? [],
      exam_types: block.exam_types ?? (block.exam_type ? [block.exam_type] : []),
      exam_counts: block.exam_counts ?? EMPTY_EXAM_COUNTS,
      posttest_available:
        Boolean(block.posttest_available) ||
        isAvailableByCalendarDate(block.posttest_available_at),
    })),
  },
});

export const normalizeSmartReviewDueQuestions = (
  response: SmartReviewDueQuestionsResponseDTO,
): SmartReviewDueQuestionsResponseDTO => ({
  ...response,
  data: {
    ...response.data,
    questions: normalizeGeneratedQuestions({
      id_study_block: response.data.id_study_block,
      questions: response.data.questions,
    }).questions,
  },
});

export const mergeSmartReviewDueResponses = (
  responses: SmartReviewDueResponseDTO[],
): SmartReviewDueResponseDTO => {
  const data = responses.reduce<SmartReviewDueResponseDTO["data"]>(
    (aggregate, response) => ({
      total: aggregate.total + response.data.total,
      active_reviews: aggregate.active_reviews + response.data.active_reviews,
      overdue_reviews: aggregate.overdue_reviews + response.data.overdue_reviews,
      upcoming_reviews: aggregate.upcoming_reviews + response.data.upcoming_reviews,
      has_active_reviews:
        aggregate.has_active_reviews || response.data.has_active_reviews,
      has_overdue_reviews:
        aggregate.has_overdue_reviews || response.data.has_overdue_reviews,
      has_upcoming_reviews:
        aggregate.has_upcoming_reviews || response.data.has_upcoming_reviews,
      modal_type: null,
      reviews: [...aggregate.reviews, ...response.data.reviews],
    }),
    {
      total: 0,
      active_reviews: 0,
      overdue_reviews: 0,
      upcoming_reviews: 0,
      has_active_reviews: false,
      has_overdue_reviews: false,
      has_upcoming_reviews: false,
      modal_type: null,
      reviews: [],
    },
  );

  data.modal_type = data.has_overdue_reviews
    ? "overdue"
    : data.has_active_reviews
      ? "active"
      : data.has_upcoming_reviews
        ? "upcoming"
        : null;

  return {
    status: responses.every(response => response.status),
    data,
  };
};
