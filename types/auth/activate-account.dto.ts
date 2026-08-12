export interface ActivateAccountRequestDTO {
  email: string;
  code: string;
}

export interface ActivateAccountResponseDTO {
  message: string;
}

export interface ResendActivationRequestDTO {
  email: string;
}

export interface ResendActivationResponseDTO {
  message: string;
}
