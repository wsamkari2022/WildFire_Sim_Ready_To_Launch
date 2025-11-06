# MongoDB Migration Complete

Your project has been successfully migrated from Supabase to a local MongoDB database.

## What Changed

### ✅ Backend Infrastructure
- Created Express + TypeScript server in `backend/src/`
- 9 Mongoose schemas for all data types
- RESTful API with proper routing and error handling
- MongoDB connection with automatic reconnection

### ✅ Frontend Updates
- Replaced `DatabaseService` with `MongoService`
- All components updated to use new service
- Native Fetch API for all HTTP requests
- ViewResultsPage now saves metrics to MongoDB

### ✅ Removed
- Supabase client library (@supabase/supabase-js)
- supabaseClient.ts
- databaseService.ts
- supabase/ directory with migrations

### ✅ Environment
- New `.env` with MongoDB API endpoint
- Backend `.env` with MongoDB connection string

## Quick Start

### 1. Start MongoDB
```bash
mongod
```

### 2. Start Backend Server
```bash
npm run server
```

### 3. Start Frontend (in another terminal)
```bash
npm run dev
```

### OR Run Both Together
```bash
npm run dev:all
```

## Testing the Integration

1. Open browser to `http://localhost:5173`
2. Complete the demographic form
3. Check MongoDB to see the data:
   ```bash
   mongosh
   use wildfire_study
   db.usersessions.find().pretty()
   ```

## Available npm Scripts

- `npm run dev` - Start frontend only (Vite dev server)
- `npm run server` - Start backend only (Express server)
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run build` - Build frontend for production
- `npm run server:build` - Compile backend TypeScript

## MongoDB Collections

Your data is stored in these collections:
1. **usersessions** - Demographics, consent, session metadata
2. **baselinevalues** - Explicit and implicit value assessments
3. **scenariointeractions** - Every user interaction during scenarios
4. **cvrresponses** - CVR question responses
5. **apareorderings** - Value reordering events
6. **finaldecisions** - Final decisions for each scenario
7. **valueevolutions** - Value changes over time
8. **sessionfeedbacks** - Comprehensive post-study feedback
9. **sessionmetrics** - ViewResultsPage calculated metrics and tracking data

## API Endpoints

Base URL: `http://localhost:4000/api`

All endpoints follow RESTful conventions:
- POST for creating new records
- GET for retrieving data
- PUT for updating records

See `backend/README.md` for complete API documentation.

## Viewing Your Data

### Option 1: MongoDB Compass (Recommended)
1. Download from https://www.mongodb.com/products/compass
2. Connect to `mongodb://localhost:27017`
3. Browse `wildfire_study` database

### Option 2: mongosh CLI
```bash
mongosh
use wildfire_study
show collections
db.usersessions.find()
db.sessionmetrics.find()
```

## Data Structure

### Demographics Example
```javascript
{
  session_id: "session_1758923456789_abc123",
  age: 25,
  gender: "Female",
  ai_experience: "Often",
  moral_reasoning_experience: "Good",
  consent_agreed: true,
  consent_timestamp: "2025-01-06T12:34:56.789Z",
  createdAt: "2025-01-06T12:34:56.789Z",
  updatedAt: "2025-01-06T12:34:56.789Z"
}
```

### Session Metrics Example (from ViewResultsPage)
```javascript
{
  session_id: "session_1758923456789_abc123",
  cvr_arrivals: 5,
  cvr_yes_count: 3,
  cvr_no_count: 2,
  apa_reorderings: 2,
  switch_count_total: 8,
  avg_decision_time: 45.7,
  value_consistency_index: 0.67,
  performance_composite: 0.75,
  balance_index: 0.82,
  scenario_details: [...],
  scenarios_final_decision_labels: ["safety", "efficiency", "fairness"],
  checking_alignment_list: ["Aligned", "Not Aligned", "Aligned"],
  final_values: ["Safety", "Fairness"],
  scenario3_infeasible_options: [...],
  calculated_at: "2025-01-06T12:45:00.000Z"
}
```

## Architecture

```
Frontend (React + Vite)
    ↓ HTTP Fetch API
Backend (Express + TypeScript)
    ↓ Mongoose ODM
MongoDB (Local Database)
```

## Troubleshooting

### Can't Connect to MongoDB
**Error**: `Error: connect ECONNREFUSED`
**Solution**: Start MongoDB with `mongod`

### Port 4000 Already in Use
**Solution**: Change PORT in `backend/.env`

### Frontend Can't Reach Backend
**Solution**: Make sure backend is running on port 4000
Check `VITE_API_BASE_URL` in `.env`

### No Data Showing in MongoDB
**Solution**: Complete a full user session in the frontend
Check browser console for errors

## Next Steps

- Install MongoDB Compass for easy data viewing
- Test the complete user flow from demographics to completion
- Check all 9 collections are populated with data
- Use ViewResultsPage to verify metrics are saved
- Query data using mongosh or Compass for your research

## Support

For backend documentation, see `backend/README.md`
For MongoDB help, see https://www.mongodb.com/docs/
