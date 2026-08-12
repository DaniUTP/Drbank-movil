import { api } from "@/store/api";
import { RecoveryRequestDTO, RecoveryResponseDTO } from "@/types/auth/recovery.dto";

export const recoverySlice=api.injectEndpoints({
  endpoints: builder => ({
    recovery: builder.mutation<RecoveryResponseDTO, RecoveryRequestDTO>({
      query: (credentials) => ({
        method: 'POST',
        url: '/auth/recovery',
        body: credentials,
      }),
    }),
  }),
});
export const { useRecoveryMutation } = recoverySlice;