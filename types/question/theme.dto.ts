export interface ThemeRequestDTO{
    specialty:number;
    exam:string;
    area?:number;
    year?:string[];
}
export interface ThemeResponseDTO{
    id:string;
    theme:string;
}
