import { api } from "@/store/api";
import { GetHistoryRequestDTO, GetHistoryResponseDTO, HistoryRequestDTO, HistoryResponseDTO } from "@/types/question/history.dto";

export const historySlice=api.injectEndpoints({
    endpoints: (builder) => ({
    history: builder.query<HistoryResponseDTO, HistoryRequestDTO[]>({
        query: (body) => ({
            url: '/quiz/history',
            method: 'POST',
            body
        }),
    }),
    getHistory: builder.query<GetHistoryResponseDTO, GetHistoryRequestDTO>({
        query: (params) => ({
            url: '/quiz/history',
            method: 'GET',
            params
        }),
    })
    })
})

export const { useHistoryQuery, useLazyHistoryQuery, useGetHistoryQuery } = historySlice