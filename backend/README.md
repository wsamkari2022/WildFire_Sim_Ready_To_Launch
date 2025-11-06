# Wildfire Study Backend Server

This is the Express + MongoDB backend server for the Wildfire Crisis Simulation study.

## Prerequisites

1. **MongoDB** must be installed and running locally
   - Install MongoDB: https://www.mongodb.com/docs/manual/installation/
   - Start MongoDB: `mongod` or use MongoDB Compass

2. **Node.js** (v16 or higher)

## Setup

1. Install dependencies (already done if you ran `npm install` in the root):
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `backend/.env.example` to `backend/.env` (already configured)
   - Default MongoDB URI: `mongodb://localhost:27017/wildfire_study`
   - Default PORT: `4000`

## Running the Backend Server

### Option 1: Backend Only
```bash
npm run server
```

### Option 2: Frontend + Backend Together
```bash
npm run dev:all
```

This runs both the Vite frontend dev server (port 5173) and the backend server (port 4000) concurrently.

## API Endpoints

Base URL: `http://localhost:4000/api`

### User Sessions
- `POST /api/user-sessions` - Create new user session
- `PUT /api/user-sessions/:session_id` - Update user session
- `GET /api/user-sessions/:session_id` - Get user session

### Baseline Values
- `POST /api/baseline-values` - Store baseline value assessments
- `GET /api/baseline-values/session/:session_id` - Get session values

### Scenario Interactions
- `POST /api/scenario-interactions` - Record user interactions
- `GET /api/scenario-interactions/session/:session_id` - Get all interactions
- `GET /api/scenario-interactions/session/:session_id/scenario/:scenario_id` - Get scenario-specific interactions

### CVR Responses
- `POST /api/cvr-responses` - Store CVR answers
- `GET /api/cvr-responses/session/:session_id` - Get session CVR data

### APA Reorderings
- `POST /api/apa-reorderings` - Store value reordering events
- `GET /api/apa-reorderings/session/:session_id` - Get session APA data

### Final Decisions
- `POST /api/final-decisions` - Store final scenario decisions
- `GET /api/final-decisions/session/:session_id` - Get all decisions

### Value Evolution
- `POST /api/value-evolution` - Track value changes
- `GET /api/value-evolution/session/:session_id` - Get evolution history

### Session Feedback
- `POST /api/session-feedback` - Store comprehensive feedback
- `GET /api/session-feedback/session/:session_id` - Get feedback

### Session Metrics
- `POST /api/session-metrics` - Store calculated metrics from ViewResultsPage
- `GET /api/session-metrics/session/:session_id` - Get metrics

## MongoDB Collections

The server creates 9 collections:
1. `usersessions` - Demographics and session metadata
2. `baselinevalues` - Explicit and implicit value assessments
3. `scenariointeractions` - All user interactions during simulation
4. `cvrresponses` - CVR question responses
5. `apareorderings` - Value reordering events
6. `finaldecisions` - Confirmed decisions per scenario
7. `valueevolutions` - Value priority changes
8. `sessionfeedbacks` - Post-simulation feedback
9. `sessionmetrics` - ViewResultsPage calculated metrics

## Viewing Data

Use **MongoDB Compass** (GUI) or **mongosh** (CLI) to view your data:

### MongoDB Compass
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `wildfire_study`
4. Browse collections

### mongosh CLI
```bash
mongosh
use wildfire_study
show collections
db.usersessions.find().pretty()
```

## Development

- Source files: `backend/src/`
- TypeScript configuration: `backend/tsconfig.json`
- Auto-reload on changes: `nodemon` watches for file changes
- Build TypeScript: `npm run server:build`

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running: `mongod`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::4000
```
**Solution**: Stop other processes using port 4000 or change PORT in `backend/.env`

### CORS Errors
The server allows requests from:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`

If you need additional origins, edit `backend/src/server.ts`
