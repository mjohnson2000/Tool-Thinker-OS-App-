import * as cron from 'node-cron';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5001';

// Schedule daily trending ideas generation at 6 AM
export function scheduleTrendingIdeasGeneration() {
  cron.schedule('0 6 * * *', async () => {
    console.log('Running daily trending ideas generation...');
    try {
      const response = await axios.post(`${API_URL}/api/trending-ideas/generate`, {}, {
        headers: {
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'internal-key'}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data as any;
      if (data.success) {
        console.log('Successfully generated trending ideas:', data.data.length, 'ideas');
      } else {
        console.error('Failed to generate trending ideas:', data.error);
      }
    } catch (error) {
      console.error('Error in daily trending ideas generation:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/New_York"
  });
  
  console.log('Daily trending ideas generation scheduled for 6 AM EST');
}

// Schedule cleanup of old trending ideas (keep last 30 days)
export function scheduleTrendingIdeasCleanup() {
  cron.schedule('0 2 * * *', async () => {
    console.log('Running trending ideas cleanup...');
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const response = await axios.delete(`${API_URL}/api/trending-ideas/cleanup`, {
        headers: {
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'internal-key'}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data as any;
      if (data.success) {
        console.log('Successfully cleaned up old trending ideas:', data.deletedCount, 'ideas deleted');
      } else {
        console.error('Failed to cleanup trending ideas:', data.error);
      }
    } catch (error) {
      console.error('Error in trending ideas cleanup:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/New_York"
  });
  
  console.log('Trending ideas cleanup scheduled for 2 AM EST');
} 