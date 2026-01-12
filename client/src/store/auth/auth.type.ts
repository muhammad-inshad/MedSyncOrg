export interface User {
  _id: string;
  name: string;
  email: string;
  phone: number;
  role: "patient" | "doctor" | "admin" | "superadmin";
  isProfileComplete: boolean;
}

export interface AuthState {
  user: User | null;
  userRole: string | null;
  isAuthenticated: boolean;
  profileData: any | null;
}
