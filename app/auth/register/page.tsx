'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useWatch, Control } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { RegisterFormValues } from '@/lib/auth-types';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { UserPlus, Plane } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Define a type that matches our Zod schema
type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const registerSchema = z.object({
  fullName: z.string().min(1, { message: 'Please enter your name' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(1, { message: 'Please enter your phone number' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const { register: registerUser, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    email?: 'valid' | 'invalid' | 'checking' | null;
    phone?: 'valid' | 'invalid' | 'checking' | null;
  }>({});
  const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const phoneCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Watch email and phone values for real-time validation
  const email = useWatch({
    control,
    name: 'email',
    defaultValue: '',
  });

  const phone = useWatch({
    control,
    name: 'phone',
    defaultValue: '',
  });

  // Debounced validation for email
  useEffect(() => {
    // Clear any previous validation state when typing
    if (email) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
      setValidationStatus(prev => ({ ...prev, email: 'checking' }));
      setIsCheckingEmail(true);
      
      // Clear any existing timeout
      if (emailCheckTimeout.current) {
        clearTimeout(emailCheckTimeout.current);
      }
      
      // Check if email is valid before checking availability
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setValidationStatus(prev => ({ ...prev, email: null }));
        setIsCheckingEmail(false);
        return;
      }
      
      // Set a new timeout to check email availability after 800ms of no typing
      emailCheckTimeout.current = setTimeout(async () => {
        try {
          const { data, error } = await supabase.rpc('check_existing_user_details', {
            check_email: email,
            check_phone: '' // We only want to check email here
          });
          
          if (error) {
            console.error('Error checking email:', error);
            setValidationStatus(prev => ({ ...prev, email: null }));
          } else if (data.email_exists) {
            setValidationErrors(prev => ({ 
              ...prev, 
              email: 'This email is already registered'
            }));
            setValidationStatus(prev => ({ ...prev, email: 'invalid' }));
          } else {
            setValidationStatus(prev => ({ ...prev, email: 'valid' }));
          }
        } catch (err) {
          console.error('Failed to check email:', err);
          setValidationStatus(prev => ({ ...prev, email: null }));
        } finally {
          setIsCheckingEmail(false);
        }
      }, 800);
    } else {
      setValidationStatus(prev => ({ ...prev, email: null }));
      setIsCheckingEmail(false);
    }
    
    // Cleanup function
    return () => {
      if (emailCheckTimeout.current) {
        clearTimeout(emailCheckTimeout.current);
      }
    };
  }, [email]);

  // Debounced validation for phone
  useEffect(() => {
    if (phone) {
      setValidationErrors(prev => ({ ...prev, phone: undefined }));
      setValidationStatus(prev => ({ ...prev, phone: 'checking' }));
      setIsCheckingPhone(true);
      
      // Clear any existing timeout
      if (phoneCheckTimeout.current) {
        clearTimeout(phoneCheckTimeout.current);
      }
      
      // Check if phone has basic validation (at least 5 characters)
      if (phone.length < 5) {
        setValidationStatus(prev => ({ ...prev, phone: null }));
        setIsCheckingPhone(false);
        return;
      }
      
      // Set a new timeout to check phone availability after 800ms of no typing
      phoneCheckTimeout.current = setTimeout(async () => {
        try {
          const { data, error } = await supabase.rpc('check_existing_user_details', {
            check_email: '', // We only want to check phone here
            check_phone: phone
          });
          
          if (error) {
            console.error('Error checking phone:', error);
            setValidationStatus(prev => ({ ...prev, phone: null }));
          } else if (data.phone_exists) {
            setValidationErrors(prev => ({ 
              ...prev, 
              phone: 'This phone number is already registered'
            }));
            setValidationStatus(prev => ({ ...prev, phone: 'invalid' }));
          } else {
            setValidationStatus(prev => ({ ...prev, phone: 'valid' }));
          }
        } catch (err) {
          console.error('Failed to check phone:', err);
          setValidationStatus(prev => ({ ...prev, phone: null }));
        } finally {
          setIsCheckingPhone(false);
        }
      }, 800);
    } else {
      setValidationStatus(prev => ({ ...prev, phone: null }));
      setIsCheckingPhone(false);
    }
    
    // Cleanup function
    return () => {
      if (phoneCheckTimeout.current) {
        clearTimeout(phoneCheckTimeout.current);
      }
    };
  }, [phone]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      // Clear previous validation errors
      setValidationErrors({});
      
      // First check if email or phone already exists
      const userDetailsCheck = await checkExistingUserDetails(values.email, values.phone);
      
      // Collect validation errors
      const newValidationErrors: {email?: string; phone?: string} = {};
      
      if (userDetailsCheck.email_exists) {
        newValidationErrors.email = 'This email address is already registered. Please use a different email or try logging in.';
      }
      
      if (userDetailsCheck.phone_exists) {
        newValidationErrors.phone = 'This phone number is already registered. Please use a different phone number.';
      }
      
      // If validation errors exist, set them and stop the registration process
      if (Object.keys(newValidationErrors).length > 0) {
        setValidationErrors(newValidationErrors);
        if (newValidationErrors.email) {
          toast.error(newValidationErrors.email);
        } else if (newValidationErrors.phone) {
          toast.error(newValidationErrors.phone);
        }
        return;
      }
      
      // Create a RegisterFormValues object to pass to registerUser
      const registerValues: RegisterFormValues = {
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        fullName: values.fullName,
        phone: values.phone
      };
      const result = await registerUser(registerValues);
      
      if (result.success) {
          // Email needs confirmation - show the confirmation instructions
          toast.custom((t) => (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-green-100 dark:border-green-900">
              <h3 className="font-medium text-green-700 dark:text-green-400 mb-2">Registration successful!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Please check your email inbox for a confirmation link from Supabase/FlightBooking.
                Click the link to verify your email address before logging in.
              </p>
              <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded mb-3">
                <ul className="text-xs text-green-700 dark:text-green-400 list-disc list-inside space-y-1">
                  <li>The email may take a few minutes to arrive</li>
                  <li>Check your spam/junk folder if you don't see it</li>
                  <li>The confirmation link expires after 24 hours</li>
                </ul>
              </div>
              <div className="flex justify-end">
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      toast.dismiss(t);
                      router.push('/auth/confirm');
                    }}
                    className="text-xs bg-green-600 dark:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Go to confirmation page
                  </button>
                  <button
                    onClick={() => {
                      toast.dismiss(t);
                    }}
                    className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          ), { duration: 10000 });
      } else if (error) {
        toast.error(error);
        clearError();
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
 * Checks if the email or phone number already exists in the database
 * @param email Email to check
 * @param phone Phone number to check
 * @returns An object with email_exists and phone_exists booleans
 */
async function checkExistingUserDetails(email: string, phone: string): Promise<{
  email_exists: boolean;
  phone_exists: boolean;
}> {
  try {
    const { data, error } = await supabase.rpc('check_existing_user_details', {
      check_email: email,
      check_phone: phone
    });
    
    if (error) {
      console.error('Error checking user details:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to check user details:', error);
    // Return false values as fallback to allow registration flow to continue
    return { email_exists: false, phone_exists: false };
  }
}

  // Background animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Animated elements */}
      <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-20">
        <motion.div 
          className="absolute top-40 left-1/3 text-blue-500"
          animate={{
            y: [0, -10, 0],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Plane size={24} />
        </motion.div>
        <motion.div 
          className="absolute bottom-40 right-20 text-indigo-500"
          animate={{
            y: [0, 15, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
          }}
        >
          <Plane size={32} />
        </motion.div>
        <motion.div 
          className="absolute top-20 right-1/4 text-purple-500"
          animate={{
            y: [0, -12, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2,
          }}
        >
          <Plane size={20} />
        </motion.div>
      </div>

      {/* Register card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full"
      >
        <Card className="w-full overflow-hidden glassmorphism shadow-2xl border-white/20 dark:border-gray-800/30">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-indigo-500/10 via-transparent to-blue-500/10 dark:from-indigo-900/20 dark:to-blue-900/20 -z-10"></div>
          
          <CardHeader className="space-y-1 relative pb-6">
            <motion.div 
              variants={itemVariants} 
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-full blur-md"></div>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  className="relative rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 p-4 shadow-lg"
                >
                  <UserPlus className="h-7 w-7 text-white" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl md:text-3xl text-center font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <CardDescription className="text-center text-gray-500 dark:text-gray-400 mt-2">
                Sign up to start booking flights
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-4 pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <Label htmlFor="fullName" className="font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Smith"
                  {...register('fullName')}
                  className={`h-11 bg-white/70 dark:bg-gray-950/50 backdrop-blur-sm border-white/20 dark:border-gray-800/50 focus:border-indigo-500 ${errors.fullName ? 'border-red-500 focus:border-red-500 ring-red-500/30' : ''}`}
                />
                {errors.fullName && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 font-medium ml-1 mt-1"
                  >
                    {errors.fullName.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <Label htmlFor="email" className="font-medium">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...register('email')}
                    className={`h-11 bg-white/70 dark:bg-gray-950/50 backdrop-blur-sm border-white/20 dark:border-gray-800/50 focus:border-indigo-500 pr-10 
                      ${(errors.email || validationErrors.email || validationStatus.email === 'invalid') 
                        ? 'border-red-500 focus:border-red-500 ring-red-500/30' 
                        : validationStatus.email === 'valid' 
                          ? 'border-green-500 focus:border-green-500 ring-green-500/30' 
                          : ''
                      }`}
                  />
                  {/* Status indicator */}
                  <div className="absolute right-3 top-3 pointer-events-none">
                    {isCheckingEmail && (
                      <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {!isCheckingEmail && validationStatus.email === 'valid' && (
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                    {!isCheckingEmail && validationStatus.email === 'invalid' && (
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    )}
                  </div>
                </div>
                {(errors.email || validationErrors.email) && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 font-medium ml-1 mt-1"
                  >
                    {validationErrors.email || errors.email?.message}
                  </motion.p>
                )}
                {email && !errors.email && !validationErrors.email && validationStatus.email === 'valid' && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-green-500 font-medium ml-1 mt-1"
                  >
                    This email is available
                  </motion.p>
                )}
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <Label htmlFor="phone" className="font-medium">Phone Number</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...register('phone')}
                    className={`h-11 bg-white/70 dark:bg-gray-950/50 backdrop-blur-sm border-white/20 dark:border-gray-800/50 focus:border-indigo-500 pr-10
                      ${(errors.phone || validationErrors.phone || validationStatus.phone === 'invalid') 
                        ? 'border-red-500 focus:border-red-500 ring-red-500/30' 
                        : validationStatus.phone === 'valid' 
                          ? 'border-green-500 focus:border-green-500 ring-green-500/30' 
                          : ''
                      }`}
                  />
                  {/* Status indicator */}
                  <div className="absolute right-3 top-3 pointer-events-none">
                    {isCheckingPhone && (
                      <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {!isCheckingPhone && validationStatus.phone === 'valid' && (
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                    {!isCheckingPhone && validationStatus.phone === 'invalid' && (
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    )}
                  </div>
                </div>
                {(errors.phone || validationErrors.phone) && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 font-medium ml-1 mt-1"
                  >
                    {validationErrors.phone || errors.phone?.message}
                  </motion.p>
                )}
                {phone && !errors.phone && !validationErrors.phone && validationStatus.phone === 'valid' && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-green-500 font-medium ml-1 mt-1"
                  >
                    This phone number is available
                  </motion.p>
                )}
              </motion.div>

              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <Label htmlFor="password" className="font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`h-11 bg-white/70 dark:bg-gray-950/50 backdrop-blur-sm border-white/20 dark:border-gray-800/50 focus:border-indigo-500 ${errors.password ? 'border-red-500 focus:border-red-500 ring-red-500/30' : ''}`}
                />
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 font-medium ml-1 mt-1"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <Label htmlFor="confirmPassword" className="font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={`h-11 bg-white/70 dark:bg-gray-950/50 backdrop-blur-sm border-white/20 dark:border-gray-800/50 focus:border-indigo-500 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 ring-red-500/30' : ''}`}
                />
                {errors.confirmPassword && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 font-medium ml-1 mt-1"
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-600 dark:hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-300" 
                  disabled={isSubmitting || validationStatus.email === 'invalid' || validationStatus.phone === 'invalid' || isCheckingEmail || isCheckingPhone}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </div>
                  ) : (
                    'Register'
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>

          <CardFooter className="pt-0">
            <motion.p 
              variants={itemVariants}
              className="w-full text-sm text-center text-gray-500 dark:text-gray-400"
            >
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
              >
                Log in
              </Link>
            </motion.p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
