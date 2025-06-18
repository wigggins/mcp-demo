const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_USER_ID = '11111111-1111-1111-1111-111111111111'; // John Doe from sample data

// Test scenarios for multi-day booking validation
const testScenarios = [
  {
    name: 'Scenario 1: Thursday-Friday-Saturday Split',
    description: 'Tests splitting across weekday-only and weekend-capable centers',
    request: {
      user_id: TEST_USER_ID,
      request_dates: ['2024-01-18', '2024-01-19', '2024-01-20'] // Thu, Fri, Sat
    },
    expectedCenters: ['Weekday Only Center', 'Tuesday-Saturday Center'],
    expectedDays: 3
  },
  {
    name: 'Scenario 2: Monday-Wednesday-Friday Perfect Match',
    description: 'Tests perfect match with MWF-only center',
    request: {
      user_id: TEST_USER_ID,
      request_dates: ['2024-01-15', '2024-01-17', '2024-01-19'] // Mon, Wed, Fri
    },
    expectedCenters: ['MWF Only Center'],
    expectedDays: 3
  },
  {
    name: 'Scenario 3: Weekend Only Booking',
    description: 'Tests weekend-specific center usage',
    request: {
      user_id: TEST_USER_ID,
      request_dates: ['2024-01-20', '2024-01-21'] // Sat, Sun
    },
    expectedCenters: ['Weekend Only Center'],
    expectedDays: 2
  },
  {
    name: 'Scenario 4: Full Week Challenge',
    description: 'Tests complex 7-day booking requiring multiple centers',
    request: {
      user_id: TEST_USER_ID,
      request_dates: [
        '2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', 
        '2024-01-19', '2024-01-20', '2024-01-21'
      ] // Mon-Sun
    },
    expectedCenters: ['Full Week Center', 'Weekday Only Center', 'Weekend Only Center'],
    expectedDays: 7
  },
  {
    name: 'Scenario 5: Single Day with Preferred Center',
    description: 'Tests single day booking with center preference',
    request: {
      user_id: TEST_USER_ID,
      request_date: '2024-01-16', // Tuesday
      center_name: 'Tuesday-Saturday Center'
    },
    expectedCenters: ['Tuesday-Saturday Center'],
    expectedDays: 1
  },
  {
    name: 'Scenario 6: Impossible Date (All Centers Closed)',
    description: 'Tests error handling when no centers are available',
    request: {
      user_id: TEST_USER_ID,
      request_dates: ['2024-01-14'] // Sunday when only weekend center is open
    },
    shouldFail: true,
    expectedError: 'No available centers found'
  }
];

// Helper function to format dates for display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getDay()]} ${dateStr}`;
}

// Helper function to analyze booking result
function analyzeBooking(booking, scenario) {
  console.log(`\n📊 Analyzing: ${scenario.name}`);
  console.log(`Description: ${scenario.description}`);
  
  if (scenario.shouldFail) {
    console.log('❌ Expected this scenario to fail - should not reach here');
    return false;
  }
  
  const { booking_days, assignment_summary } = booking;
  
  // Check number of days
  if (booking_days.length !== scenario.expectedDays) {
    console.log(`❌ Expected ${scenario.expectedDays} days, got ${booking_days.length}`);
    return false;
  }
  
  // Check centers used
  const centersUsed = [...new Set(booking_days.map(day => day.center_name))];
  const expectedCentersSet = new Set(scenario.expectedCenters);
  const centersUsedSet = new Set(centersUsed);
  
  console.log(`📅 Booking Days (${booking_days.length}):`);
  booking_days.forEach(day => {
    console.log(`  ${formatDate(day.date)} → ${day.center_name} (${day.status})`);
  });
  
  console.log(`🏢 Centers Used: ${centersUsed.join(', ')}`);
  console.log(`📊 Assignment Summary:`, assignment_summary);
  
  // Validate center assignment
  const hasValidCenters = scenario.expectedCenters.some(expected => 
    centersUsed.includes(expected)
  );
  
  if (!hasValidCenters) {
    console.log(`❌ Expected centers: ${scenario.expectedCenters.join(', ')}`);
    console.log(`❌ Actual centers: ${centersUsed.join(', ')}`);
    return false;
  }
  
  console.log(`✅ Successfully booked ${booking_days.length} days across ${centersUsed.length} center(s)`);
  return true;
}

