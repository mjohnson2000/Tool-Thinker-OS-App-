const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'internal-key';

async function testTrendingIdeasGeneration() {
  try {
    console.log('Testing trending ideas generation...');
    
    // Test the generate endpoint
    const response = await axios.post(`${API_URL}/api/trending-ideas/generate`, {}, {
      headers: {
        'Authorization': `Bearer ${INTERNAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Successfully generated trending ideas!');
      console.log('Generated', response.data.data.length, 'ideas');
    } else {
      console.log('❌ Failed to generate trending ideas:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Error testing trending ideas generation:', error.response?.data || error.message);
  }
}

// Run the test
testTrendingIdeasGeneration(); 