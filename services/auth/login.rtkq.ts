import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { LoginRequestDTO, LoginResponseDTO } from "@/types/auth/login.dto";

export const loginSlice = api.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<LoginResponseDTO, LoginRequestDTO>({
      invalidatesTags: [TagTypes.Profile],
      query: (credentials) => ({
        method: 'POST',
        url: '/auth/login',
        body: credentials,
      }),
    }),
  }),
})

export const { useLoginMutation } = loginSlice