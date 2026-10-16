export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  createdAt?: string | Date;
  updateAt?: string | Date;
}

export interface AuthResponseData {
  user: User
}

export interface ApiResponse {
  success: boolean,
  message?: string
}
