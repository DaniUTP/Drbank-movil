export interface ChangePasswordRequestDTO {
    password: string;
    current_password: string;
}
export interface ChangePasswordResponseDTO {
    message: string;
}