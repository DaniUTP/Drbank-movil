export interface RegisterRequestDTO {
    name: string;
    last_name: string;
    email: string;
    password: string;
    university: string;
    token_fcm?: string;
}
export interface RegisterResponseDTO {
    message: string;
}