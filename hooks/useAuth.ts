import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LoginFormValues, RegisterFormValues } from '@/lib/auth-types';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const router = useRouter();
  const { 
    user, 
    isLoading, 
    error, 
    login, 
    register, 
    logout, 
    checkAuth, 
    clearError,
    verifyEmail: verifyEmailStore,
    generateVerificationCode
  } = useAuthStore();
  
  // Function to resend confirmation email
  const resendVerificationCode = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to resend confirmation email' };
    }
  };
  
  const verifyEmail = async (email: string, token: string) => {
    try {
      // Use token hash (from URL) to verify email
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup',
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to verify email' };
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = async (values: LoginFormValues) => {
    const { email, password } = values;
    const result = await login(email, password);
    
    if (!result.error) {
      router.push('/');
      return true;
    }
    
    return false;
  };

  const handleRegister = async (values: RegisterFormValues) => {
    const { email, password, fullName, phone } = values;
    const result = await register(email, password, fullName, phone);
    
    if (!result.error) {
      // Return both success and email confirmation status
      return { 
        success: true, 
        isEmailConfirmed: result.isEmailConfirmed || false 
      };
    }
    
    return { success: false, isEmailConfirmed: false };
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
    verifyEmail,
    resendVerificationCode
  };
};
