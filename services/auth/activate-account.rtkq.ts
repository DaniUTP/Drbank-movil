import { api } from "@/store/api";
import { ActivateAccountRequestDTO, ActivateAccountResponseDTO, ResendActivationRequestDTO, ResendActivationResponseDTO } from "@/types/auth/activate-account.dto";

export const activateAccountSlice = api.injectEndpoints({
  endpoints: builder => ({
    activateAccount: builder.mutation<ActivateAccountResponseDTO, ActivateAccountRequestDTO>({
      query: (data) => ({
        method: 'POST',
        url: '/auth/activation',
        body: data,
      }),
    }),
    resendActivation: builder.mutation<ResendActivationResponseDTO, ResendActivationRequestDTO>({
      query: (data) => ({
        method: 'POST',
        url: '/auth/resend-activation',
        body: data,
      }),
    }),
  }),
});

export const { useActivateAccountMutation, useResendActivationMutation } = activateAccountSlice;
