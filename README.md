# Campus Nutrition Tracker - Project 3 (Node + Express + Redis)

## Project Summary
This project adapts the previous Campus Nutrition database work into an in-memory key-value design using Redis.

Implemented Redis feature:
- Most viewed menu items per user

Implemented stack:
- Node.js
- Express
- Redis

This repository includes a working CRUD web app and API for the selected Redis data structure.

## What Was Implemented

1. Requirements document (textual model, no UML image generated here)
- See P3_REQUIREMENTS.md

2. Data structures document
- See REDIS_DATA_STRUCTURES.md

3. Redis command/use-case document (includes CRUD)
- See REDIS_COMMANDS_CRUD.md

4. Basic Node + Express + Redis app with CRUD
- Backend: app.js
- Frontend: public/index.html

## Redis Data Structure Implemented

Primary structure:
- Sorted set key: mostViewed:{userId}
- Member value: {itemId}|{itemName}
- Score: number of views

CRUD support:
- Create item
- Read user leaderboard
- Read one item
- Update exact score/name
- Increment score
- Delete one item
- Delete full leaderboard

## API Endpoints

Health
- GET /api/health

Leaderboard CRUD
- POST /api/most-viewed/:userId
- GET /api/most-viewed/:userId
- GET /api/most-viewed/:userId/:itemId
- PUT /api/most-viewed/:userId/:itemId
- PATCH /api/most-viewed/:userId/:itemId/increment
- DELETE /api/most-viewed/:userId/:itemId
- DELETE /api/most-viewed/:userId

## Setup Instructions

Prerequisites:
- Node.js 18+
- Redis server running locally on port 6379 (or set REDIS_URL)

1. Install dependencies

```bash
npm install
```

2. Start Redis (example)

```bash
redis-server
```

3. Start the app

```bash
npm start
```

4. Open browser

http://localhost:3000

## Quick API Example

Create item:

```bash
curl -X POST http://localhost:3000/api/most-viewed/user_001 \
  -H "Content-Type: application/json" \
  -d '{"itemId":"item_001","itemName":"Grilled Chicken Bowl","views":1}'
```

Get leaderboard:

```bash
curl "http://localhost:3000/api/most-viewed/user_001?limit=10"
```

Increment item:

```bash
curl -X PATCH http://localhost:3000/api/most-viewed/user_001/item_001/increment
```

## Video
Existing project video link:
- https://drive.google.com/file/d/1h2R7dolmOp3CWTJK2juibYRfufEayoou/view?usp=sharing

If you record a new Project 3-specific demo, replace this link with the new one.

## AI Disclosure
Portions of code scaffolding and documentation drafting were assisted by AI (GitHub Copilot). All outputs were reviewed, edited, and validated in this repository.

## Legacy Files
This repo still contains previous MongoDB project artifacts (init.js, query files, CSV/JSON dumps) for reference from earlier assignments.
