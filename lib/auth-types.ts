import { User } from '@supabase/supabase-js';
import { Tables } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  address?: string;
  preferred_language?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  card_type: 'visa' | 'mastercard' | 'amex' | 'discover';
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
  payment_methods?: PaymentMethod[];
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, fullName: string, phone: string) => Promise<{ 
    error: string | null, 
    verificationRequired?: boolean, 
    isEmailConfirmed?: boolean,
    userId?: string
  }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean, error: string | null }>;
  generateVerificationCode: (email: string) => Promise<{ success: boolean, error: string | null }>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<{ success: boolean; error: string | null }>;
  addPaymentMethod: (paymentData: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error: string | null }>;
  removePaymentMethod: (paymentId: string) => Promise<{ success: boolean; error: string | null }>;
  setDefaultPaymentMethod: (paymentId: string) => Promise<{ success: boolean; error: string | null }>;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileFormValues {
  full_name: string;
  phone_number: string;
  address?: string;
  preferred_language?: string;
}

export interface PaymentFormValues {
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  cardholder_name: string;
  is_default: boolean;
}
