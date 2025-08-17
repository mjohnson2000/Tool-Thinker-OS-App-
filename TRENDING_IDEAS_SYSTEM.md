# Trending Ideas System

## Overview

The trending ideas system automatically generates 5 AI-curated side hustle opportunities daily and displays them in a carousel on the landing page. The system is designed to be efficient and consistent, generating ideas once per day and serving them from the database.

## How It Works

### 1. Daily Generation (Cron Job)
- **Schedule**: Every day at 6:00 AM EST
- **Process**: 
  - Checks if ideas already exist for today
  - If not, generates 5 new trending ideas using OpenAI
  - Saves them to the database with today's date
- **Location**: `backend/src/utils/cronJobs.ts`

### 2. Data Persistence
- **Storage**: MongoDB using the `TrendingIdea` model
- **Retention**: Ideas are kept for 30 days
- **Cleanup**: Old ideas are automatically deleted at 2:00 AM EST daily

### 3. Frontend Display
- **Carousel**: Shows the 5 trending ideas with auto-sliding
- **Navigation**: Users can explore any idea by clicking "Explore This Idea"
- **Pre-filling**: Clicking explore navigates to the app with the idea pre-filled

## API Endpoints

### GET `/api/trending-ideas`
- **Purpose**: Fetch today's trending ideas
- **Behavior**: 
  - Returns existing ideas for today
  - If none exist, generates new ones (fallback)
- **Response**: Array of 5 trending ideas

### POST `/api/trending-ideas/generate`
- **Purpose**: Manually trigger idea generation
- **Authentication**: 
  - Internal API key (for cron jobs)
  - User authentication (for manual triggers)
- **Behavior**: Only generates if no ideas exist for today

### POST `/api/trending-ideas/:id/save`
- **Purpose**: Save/bookmark an idea
- **Behavior**: Increments the save count for the idea

### DELETE `/api/trending-ideas/cleanup`
- **Purpose**: Clean up old ideas
- **Schedule**: Automatic daily at 2:00 AM EST
- **Retention**: Keeps last 30 days

## Environment Variables

Add to your `.env` file:
```
INTERNAL_API_KEY=your-secure-internal-key-here
```

## Testing

### Manual Generation Test
```bash
cd backend
node test-cron.js
```

### Force Generation (for testing)
```bash
curl -X POST http://localhost:3001/api/trending-ideas/force-generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Data Flow

1. **6:00 AM**: Cron job triggers generation
2. **Generation**: OpenAI creates 5 trending ideas
3. **Storage**: Ideas saved to database with today's date
4. **Display**: Frontend fetches and displays ideas
5. **Interaction**: Users can explore or save ideas
6. **Navigation**: "Explore" pre-fills app with idea data

## Benefits

- **Efficiency**: Ideas generated once per day, not on every page load
- **Consistency**: Same ideas shown throughout the day
- **Performance**: Fast loading from database
- **Reliability**: Fallback generation if cron job fails
- **User Experience**: Seamless navigation to app with pre-filled data

## Troubleshooting

### Ideas not generating
1. Check if cron jobs are running: `pm2 logs`
2. Verify INTERNAL_API_KEY is set
3. Check OpenAI API key configuration
4. Test manual generation: `node test-cron.js`

### Ideas regenerating on page reload
1. Check database connection
2. Verify date filtering logic
3. Check if ideas are being saved properly

### Cron job not working
1. Verify timezone settings
2. Check server time
3. Ensure node-cron is properly configured 