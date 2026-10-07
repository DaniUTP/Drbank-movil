import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { RankingResponseDTO, SaveRankingRequestDTO, SaveRankingResponseDTO } from "@/types/question/ranking.dto";

export const rankingSlice=api.injectEndpoints({
    endpoints: builder => ({
        ranking: builder.query<RankingResponseDTO[], void>({
            providesTags: [TagTypes.Ranking],
            query: () => ({
                url: '/quiz/ranking',
                method: 'GET',
            }),
        }),
        saveRanking: builder.mutation<SaveRankingResponseDTO, SaveRankingRequestDTO>({
            invalidatesTags: [TagTypes.Ranking],
            query: (body) => ({
                url: '/quiz/ranking',
                method: 'POST',
                body,
            }),
        }),
    })
});
export const {useRankingQuery,useLazyRankingQuery,useSaveRankingMutation}=rankingSlice;
