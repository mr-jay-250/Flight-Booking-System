import { supabase } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  isAdmin: boolean;
}

/**
 * Check if a user is an admin based on environment variable
 */
export function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email);
}

/**
 * Get admin user info if the user is an admin
 */
export async function getAdminUser(accessToken: string): Promise<AdminUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return null;
    }

    if (!isAdminEmail(user.email || '')) {
      return null;
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      full_name: profile?.full_name,
      isAdmin: true
    };
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
}

/**
 * Middleware function to check admin access
 */
export async function requireAdmin(req: Request): Promise<{ admin: AdminUser | null; error?: string }> {
  try {
    // Get access token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { admin: null, error: 'No authorization header' };
    }

    const accessToken = authHeader.slice(7);
    const adminUser = await getAdminUser(accessToken);

    if (!adminUser) {
      return { admin: null, error: 'Not authorized as admin' };
    }

    return { admin: adminUser };
  } catch (error) {
    console.error('Admin auth error:', error);
    return { admin: null, error: 'Authentication failed' };
  }
} 