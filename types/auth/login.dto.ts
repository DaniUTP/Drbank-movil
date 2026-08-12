export interface LoginRequestDTO {
  email: string;
  password: string;
  token_fcm: string;
}

export interface LoginResponseDTO {
  access_token: string;
  token_type: string;
  social_login: string;
}

export interface LoginErrorResponseDTO {
  errors: {
    [key: string]: string;
  };
}