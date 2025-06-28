import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { AuthStore, AuthUser, UserProfile, PaymentMethod } from '@/lib/auth-types';

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Check if email is confirmed before proceeding
      const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (userError) {
        set({ error: userError.message, isLoading: false });
        return { error: userError.message };
      }

      // Check if user exists and if email is confirmed
      if (userData?.user) {
        // If email is not confirmed
        if (!userData.user.email_confirmed_at) {
          const errorMessage = 'Email not confirmed. Please check your inbox for the confirmation link.';
          set({ error: errorMessage, isLoading: false });
          
          // Resend confirmation email
          await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
              emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/confirm?confirmed=true`
            }
          });
          
          return { error: errorMessage };
        }

        // Get user profile data if it exists
        let { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single();

        // Get payment methods
        const { data: paymentMethods } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('is_default', { ascending: false });

        // Check if we have pending profile data and no existing profile
        let pendingProfileData = null;
        if (!profileData && typeof window !== 'undefined') {
          const pendingProfileString = window.localStorage.getItem('pendingUserProfile');
          if (pendingProfileString) {
            try {
              pendingProfileData = JSON.parse(pendingProfileString);
              
              // If the pending profile is for this user, create it now
              if (pendingProfileData && pendingProfileData.id === userData.user.id) {
                // Create user profile now that user is confirmed and exists in auth.users
                const { error: profileError } = await supabase.rpc('create_user_profile', {
                  user_id: userData.user.id,
                  user_email: pendingProfileData.email,
                  user_full_name: pendingProfileData.fullName,
                  user_phone_number: pendingProfileData.phone
                });
                
                if (!profileError) {
                  // Get the newly created profile
                  const { data: newProfileData } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', userData.user.id)
                    .single();
                    
                  if (newProfileData) {
                    // Clear the pending profile data as it's no longer needed
                    window.localStorage.removeItem('pendingUserProfile');
                    // Use the newly created profile
                    profileData = newProfileData;
                  }
                } else {
                  console.error('Error creating user profile during login:', JSON.stringify(profileError, null, 2));
                }
              }
            } catch (e) {
              console.error('Error parsing pending profile data', e);
            }
          }
        }

        const authUser: AuthUser = {
          id: userData.user.id,
          email: userData.user.email || '',
          profile: profileData || null,
          payment_methods: paymentMethods || [],
        };
        
        set({ user: authUser, isLoading: false, error: null });
        return { error: null };
      }

      return { error: 'Unknown error occurred' };
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      set({ error: errorMessage, isLoading: false });
      return { error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string, fullName: string, phone: string) => {
    set({ isLoading: true, error: null });
    try {
      // Register the user with Supabase Auth and use standard email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Set this to the confirmation route in our app
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/confirm?confirmed=true`
        }
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { error: error.message };
      }

      if (data?.user) {
        // Check if the email was already confirmed
        const isEmailConfirmed = data.user.email_confirmed_at !== null;
        
        // Store the user's registration details for later use after email confirmation
        // We'll use localStorage since this data needs to persist across sessions
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('pendingUserProfile', JSON.stringify({
            id: data.user.id,
            email,
            fullName,
            phone
          }));
        }

        // Don't set the user as authenticated yet since they need to confirm email
        set({ isLoading: false, error: null });
        
        // Verification email is automatically sent by Supabase during signup
        // The email contains a confirmation link, not a code
        
        // Return success and indicate if verification is required
        return { 
          error: null, 
          verificationRequired: !isEmailConfirmed,
          isEmailConfirmed: isEmailConfirmed
        };
      }

      return { error: 'Unknown error occurred' };
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      set({ error: errorMessage, isLoading: false });
      return { error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const { data } = await supabase.auth.getSession();
      const { session } = data;

      if (session?.user) {
        // Get user profile data if it exists
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Get payment methods
        const { data: paymentMethods } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', session.user.id)
          .order('is_default', { ascending: false });
          
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          profile: profileData || null,
          payment_methods: paymentMethods || [],
        };
        set({ user: authUser, error: null });
      } else {
        set({ user: null });
      }
    } catch (err: any) {
      set({ error: err.message, user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  verifyEmail: async (email: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      // Verify email with code using Supabase's OTP verification
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      // Email verification successful
      return { success: true, error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  generateVerificationCode: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      // Generate a new verification code using Supabase's OTP functionality
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          // Make sure we're sending a new code, not a confirmation link
          emailRedirectTo: undefined
        }
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (profileData: Partial<UserProfile>) => {
    const { user } = get();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      // Update local state
      const updatedUser = {
        ...user,
        profile: { ...user.profile, ...profileData } as UserProfile,
      };
      set({ user: updatedUser, isLoading: false, error: null });
      return { success: true, error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  addPaymentMethod: async (paymentData: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { user } = get();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    set({ isLoading: true, error: null });
    try {
      // If this is the first payment method, make it default
      if (paymentData.is_default) {
        // Remove default from other payment methods
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          ...paymentData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      // Update local state
      const updatedUser = {
        ...user,
        payment_methods: [...(user.payment_methods || []), data],
      };
      set({ user: updatedUser, isLoading: false, error: null });
      return { success: true, error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  removePaymentMethod: async (paymentId: string) => {
    const { user } = get();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentId)
        .eq('user_id', user.id);

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      // Update local state
      const updatedUser = {
        ...user,
        payment_methods: user.payment_methods?.filter(pm => pm.id !== paymentId) || [],
      };
      set({ user: updatedUser, isLoading: false, error: null });
      return { success: true, error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  setDefaultPaymentMethod: async (paymentId: string) => {
    const { user } = get();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    set({ isLoading: true, error: null });
    try {
      // Remove default from all payment methods
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set the new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentId)
        .eq('user_id', user.id);

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      // Update local state
      const updatedUser = {
        ...user,
        payment_methods: user.payment_methods?.map(pm => ({
          ...pm,
          is_default: pm.id === paymentId,
        })) || [],
      };
      set({ user: updatedUser, isLoading: false, error: null });
      return { success: true, error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },
}));
