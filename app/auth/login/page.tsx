'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LoginFormValues } from '@/lib/auth-types';
import { motion } from 'framer-motion';
import { LogIn, Plane } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError, resendVerificationCode } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      const success = await login(values);
      
      if (success) {
        toast.success('Successfully logged in!');
      }      else if (error) {
        if (error.includes('Email not verified') || error.includes('Email not confirmed')) {
          // Store the email address for resending the confirmation
          const emailForResend = values.email;
          
          // Show a more helpful message about the confirmation link
          toast.custom((t) => (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-blue-100 dark:border-blue-900">
              <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Email verification required</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Please check your email inbox for a confirmation link from Supabase/FlightBooking.
                Click the confirmation link to verify your email address.
              </p>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    toast.dismiss(t);
                    router.push('/auth/confirm');
                  }}
                  className="w-full mb-1 text-xs bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 px-3 py-2 rounded text-center"
                >
                  Go to confirmation page
                </button>
                <button
                  onClick={async () => {
                    toast.dismiss(t);
                    // Set loading state
                    setIsResending(true);
                    
                    try {
                      const { success, error } = await resendVerificationCode(values.email);
                      if (success) {
                        toast.success('Confirmation email sent! Please check your inbox.');
                      } else {
                        toast.error(error || 'Failed to resend confirmation email');
                      }
                    } catch (err) {
                      toast.error('An error occurred');
                    } finally {
                      setIsResending(false);
                    }
                  }}
                  className="w-full mb-1 text-xs bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 px-3 py-2 rounded text-center"
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'Resend confirmation email'}
                </button>
                <button
                  onClick={() => toast.dismiss(t)}
                  className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          ), { duration: 20000 });
        } else {
          toast.error(error);
        }
        clearError();
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler for resending confirmation emails
  const handleResendConfirmation = async (email: string) => {
    try {
      setIsResending(true);
      toast.loading("Sending confirmation email...");
      
      const result = await resendVerificationCode(email);
      
      toast.dismiss();
      
      if (result.success) {
        toast.success("Confirmation email sent. Please check your inbox.", {
          duration: 5000,
        });
      } else {
        toast.error(`Failed to send email: ${result.error}`, {
          duration: 5000,
        });
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to send confirmation email");
    } finally {
      setIsResending(false);
    }
  };

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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Animated elements */}
      <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-20">
        <motion.div 
          className="absolute top-20 left-10 text-blue-500"
          animate={{
            y: [0, 10, 0],
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
          className="absolute top-40 right-20 text-indigo-500"
          animate={{
            y: [0, -15, 0],
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
          className="absolute bottom-20 left-1/4 text-purple-500"
          animate={{
            y: [0, 12, 0],
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

      {/* Login card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full"
      >
        <Card className="w-full overflow-hidden glassmorphism shadow-2xl border-white/20 dark:border-gray-800/30">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 -z-10"></div>
          
          <CardHeader className="space-y-1 relative pb-6">
            <motion.div 
              variants={itemVariants} 
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur-md"></div>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="relative rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 p-4 shadow-lg"
                >
                  <LogIn className="h-7 w-7 text-white" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl md:text-3xl text-center font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-gray-500 dark:text-gray-400 mt-2">
                Enter your credentials to access your account
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-4 pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <Label htmlFor="email" className="font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...register('email')}
                  className={`h-11 bg-white/70 dark:bg-gray-950/50 backdrop-blur-sm border-white/20 dark:border-gray-800/50 focus:border-blue-500 ${errors.email ? 'border-red-500 focus:border-red-500 ring-red-500/30' : ''}`}
                />
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 font-medium ml-1 mt-1"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="font-medium">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`h-11 bg-white/70 dark:bg-gray-950/50 backdrop-blur-sm border-white/20 dark:border-gray-800/50 focus:border-blue-500 ${errors.password ? 'border-red-500 focus:border-red-500 ring-red-500/30' : ''}`}
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

              <motion.div variants={itemVariants}>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-md hover:shadow-lg transition-all duration-300" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </div>
                  ) : (
                    'Login'
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>

          <CardFooter className="pt-0 flex flex-col space-y-4">
            <motion.p 
              variants={itemVariants}
              className="w-full text-sm text-center text-gray-500 dark:text-gray-400"
            >
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Register
              </Link>
            </motion.p>
            
            <motion.p 
              variants={itemVariants}
              className="w-full text-sm text-center text-gray-500 dark:text-gray-400"
            >
              Need to verify your email?{' '}
              <Link
                href="/auth/confirm"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Go to confirmation page
              </Link>
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border border-gray-200 dark:border-gray-800"
            >
              <p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Having trouble logging in?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam/junk folder for the verification email</li>
                <li>Click the confirmation link in your email to verify your account</li>
                <li>The confirmation link expires after 24 hours</li>
              </ul>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
