'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  Plane, 
  Edit,
  Save,
  X,
  Plus,
  AlertCircle,
  RefreshCw,
  Eye,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { isAdminEmail } from '@/lib/admin-auth';
import { toast } from 'sonner';

interface Flight {
  id: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  available_seats: number;
  cabin_class: string;
  aircraft_type: string;
  status: string;
  airline: {
    name: string;
    logo_url?: string;
  };
  origin: Array<{ city: string; code: string }>;
  destination: Array<{ city: string; code: string }>;
  total_bookings?: number;
}

interface FlightEditForm {
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  status: string;
}

export default function AdminFlightsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingFlight, setEditingFlight] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FlightEditForm>({
    departure_time: '',
    arrival_time: '',
    price: 0,
    available_seats: 0,
    status: ''
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [airlineFilter, setAirlineFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && !isAdminEmail(user.email)) {
      router.push('/');
      return;
    }

    if (user && isAdminEmail(user.email)) {
      fetchFlights();
    }
  }, [user, isLoading]);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      setError('');

      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      if (!accessToken) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/admin/flights', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch flights');
      }

      const data = await response.json();
      setFlights(data.flights);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching flights:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (flight: Flight) => {
    setEditingFlight(flight.id);
    setEditForm({
      departure_time: new Date(flight.departure_time).toISOString().slice(0, 16),
      arrival_time: new Date(flight.arrival_time).toISOString().slice(0, 16),
      price: flight.price,
      available_seats: flight.available_seats,
      status: flight.status
    });
  };

  const cancelEditing = () => {
    setEditingFlight(null);
    setEditForm({
      departure_time: '',
      arrival_time: '',
      price: 0,
      available_seats: 0,
      status: ''
    });
  };

  const handleEditSubmit = async (flightId: string) => {
    try {
      setLoading(true);
      
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/flights/${flightId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update flight');
      }

      const result = await response.json();
      
      // Show success message with details
      if (result.hasChanges) {
        toast.success(`Flight ${result.flightNumber} updated successfully!`, {
          description: `Changes: ${result.changes.join(', ')}`
        });
        
        if (result.notificationsSent > 0) {
          toast.info(`📧 Notifications sent to ${result.notificationsSent} out of ${result.totalBookings} passengers`, {
            description: `Passengers have been notified of the flight changes via email.`,
            duration: 5000
          });
        } else if (result.totalBookings > 0) {
          toast.warning(`⚠️ No notifications sent to ${result.totalBookings} passengers`, {
            description: `No significant changes detected or email sending failed.`,
            duration: 5000
          });
        }
      } else {
        toast.success('Flight updated successfully (no significant changes detected)');
      }

      setEditingFlight(null);
      fetchFlights(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message || 'Failed to update flight');
      console.error('Error updating flight:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'DELAYED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'BOARDING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = search === '' || 
      flight.flight_number.toLowerCase().includes(search.toLowerCase()) ||
      flight.airline.name.toLowerCase().includes(search.toLowerCase()) ||
      flight.origin[0]?.city.toLowerCase().includes(search.toLowerCase()) ||
      flight.destination[0]?.city.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || flight.status === statusFilter;
    const matchesAirline = airlineFilter === 'all' || flight.airline.name === airlineFilter;

    return matchesSearch && matchesStatus && matchesAirline;
  });

  const airlines = Array.from(new Set(flights.map(f => f.airline.name)));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !isAdminEmail(user.email)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Flight Management
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage upcoming flights, update schedules, and notify passengers
              </p>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                Only upcoming flights are displayed for management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="text-sm"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Flight number, airline, route..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                >
                  <option value="all">All Status</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="BOARDING">Boarding</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Airline</label>
                <select
                  value={airlineFilter}
                  onChange={(e) => setAirlineFilter(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                >
                  <option value="all">All Airlines</option>
                  {airlines.map(airline => (
                    <option key={airline} value={airline}>{airline}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={fetchFlights}
                  disabled={loading}
                  className="flex items-center gap-2 w-full"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flights Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Upcoming Flights ({filteredFlights.length} flights)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredFlights.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No flights found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium">Flight</th>
                      <th className="text-left py-3 px-4 font-medium">Route</th>
                      <th className="text-left py-3 px-4 font-medium">Schedule</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Price</th>
                      <th className="text-left py-3 px-4 font-medium">Seats</th>
                      <th className="text-left py-3 px-4 font-medium">Bookings</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFlights.map((flight) => (
                      <tr key={flight.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {flight.airline.logo_url && (
                              <img 
                                src={flight.airline.logo_url} 
                                alt={flight.airline.name} 
                                className="h-8 w-8 object-contain rounded-full bg-white border"
                              />
                            )}
                            <div>
                              <div className="font-medium">{flight.airline.name}</div>
                              <div className="text-sm text-gray-500 font-mono">{flight.flight_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">
                              {flight.origin[0]?.city} → {flight.destination[0]?.city}
                            </div>
                            <div className="text-sm text-gray-500">
                              {flight.origin[0]?.code} - {flight.destination[0]?.code}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-sm">
                              <Clock className="inline h-3 w-3 mr-1" />
                              {formatDate(flight.departure_time)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Duration: {flight.duration}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flight.status)}`}>
                            {flight.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(flight.price)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            {flight.available_seats}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-500">
                            {flight.total_bookings || 0} booked
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {editingFlight === flight.id ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditSubmit(flight.id)}
                                disabled={loading}
                                className="flex items-center gap-1"
                              >
                                <Save className="h-4 w-4" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                                disabled={loading}
                                className="flex items-center gap-1"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(flight)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        {editingFlight && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Edit Flight</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Departure Time</label>
                  <Input
                    type="datetime-local"
                    value={editForm.departure_time}
                    onChange={(e) => setEditForm(prev => ({ ...prev, departure_time: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Arrival Time</label>
                  <Input
                    type="datetime-local"
                    value={editForm.arrival_time}
                    onChange={(e) => setEditForm(prev => ({ ...prev, arrival_time: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <Input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Available Seats</label>
                  <Input
                    type="number"
                    value={editForm.available_seats}
                    onChange={(e) => setEditForm(prev => ({ ...prev, available_seats: parseInt(e.target.value) }))}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="DELAYED">Delayed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="BOARDING">Boarding</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => handleEditSubmit(editingFlight)}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 