// Run a single test scenario
async function runTestScenario(scenario) {
  try {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log(`Request: ${JSON.stringify(scenario.request, null, 2)}`);
    
    const response = await axios.post(`${BASE_URL}/bookings/intelligent`, scenario.request);
    
    if (scenario.shouldFail) {
      console.log(`❌ FAILED: Expected scenario to fail but it succeeded`);
      console.log(`Response:`, response.data);
      return false;
    }
    
    const success = analyzeBooking(response.data, scenario);
    return success;
    
  } catch (error) {
    if (scenario.shouldFail) {
      console.log(`✅ PASSED: Correctly failed as expected`);
      console.log(`Error: ${error.response?.data?.error || error.message}`);
      return true;
    } else {
      console.log(`❌ FAILED: Unexpected error`);
      console.log(`Error: ${error.response?.data?.error || error.message}`);
      console.log(`Status: ${error.response?.status}`);
      return false;
    }
  }
}

// Get center availability info
async function getCenterInfo() {
  try {
    console.log('\n🏢 Available Centers in ZIP 12345:');
    const response = await axios.get(`${BASE_URL}/centers?zip_code=12345`);
    response.data.forEach(center => {
      const days = center.operating_days.map(d => {
        const dayNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return dayNames[d];
      }).join(',');
      console.log(`  ${center.name}: ${days} (capacity: ${center.daily_capacity})`);
    });
  } catch (error) {
    console.log('❌ Failed to get center info:', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Multi-Day Booking System Tests');
  console.log('=' * 50);
  
  await getCenterInfo();
  
  let passed = 0;
  let total = testScenarios.length;
  
  for (const scenario of testScenarios) {
    const success = await runTestScenario(scenario);
    if (success) passed++;
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '=' * 50);
  console.log(`📊 Test Results: ${passed}/${total} scenarios passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Multi-day booking system is working correctly.');
  } else {
    console.log(`⚠️  ${total - passed} tests failed. Please review the implementation.`);
  }
  
  return passed === total;
}

// Additional helper: Test with real upcoming dates
async function testWithRealDates() {
  console.log('\n🗓️  Testing with real upcoming dates:');
  
  const today = new Date();
  const nextThursday = new Date(today);
  nextThursday.setDate(today.getDate() + ((4 - today.getDay() + 7) % 7 || 7));
  
  const friday = new Date(nextThursday);
  friday.setDate(nextThursday.getDate() + 1);
  
  const saturday = new Date(nextThursday);
  saturday.setDate(nextThursday.getDate() + 2);
  
  const realDateScenario = {
    name: 'Real Dates: Next Thu-Fri-Sat',
    description: 'Testing with actual upcoming Thursday-Friday-Saturday',
    request: {
      user_id: TEST_USER_ID,
      request_dates: [
        nextThursday.toISOString().split('T')[0],
        friday.toISOString().split('T')[0],
        saturday.toISOString().split('T')[0]
      ]
    },
    expectedCenters: ['Weekday Only Center', 'Tuesday-Saturday Center'],
    expectedDays: 3
  };
  
  console.log(`Dates: ${formatDate(realDateScenario.request.request_dates[0])}, ${formatDate(realDateScenario.request.request_dates[1])}, ${formatDate(realDateScenario.request.request_dates[2])}`);
  
  return await runTestScenario(realDateScenario);
}

// Run all tests
if (require.main === module) {
  runAllTests()
    .then(success => {
      if (success) {
        return testWithRealDates();
      }
    })
    .then(() => {
      console.log('\n✨ Multi-day booking test suite completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testWithRealDates, runTestScenario }; 