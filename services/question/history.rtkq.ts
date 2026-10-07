import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { GetHistoryRequestDTO, GetHistoryResponseDTO, HistoryRequestDTO, HistoryResponseDTO } from "@/types/question/history.dto";

export const historySlice=api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
    history: builder.mutation<HistoryResponseDTO, HistoryRequestDTO[]>({
        invalidatesTags: [TagTypes.History, TagTypes.Ranking],
        query: (body) => ({
            url: '/quiz/history',
            method: 'POST',
            body
        }),
    }),
    getHistory: builder.query<GetHistoryResponseDTO, GetHistoryRequestDTO>({
        providesTags: [TagTypes.History],
        query: (params) => ({
            url: '/quiz/history',
            method: 'GET',
            params
        }),
    })
    })
})

export const { useHistoryMutation, useGetHistoryQuery } = historySlice
