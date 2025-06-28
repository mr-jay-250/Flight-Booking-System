import { supabase } from './supabase';
import { UserProfile } from './auth-types';

/**
 * Interface for profile data used during creation
 */
export interface ProfileCreationData {
  id: string;
  email: string;
  fullName: string;
  phone: string;
}

/**
 * Utility function to create a user profile with multiple fallback methods
 * This function tries multiple approaches to ensure reliable profile creation
 * 
 * @param profileData The profile data to create
 * @param accessToken Optional access token for API authentication
 * @returns Success status and any error message
 */
export async function createUserProfile(
  profileData: ProfileCreationData,
  accessToken?: string | null
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    if (!profileData.id) {
      console.error('No user ID provided for profile creation');
      return { success: false, error: 'No user ID provided' };
    }

    // Always store in localStorage as backup for future attempts
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pendingUserProfile', JSON.stringify(profileData));
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', profileData.id)
      .single();

    if (existingProfile) {
      console.log('Profile already exists:', existingProfile);
      return { success: true, profile: existingProfile as UserProfile };
    }

    // APPROACH 1: Try server-side API with admin privileges
    try {
      console.log('Trying server API for profile creation');
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.fullName,
          phone: profileData.phone,
          token: accessToken,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Profile created successfully via server API:', result);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('pendingUserProfile');
        }
        return { success: true, profile: result.profile as UserProfile };
      } else {
        console.error('Server API error:', result.error);
      }
    } catch (apiErr) {
      console.error('Exception with server API:', apiErr);
    }

    // APPROACH 2: Try RPC function
    try {
      console.log('Trying RPC function for profile creation');
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_user_profile', {
        user_id: profileData.id,
        user_email: profileData.email,
        user_full_name: profileData.fullName,
        user_phone_number: profileData.phone,
      });

      if (!rpcError) {
        console.log('Profile created successfully via RPC');
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('pendingUserProfile');
        }
        return { success: true };
      } else {
        console.error('RPC error:', rpcError);
      }
    } catch (rpcErr) {
      console.error('Exception during RPC:', rpcErr);
    }

    // APPROACH 3: Try direct upsert
    try {
      console.log('Trying direct upsert for profile creation');
      const { data: upsertData, error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(
          {
            id: profileData.id,
            email: profileData.email,
            full_name: profileData.fullName,
            phone_number: profileData.phone,
          },
          {
            onConflict: 'id',
          }
        )
        .select()
        .single();

      if (!upsertError) {
        console.log('Profile created successfully via upsert');
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('pendingUserProfile');
        }
        return { success: true, profile: upsertData as UserProfile };
      } else {
        console.error('Upsert error:', upsertError);
        return { success: false, error: upsertError.message };
      }
    } catch (upsertErr: any) {
      console.error('Exception during upsert:', upsertErr);
      return { success: false, error: upsertErr.message };
    }
  } catch (err: any) {
    console.error('Unexpected error in profile creation:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check if a profile exists for a given user ID
 * 
 * @param userId The user ID to check
 * @returns True if profile exists, false otherwise
 */
export async function checkProfileExists(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    return !error && !!data;
  } catch {
    return false;
  }
}

/**
 * Retrieves pending profile data from localStorage
 * 
 * @param userId Optional user ID to validate against
 * @returns The stored profile data or null if not found
 */
export function getPendingProfileData(userId?: string): ProfileCreationData | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const data = window.localStorage.getItem('pendingUserProfile');
    if (!data) return null;
    
    const profileData = JSON.parse(data) as ProfileCreationData;
    
    // If userId provided, validate it matches
    if (userId && profileData.id && profileData.id !== userId) {
      return null;
    }
    
    return profileData;
  } catch {
    return null;
  }
}
