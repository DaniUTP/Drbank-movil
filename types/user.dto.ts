// DTOs (Data Transfer Objects) para API requests/responses
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  // Agregar más campos según tu API
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  // Agregar más campos según tu API
}

export interface UpdateUserDTO {
  id: string;
  name?: string;
  email?: string;
  // Agregar más campos según tu API
}
