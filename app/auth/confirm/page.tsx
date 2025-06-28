'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

/**
 * Creates a user profile if one doesn't already exist, using the pending profile data
 * stored in localStorage during registration.
 * 
 * @param userId The confirmed user's ID
 * @param isAlreadyConfirmed Optional flag indicating if the email was already confirmed
 * @returns A promise that resolves to true if profile creation was successful or not needed
 */
async function createUserProfileIfNeeded(userId: string, isAlreadyConfirmed = false): Promise<boolean> {
  try {
    // First, check if a profile already exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    // If there's already a profile, we don't need to create one
    if (existingProfile) {
      console.log('User profile already exists');
      return true;
    }
    
    // Check for pending profile data in localStorage
    const pendingProfileString = localStorage.getItem('pendingUserProfile');
    if (!pendingProfileString) {
      console.log('No pending profile data found');
      return false;
    }
    
    // Parse the stored profile data
    const pendingProfile = JSON.parse(pendingProfileString);
    
    // Confirm this pending profile matches the current user
    if (pendingProfile.id !== userId) {
      console.log('Pending profile ID does not match current user');
      return false;
    }
    
    // Create the user profile using the RPC function
    const { error: createError } = await supabase.rpc('create_user_profile', {
      user_id: userId,
      user_email: pendingProfile.email,
      user_full_name: pendingProfile.fullName,
      user_phone_number: pendingProfile.phone
    });
    
    if (createError) {
      console.error('Failed to create user profile:', createError);
      toast.error('Could not create your profile. Please contact support.');
      return false;
    }
    
    // Profile created successfully, clear the pending data
    localStorage.removeItem('pendingUserProfile');
    
    // Only show the toast if this is not an already confirmed email
    if (!isAlreadyConfirmed) {
      toast.success('Your profile has been created successfully!');
    }
    
    return true;
  } catch (err) {
    console.error('Error creating user profile:', err);
    toast.error('An unexpected error occurred while creating your profile');
    return false;
  }
}

export default function ConfirmPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function checkConfirmationStatus() {
      try {
        // Check if the URL has specific parameters that indicate this is a redirect after confirmation
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);
        const hash = url.hash.substring(1); // Remove the # character
        const hashParams = new URLSearchParams(hash);
        
        // Check for success indicators in the URL
        const hasSuccessParam = searchParams.get('confirmed') === 'true';
        
        // Check for error indicators
        const errorParam = searchParams.get('error') || hashParams.get('error');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
        
        // Check if we have an active session (which would indicate successful confirmation)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (hasSuccessParam || session) {
          // Success case - either explicit success param or we have a session
          setIsSuccess(true);
          
          // Check if the email is already confirmed
          if (session && session.user.email_confirmed_at) {
            toast.success('Your account has been created successfully!');
            
            // Create user profile if needed, passing the already confirmed flag
            const profileCreated = await createUserProfileIfNeeded(session.user.id, true);
            
            // Redirect to home page immediately since email is already confirmed
            router.push('/');
          } else {
            // Email just confirmed in this session
            toast.success('Email confirmed successfully!');
            
            if (session) {
              await createUserProfileIfNeeded(session.user.id, false);
            }
            
            // Redirect to home page after a short delay
            setTimeout(() => {
              router.push('/');
            }, 3000);
          }
        } else if (errorParam || errorDescription) {
          // Error case - explicit error in URL
          setErrorMessage(errorDescription || errorParam || 'Verification failed');
          toast.error('Confirmation failed. Please try again.');
        } else {
          // No clear indicator - could just be a direct visit to the confirmation page
          // In this case, we'll show a neutral message
          setErrorMessage('');
          setIsSuccess(false);
        }
      } catch (err) {
        console.error('Error checking confirmation status:', err);
        setErrorMessage('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    checkConfirmationStatus();
  }, [router]);

  const handleResendConfirmation = async () => {
    try {
      // Try to get the email from localStorage for convenience
      const pendingProfileString = localStorage.getItem('pendingUserProfile');
      const defaultEmail = pendingProfileString 
        ? JSON.parse(pendingProfileString).email 
        : '';
      
      const email = prompt('Please enter your email address to resend the confirmation link:', defaultEmail);
      
      if (!email) return;
      
      setIsLoading(true);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      
      if (error) {
        toast.error(`Failed to resend: ${error.message}`);
      } else {
        toast.success('Confirmation email sent! Please check your inbox.');
      }
    } catch (err) {
      toast.error('An error occurred while resending the confirmation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Card className="w-full overflow-hidden shadow-xl border-white/20 dark:border-gray-800/30">
          <CardHeader className="space-y-1 pb-6 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <CardTitle className="text-2xl">Processing</CardTitle>
                <CardDescription className="mt-2">
                  Please wait while we check your confirmation status...
                </CardDescription>
              </div>
            ) : isSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="mb-4 relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-75"></div>
                  <CheckCircle className="h-16 w-16 text-green-500 relative z-10" />
                </div>
                <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                  Email Confirmed!
                </CardTitle>
                <CardDescription className="mt-2">
                  Your email has been successfully confirmed. You'll be redirected to the home page shortly.
                </CardDescription>
              </motion.div>
            ) : errorMessage ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="mb-4 relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-75"></div>
                  <XCircle className="h-16 w-16 text-red-500 relative z-10" />
                </div>
                <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                  Confirmation Failed
                </CardTitle>
                <CardDescription className="mt-2">
                  {errorMessage}
                </CardDescription>
                <Button 
                  onClick={handleResendConfirmation}
                  variant="outline" 
                  className="mt-4"
                >
                  Request new confirmation link
                </Button>
              </motion.div>
            ) : (
              // Default state - no error, no success, not loading
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="mb-4 relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-75"></div>
                  <Mail className="h-16 w-16 text-blue-500 relative z-10" />
                </div>
                <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                  Email Confirmation
                </CardTitle>
                <CardDescription className="mt-2">
                  <p className="mb-4">
                    To complete your registration, please check your email inbox for a confirmation link 
                    sent from Supabase/FlightBooking and click on it.
                  </p>
                  <p>
                    If you haven't received the email, check your spam folder or request a new confirmation link below.
                  </p>
                </CardDescription>
                <Button 
                  onClick={handleResendConfirmation}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Resend confirmation link
                </Button>
              </motion.div>
            )}
          </CardHeader>

          <CardFooter className="pt-0 flex justify-center">
            {!isLoading && (
              <Button
                onClick={() => router.push('/')}
                variant={isSuccess ? "default" : "outline"}
                className={isSuccess ? "bg-green-600 hover:bg-green-700" : ""}
              >
                Go to Home
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
