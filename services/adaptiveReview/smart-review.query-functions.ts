import type {
  SmartReviewPretestResponseDTO,
} from "@/types/adaptiveReview/smart-review-theme.dto";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { normalizeGeneratedQuestions } from "./smart-review.transforms";
import { isSuccessfulParsingError, waitForRetry } from "./smart-review.utils";

type ExecuteBaseQuery = (
  args: FetchArgs,
) => ReturnType<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>>;

const MAX_REQUEST_ATTEMPTS = 3;

export const generateSmartReviewPretestQuery = async (
  idStudyBlock: number,
  baseQuery: ExecuteBaseQuery,
) => {
  let lastResult: Awaited<ReturnType<ExecuteBaseQuery>> | undefined;

  for (let attempt = 0; attempt < MAX_REQUEST_ATTEMPTS; attempt += 1) {
    if (attempt > 0) await waitForRetry(250 * attempt);

    const result = await baseQuery({
      url: `/smart-review/blocks/${idStudyBlock}/pretest`,
      method: "POST",
    });
    lastResult = result;

    if (!result.error) {
      return {
        data: normalizeGeneratedQuestions(
          result.data as SmartReviewPretestResponseDTO,
        ),
      };
    }

    if (!isSuccessfulParsingError(result.error)) {
      return { error: result.error };
    }
  }

  return { error: lastResult!.error! };
};

export const getSmartReviewPosttestQuery = async (
  idStudyBlock: number,
  baseQuery: ExecuteBaseQuery,
) => {
  let lastResult: Awaited<ReturnType<ExecuteBaseQuery>> | undefined;

  for (let attempt = 0; attempt < MAX_REQUEST_ATTEMPTS; attempt += 1) {
    if (attempt > 0) await waitForRetry(300 * attempt);

    const result = await baseQuery({
      url: `/smart-review/blocks/${idStudyBlock}/posttest`,
      method: "GET",
    });
    lastResult = result;

    if (!result.error) {
      const response = result.data as {
        status: boolean;
        data: SmartReviewPretestResponseDTO;
      };
      return { data: normalizeGeneratedQuestions(response.data) };
    }

    if (!isSuccessfulParsingError(result.error)) {
      return { error: result.error };
    }
  }

  return { error: lastResult!.error! };
};
