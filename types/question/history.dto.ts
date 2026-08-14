export interface HistoryRequestDTO {
    questionId: string;
    ok: number;
    error: number;
    empty: number;
    count: number;
}
export interface HistoryResponseDTO {
    message: string;
}
export interface GetHistoryRequestDTO {
    page: number;
    limit: number;
    groupBy: 'area' | 'specialty' | 'theme' | string;
}

export interface GetHistoryItemDTO {
    id: number;
    name: string;
    ok: number;
    error: number;
    empty: number;
    count: number;
}

export interface GetHistoryResponseDTO {
    current_page: number;
    last_page: number;
    history: GetHistoryItemDTO[];
}