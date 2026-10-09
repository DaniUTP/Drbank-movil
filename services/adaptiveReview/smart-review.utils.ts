import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const waitForRetry = (milliseconds: number) =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

export const isSuccessfulParsingError = (error: FetchBaseQueryError) =>
  error.status === "PARSING_ERROR" && error.originalStatus === 200;
