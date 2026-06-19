export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  role: 'CITOYEN' | 'PROFESSIONNEL' | 'REGIE' | 'ADMIN' | 'FORMATEUR' | 'AUTORITE';
  avatar?: string;
  profilePicture?: string;
  points?: number;
  badge?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}
