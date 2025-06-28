import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { motion } from 'framer-motion';


const passengerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Phone number is required'),
  dob: z.string().min(8, 'Date of birth is required'),
  passport: z.string().optional(),
});

export type PassengerFormValues = z.infer<typeof passengerSchema>;

interface PassengerFormProps {
  onSubmit: (data: PassengerFormValues) => void;
  defaultValues?: Partial<PassengerFormValues>;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({ onSubmit, defaultValues }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerSchema),
    defaultValues,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName" className="text-base font-semibold text-blue-900 dark:text-blue-200">Full Name</Label>
            <Input id="fullName" {...register('fullName')} className="mt-1 bg-white/80 dark:bg-gray-900/80 border-blue-200 dark:border-blue-800 focus:ring-2 focus:ring-blue-400" />
            {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName.message}</span>}
          </div>
          <div>
            <Label htmlFor="email" className="text-base font-semibold text-blue-900 dark:text-blue-200">Email</Label>
            <Input id="email" type="email" {...register('email')} className="mt-1 bg-white/80 dark:bg-gray-900/80 border-blue-200 dark:border-blue-800 focus:ring-2 focus:ring-blue-400" />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>
          <div>
            <Label htmlFor="phone" className="text-base font-semibold text-blue-900 dark:text-blue-200">Phone Number</Label>
            <Input id="phone" {...register('phone')} className="mt-1 bg-white/80 dark:bg-gray-900/80 border-blue-200 dark:border-blue-800 focus:ring-2 focus:ring-blue-400" />
            {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
          </div>
          <div>
            <Label htmlFor="dob" className="text-base font-semibold text-blue-900 dark:text-blue-200">Date of Birth</Label>
            <Input id="dob" type="date" {...register('dob')} className="mt-1 bg-white/80 dark:bg-gray-900/80 border-blue-200 dark:border-blue-800 focus:ring-2 focus:ring-blue-400" />
            {errors.dob && <span className="text-red-500 text-xs">{errors.dob.message}</span>}
          </div>
        </div>
        <div>
          <Label htmlFor="passport" className="text-base font-semibold text-blue-900 dark:text-blue-200">Passport Number (Optional)</Label>
          <Input id="passport" {...register('passport')} className="mt-1 bg-white/80 dark:bg-gray-900/80 border-blue-200 dark:border-blue-800 focus:ring-2 focus:ring-blue-400" />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full mt-2 text-lg py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-xl">
          {isSubmitting ? 'Submitting...' : 'Continue'}
        </Button>
      </form>
    </motion.div>
  );
};
