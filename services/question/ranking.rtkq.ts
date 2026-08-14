import { api } from "@/store/api";
import { TagTypes } from "@/store/constants/tagTypes.constants";
import { RankingResponseDTO } from "@/types/question/ranking.dto";

export const rankingSlice=api.injectEndpoints({
    endpoints: builder => ({
        ranking: builder.query<RankingResponseDTO[], void>({
            providesTags: [TagTypes.Ranking],
            query: () => ({
                url: '/quiz/ranking',
                method: 'GET',
            }),
        })
    })
});
export const {useRankingQuery,useLazyRankingQuery}=rankingSlice;