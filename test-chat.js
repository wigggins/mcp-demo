// Test script for smart booking chat functionality
const axios = require('axios');

async function testChatBooking() {
    const orchestrationUrl = 'http://localhost:3000';
    
    // Test user data (Test Frank)
    const testUser = {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        name: 'Test Frank',
        email: 'test.frank@example.com',
        zip_code: '12345'
    };

    console.log('🧪 Testing smart booking chat functionality...\n');

    try {
        // Test 1: Generic booking request (should use first child)
        console.log('📝 Test 1: Generic booking request');
        console.log('Message: "book care for my child tomorrow"');
        
        const response1 = await axios.post(`${orchestrationUrl}/chat`, {
            message: "book care for my child tomorrow",
            user: testUser
        });
        
        console.log('✅ Response:', response1.data.message);
        console.log('📊 Tool Results:', response1.data.toolResults ? 'Booking created!' : 'No booking created');
        console.log('');

        // Test 2: Specific child booking request 
        console.log('📝 Test 2: Specific child booking request');
        console.log('Message: "book care for Bobby tomorrow"');
        
        const response2 = await axios.post(`${orchestrationUrl}/chat`, {
            message: "book care for Bobby tomorrow", 
            user: testUser
        });
        
        console.log('✅ Response:', response2.data.message);
        console.log('📊 Tool Results:', response2.data.toolResults ? 'Booking created!' : 'No booking created');
        console.log('');

        // Test 3: General conversation (should not trigger booking)
        console.log('📝 Test 3: General conversation');
        console.log('Message: "Hello, how are you?"');
        
        const response3 = await axios.post(`${orchestrationUrl}/chat`, {
            message: "Hello, how are you?",
            user: testUser
        });
        
        console.log('✅ Response:', response3.data.message);
        console.log('📊 Tool Results:', response3.data.toolResults ? 'Unexpected booking created!' : 'No booking created (correct)');
        console.log('');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testChatBooking(); 