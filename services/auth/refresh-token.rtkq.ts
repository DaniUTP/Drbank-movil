import { api } from "@/store/api";
import { RefreshTokenResponseDTO } from "@/types/auth/refresh-token.dto";

export const refreshTokenSlice=api.injectEndpoints({
  endpoints: builder => ({
    refreshToken: builder.mutation<RefreshTokenResponseDTO, void>({
      query: () => ({
        method: 'POST',
        url: '/auth/refresh',
      }),
    }),
  }),
});
export const { useRefreshTokenMutation } = refreshTokenSlice;
