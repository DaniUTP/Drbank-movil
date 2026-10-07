export interface YearRequestDTO {
    exam: string;
    area?: number;
    specialty?: number;
    theme?: string;
}
export interface YearResponseDTO {
    year: string;
}
