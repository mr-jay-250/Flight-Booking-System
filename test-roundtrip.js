// Simple test script for round-trip search functionality
const testRoundTripSearch = async () => {
  console.log('Testing round-trip search functionality...\n');

  // Using the actual UUIDs from the database
  const testCases = [
    {
      name: 'One-way search (LAX to JFK) - Economy',
      data: {
        origin: '11111111-1111-1111-1111-111111111111', // LAX airport ID
        destination: '22222222-2222-2222-2222-222222222222', // JFK airport ID
        departureDate: '2025-06-27',
        tripType: 'oneway',
        outboundCabin: 'Economy',
        returnCabin: null
      }
    },
    {
      name: 'One-way search (LAX to JFK) - Business',
      data: {
        origin: '11111111-1111-1111-1111-111111111111', // LAX airport ID
        destination: '22222222-2222-2222-2222-222222222222', // JFK airport ID
        departureDate: '2025-06-27',
        tripType: 'oneway',
        outboundCabin: 'Business',
        returnCabin: null
      }
    },
    {
      name: 'Round-trip search (LAX ↔ JFK) - Economy both ways',
      data: {
        origin: '11111111-1111-1111-1111-111111111111', // LAX airport ID
        destination: '22222222-2222-2222-2222-222222222222', // JFK airport ID
        departureDate: '2025-06-27',
        returnDate: '2025-06-30',
        tripType: 'roundtrip',
        outboundCabin: 'Economy',
        returnCabin: 'Economy'
      }
    },
    {
      name: 'Round-trip search (LAX ↔ JFK) - Economy outbound, Business return',
      data: {
        origin: '11111111-1111-1111-1111-111111111111', // LAX airport ID
        destination: '22222222-2222-2222-2222-222222222222', // JFK airport ID
        departureDate: '2025-06-27',
        returnDate: '2025-06-30',
        tripType: 'roundtrip',
        outboundCabin: 'Economy',
        returnCabin: 'Business'
      }
    },
    {
      name: 'Round-trip search (LAX ↔ JFK) - Same day return',
      data: {
        origin: '11111111-1111-1111-1111-111111111111', // LAX airport ID
        destination: '22222222-2222-2222-2222-222222222222', // JFK airport ID
        departureDate: '2025-06-27',
        returnDate: '2025-06-27',
        tripType: 'roundtrip',
        outboundCabin: 'Economy',
        returnCabin: 'Business'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    try {
      const response = await fetch('http://localhost:3000/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Success!');
        console.log(`- Outbound flights found: ${result.flights?.length || 0}`);
        if (testCase.data.tripType === 'roundtrip') {
          console.log(`- Return flights found: ${result.returnFlights?.length || 0}`);
          console.log(`- Search criteria: ${JSON.stringify(result.searchCriteria)}`);
          
          // Show some flight details if available
          if (result.flights && result.flights.length > 0) {
            console.log(`- Sample outbound flight: ${result.flights[0].flight_number} (${result.flights[0].airline_name}) - ${result.flights[0].cabin_class}`);
          }
          if (result.returnFlights && result.returnFlights.length > 0) {
            console.log(`- Sample return flight: ${result.returnFlights[0].flight_number} (${result.returnFlights[0].airline_name}) - ${result.returnFlights[0].cabin_class}`);
          }
        } else {
          if (result.flights && result.flights.length > 0) {
            console.log(`- Sample flight: ${result.flights[0].flight_number} (${result.flights[0].airline_name}) - ${result.flights[0].cabin_class}`);
          }
        }
      } else {
        console.log('❌ Error:', result.error);
      }
    } catch (error) {
      console.log('❌ Network error:', error.message);
    }
    console.log('');
  }
};

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testRoundTripSearch().catch(console.error);
}

module.exports = { testRoundTripSearch }; 