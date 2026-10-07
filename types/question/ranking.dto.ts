export interface RankingResponseDTO{
    name:string;
    last_name:string;
    points:number;
    university:string;
}

export interface SaveRankingRequestDTO {
    points: number;
}

export interface SaveRankingResponseDTO {
    message?: string;
}
