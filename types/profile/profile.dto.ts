export interface ProfileResponseDTO{
    name:string;
    last_name:string;
    email:string;
    phone:string;
    university:string;
}
export interface UpdateProfileRequestDTO{
    name:string;
    last_name:string;
    phone:string;
    university:string;
}
export interface UpdateProfileResponseDTO{
    message:string;
}