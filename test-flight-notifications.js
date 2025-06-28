/**
 * Test Script for Flight Notification System
 * 
 * This script demonstrates how the flight notification system works
 * when an admin updates flight details.
 */

const BASE_URL = 'http://localhost:3000';

// Test data for flight update
const testFlightUpdate = {
  departure_time: '2024-02-15T14:30:00.000Z', // 2:30 PM
  arrival_time: '2024-02-15T16:45:00.000Z',   // 4:45 PM
  price: 299.99,
  available_seats: 45,
  status: 'DELAYED'
};

// Simulate admin updating a flight
async function testFlightUpdate(flightId, adminToken) {
  console.log('🔄 Testing flight update with notifications...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/flights/${flightId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(testFlightUpdate)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update flight');
    }

    const result = await response.json();
    
    console.log('✅ Flight update successful!');
    console.log('📊 Results:');
    console.log(`   - Flight: ${result.flightNumber}`);
    console.log(`   - Changes: ${result.changes.join(', ')}`);
    console.log(`   - Total bookings: ${result.totalBookings}`);
    console.log(`   - Notifications sent: ${result.notificationsSent}`);
    console.log(`   - Has significant changes: ${result.hasChanges}`);
    
    if (result.notificationDetails && result.notificationDetails.length > 0) {
      console.log('\n📧 Notification Details:');
      result.notificationDetails.forEach((detail, index) => {
        console.log(`   ${index + 1}. ${detail.passenger} (${detail.email})`);
        console.log(`      Booking: ${detail.booking_ref}`);
        console.log(`      Status: ${detail.status}`);
        if (detail.error) {
          console.log(`      Error: ${detail.error}`);
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error updating flight:', error.message);
    throw error;
  }
}

// Test email configuration
async function testEmailConfig() {
  console.log('📧 Testing email configuration...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/test-email`, {
      method: 'POST'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Email test failed');
    }

    const result = await response.json();
    console.log('✅ Email configuration test successful!');
    console.log(`   - SMTP connection: ${result.smtpConnected ? '✅' : '❌'}`);
    console.log(`   - Test email sent: ${result.emailSent ? '✅' : '❌'}`);
    
    return result;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error.message);
    throw error;
  }
}

// Simulate different types of flight changes
const testScenarios = [
  {
    name: 'Minor Delay',
    data: {
      departure_time: '2024-02-15T14:15:00.000Z', // 15 minutes delay
      arrival_time: '2024-02-15T16:30:00.000Z',
      price: 299.99,
      available_seats: 45,
      status: 'DELAYED'
    }
  },
  {
    name: 'Major Delay',
    data: {
      departure_time: '2024-02-15T15:30:00.000Z', // 1 hour delay
      arrival_time: '2024-02-15T17:45:00.000Z',
      price: 299.99,
      available_seats: 45,
      status: 'DELAYED'
    }
  },
  {
    name: 'Price Increase',
    data: {
      departure_time: '2024-02-15T14:30:00.000Z',
      arrival_time: '2024-02-15T16:45:00.000Z',
      price: 349.99, // $50 increase
      available_seats: 45,
      status: 'SCHEDULED'
    }
  },
  {
    name: 'Flight Cancellation',
    data: {
      departure_time: '2024-02-15T14:30:00.000Z',
      arrival_time: '2024-02-15T16:45:00.000Z',
      price: 299.99,
      available_seats: 45,
      status: 'CANCELLED'
    }
  }
];

// Run test scenarios
async function runTestScenarios(flightId, adminToken) {
  console.log('\n🧪 Running test scenarios...\n');
  
  for (const scenario of testScenarios) {
    console.log(`📋 Testing: ${scenario.name}`);
    console.log('─'.repeat(50));
    
    try {
      const response = await fetch(`${BASE_URL}/api/admin/flights/${flightId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(scenario.data)
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(`❌ Failed: ${error.error}`);
      } else {
        const result = await response.json();
        console.log(`✅ Success: ${result.notificationsSent} notifications sent`);
        console.log(`   Changes: ${result.changes.join(', ')}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Flight Notification System Test');
  console.log('='.repeat(50));
  
  // Note: In a real scenario, you would need to:
  // 1. Set up proper authentication
  // 2. Create test bookings
  // 3. Configure email settings
  
  console.log('⚠️  Note: This is a demonstration script.');
  console.log('   To run actual tests, you need:');
  console.log('   1. Valid admin authentication');
  console.log('   2. Test flight with bookings');
  console.log('   3. Configured email settings');
  console.log('   4. Environment variables set up');
  
  console.log('\n📝 Test Configuration:');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Test flight ID: [REQUIRED]`);
  console.log(`   Admin token: [REQUIRED]`);
  
  // Example usage (commented out as it requires actual setup)
  /*
  try {
    // Test email configuration
    await testEmailConfig();
    
    // Test flight update
    const flightId = 'your-test-flight-id';
    const adminToken = 'your-admin-token';
    
    await testFlightUpdate(flightId, adminToken);
    await runTestScenarios(flightId, adminToken);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
  */
  
  console.log('\n✅ Test script loaded successfully!');
  console.log('   Run with actual credentials to test the system.');
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testFlightUpdate,
    testEmailConfig,
    runTestScenarios,
    runTests,
    testScenarios
  };
}

// Run tests if script is executed directly
if (typeof window === 'undefined') {
  runTests();
} 