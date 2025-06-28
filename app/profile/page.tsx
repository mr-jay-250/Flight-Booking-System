'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  CreditCard, 
  Plane, 
  Edit, 
  Save, 
  X, 
  Plus,
  Trash2,
  Star,
  Mail,
  Phone,
  Globe,
  Home
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { ProfileFormValues, PaymentFormValues, PaymentMethod } from '@/lib/auth-types';
import { useAuthStore } from '@/store/authStore';

// Profile form schema
const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().optional(),
  preferred_language: z.string().optional(),
});

// Payment form schema
const paymentSchema = z.object({
  card_number: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  expiry_month: z.number().min(1).max(12),
  expiry_year: z.number().min(new Date().getFullYear()),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3-4 digits'),
  cardholder_name: z.string().min(2, 'Cardholder name must be at least 2 characters'),
  is_default: z.boolean(),
});

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { updateProfile, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'payments' | 'bookings'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.profile?.full_name || '',
      phone_number: user?.profile?.phone_number || '',
      address: user?.profile?.address || '',
      preferred_language: user?.profile?.preferred_language || '',
    },
  });

  // Payment form
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      card_number: '',
      expiry_month: 1,
      expiry_year: new Date().getFullYear(),
      cvv: '',
      cardholder_name: '',
      is_default: false,
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user?.profile) {
      profileForm.reset({
        full_name: user.profile.full_name || '',
        phone_number: user.profile.phone_number || '',
        address: user.profile.address || '',
        preferred_language: user.profile.preferred_language || '',
      });
    }
  }, [user?.profile, profileForm]);

  // Fetch bookings
  useEffect(() => {
    if (activeTab === 'bookings' && user) {
      fetchBookings();
    }
  }, [activeTab, user]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      // Use Supabase to get the session and access token
      const { data } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const accessToken = data.session?.access_token;
      if (accessToken) {
        const response = await fetch('/api/bookings', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBookings(data.bookings || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load booking history');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleProfileSubmit = async (data: ProfileFormValues) => {
    const result = await updateProfile(data);
    if (result.success) {
      toast.success('Profile updated successfully');
      setIsEditingProfile(false);
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

  const handlePaymentSubmit = async (data: PaymentFormValues) => {
    // Determine card type from card number
    const cardType = getCardType(data.card_number);
    
    const paymentData = {
      card_type: cardType,
      last_four: data.card_number.slice(-4),
      expiry_month: data.expiry_month,
      expiry_year: data.expiry_year,
      is_default: data.is_default,
    };

    const result = await addPaymentMethod(paymentData);
    if (result.success) {
      toast.success('Payment method added successfully');
      setIsAddingPayment(false);
      paymentForm.reset();
    } else {
      toast.error(result.error || 'Failed to add payment method');
    }
  };

  const handleRemovePayment = async (paymentId: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      const result = await removePaymentMethod(paymentId);
      if (result.success) {
        toast.success('Payment method removed');
      } else {
        toast.error(result.error || 'Failed to remove payment method');
      }
    }
  };

  const handleSetDefaultPayment = async (paymentId: string) => {
    const result = await setDefaultPaymentMethod(paymentId);
    if (result.success) {
      toast.success('Default payment method updated');
    } else {
      toast.error(result.error || 'Failed to update default payment method');
    }
  };

  const getCardType = (cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' => {
    if (cardNumber.startsWith('4')) return 'visa';
    if (cardNumber.startsWith('5')) return 'mastercard';
    if (cardNumber.startsWith('3')) return 'amex';
    return 'discover';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Not Authenticated</h2>
            <p className="text-gray-500">Please log in to view your profile.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">User Dashboard</h1>
          <p className="text-center text-muted-foreground">Manage your profile, payments, and bookings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'bookings', label: 'Bookings', icon: Plane },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profile' && (
              <Card className="backdrop-blur-sm bg-background/95 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Profile Information</span>
                      </CardTitle>
                      <CardDescription>Manage your personal information</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      {isEditingProfile ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Full Name</span>
                        </Label>
                        <Input
                          id="full_name"
                          {...profileForm.register('full_name')}
                          disabled={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-muted' : ''}
                        />
                        {profileForm.formState.errors.full_name && (
                          <p className="text-sm text-red-500">{profileForm.formState.errors.full_name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>Email</span>
                        </Label>
                        <Input
                          id="email"
                          value={user.email}
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone_number" className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>Phone Number</span>
                        </Label>
                        <Input
                          id="phone_number"
                          {...profileForm.register('phone_number')}
                          disabled={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-muted' : ''}
                        />
                        {profileForm.formState.errors.phone_number && (
                          <p className="text-sm text-red-500">{profileForm.formState.errors.phone_number.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferred_language" className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>Preferred Language</span>
                        </Label>
                        <Input
                          id="preferred_language"
                          {...profileForm.register('preferred_language')}
                          disabled={!isEditingProfile}
                          className={!isEditingProfile ? 'bg-muted' : ''}
                          placeholder="e.g., English, Spanish"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center space-x-2">
                        <Home className="h-4 w-4" />
                        <span>Address</span>
                      </Label>
                      <Input
                        id="address"
                        {...profileForm.register('address')}
                        disabled={!isEditingProfile}
                        className={!isEditingProfile ? 'bg-muted' : ''}
                        placeholder="Enter your address"
                      />
                    </div>

                    {isEditingProfile && (
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="flex items-center space-x-2">
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'payments' && (
              <Card className="backdrop-blur-sm bg-background/95 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Payment Methods</span>
                      </CardTitle>
                      <CardDescription>Manage your saved payment methods</CardDescription>
                    </div>
                    <Button
                      onClick={() => setIsAddingPayment(!isAddingPayment)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Payment Method</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Add Payment Method Form */}
                  {isAddingPayment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 border rounded-lg bg-muted/50"
                    >
                      <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="card_number">Card Number</Label>
                            <Input
                              id="card_number"
                              {...paymentForm.register('card_number')}
                              placeholder="1234 5678 9012 3456"
                              maxLength={16}
                            />
                            {paymentForm.formState.errors.card_number && (
                              <p className="text-sm text-red-500">{paymentForm.formState.errors.card_number.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cardholder_name">Cardholder Name</Label>
                            <Input
                              id="cardholder_name"
                              {...paymentForm.register('cardholder_name')}
                              placeholder="John Doe"
                            />
                            {paymentForm.formState.errors.cardholder_name && (
                              <p className="text-sm text-red-500">{paymentForm.formState.errors.cardholder_name.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="expiry_month">Expiry Month</Label>
                            <select
                              id="expiry_month"
                              {...paymentForm.register('expiry_month', { valueAsNumber: true })}
                              className="w-full px-3 py-2 border rounded-md"
                            >
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                <option key={month} value={month}>
                                  {month.toString().padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="expiry_year">Expiry Year</Label>
                            <select
                              id="expiry_year"
                              {...paymentForm.register('expiry_year', { valueAsNumber: true })}
                              className="w-full px-3 py-2 border rounded-md"
                            >
                              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              {...paymentForm.register('cvv')}
                              placeholder="123"
                              maxLength={4}
                            />
                            {paymentForm.formState.errors.cvv && (
                              <p className="text-sm text-red-500">{paymentForm.formState.errors.cvv.message}</p>
                            )}
                          </div>

                          <div className="space-y-2 flex items-center">
                            <input
                              id="is_default"
                              type="checkbox"
                              {...paymentForm.register('is_default')}
                              className="mr-2"
                            />
                            <Label htmlFor="is_default">Set as default payment method</Label>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddingPayment(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Add Payment Method</Button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Payment Methods List */}
                  <div className="space-y-4">
                    {user.payment_methods && user.payment_methods.length > 0 ? (
                      user.payment_methods.map((payment: PaymentMethod) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-background"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">💳</div>
                            <div>
                              <p className="font-medium">
                                {payment.card_type.charAt(0).toUpperCase() + payment.card_type.slice(1)} •••• {payment.last_four}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Expires {payment.expiry_month.toString().padStart(2, '0')}/{payment.expiry_year}
                              </p>
                            </div>
                            {payment.is_default && (
                              <div className="flex items-center space-x-1 text-blue-600">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm font-medium">Default</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {!payment.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefaultPayment(payment.id)}
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemovePayment(payment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No payment methods saved</p>
                        <p className="text-sm">Add a payment method to make booking easier</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'bookings' && (
              <Card className="backdrop-blur-sm bg-background/95 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plane className="h-5 w-5" />
                    <span>Booking History</span>
                  </CardTitle>
                  <CardDescription>View and manage your flight bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingBookings ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-4 border rounded-lg bg-background hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                {booking.booking_reference}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                booking.booking_status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                booking.booking_status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.booking_status}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${booking.total_price}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.booking_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {booking.flight && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="text-center">
                                    <p className="font-semibold">{booking.flight.origin?.[0]?.city}</p>
                                    <p className="text-sm text-muted-foreground">{booking.flight.origin?.[0]?.code}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-8 h-px bg-muted-foreground"></div>
                                    <Plane className="h-4 w-4 text-muted-foreground" />
                                    <div className="w-8 h-px bg-muted-foreground"></div>
                                  </div>
                                  <div className="text-center">
                                    <p className="font-semibold">{booking.flight.destination?.[0]?.city}</p>
                                    <p className="text-sm text-muted-foreground">{booking.flight.destination?.[0]?.code}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>{booking.flight.airline?.name} {booking.flight.flight_number}</span>
                                <span>
                                  {new Date(booking.flight.departure_time).toLocaleDateString()} - {new Date(booking.flight.arrival_time).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No bookings found</p>
                      <p className="text-sm">Start by searching for flights</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 