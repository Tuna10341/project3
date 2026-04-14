# Project 3 Requirements Document (Redis Edition)

## 1. Project Scope
Campus Nutrition Tracker previously stored data in MongoDB. In this practicum, the selected in-memory key-value feature is:

- Most viewed menu items per user

The goal is to keep a fast, real-time leaderboard of menu items each user views most often.

## 2. Functional Requirements
The Redis-backed feature must support complete CRUD operations.

1. Create
- Add a menu item to a user's leaderboard with an initial view count.

2. Read
- Read the full leaderboard for a user (descending by views).
- Read one specific menu item and its current views.

3. Update
- Increment a menu item's views when the user views it again.
- Set an exact score for a menu item.
- Rename an item label while preserving item id.

4. Delete
- Remove one item from a user's leaderboard.
- Remove an entire user's leaderboard.

## 3. Conceptual Model (UML Narrative, No Diagram)
Because diagram generation is excluded here, this section provides the model in textual form.

Entities and relationships:

- User
  - userId (string)
  - has one leaderboard key in Redis

- MenuItem
  - itemId (string)
  - itemName (string)

- MostViewedLeaderboard
  - key format: mostViewed:userId
  - contains multiple menu items with score = views

Relationship semantics:

- One User -> many MenuItems (ranked by score)
- Leaderboard is ordered by descending score
- Item updates are idempotent when using exact set score

## 4. Non-Functional Requirements
- In-memory access should be low-latency for reads and writes.
- API should expose straightforward routes that map cleanly to Redis commands.
- Data should be namespaced by user id to avoid key collisions.

## 5. Traceability to Implementation
Implemented in:
- app.js (Express + Redis routes)
- public/index.html (basic CRUD interface)

The implementation includes:
- Full CRUD operations for one Redis data structure (sorted set)
- Browser interface to create, display, modify, and delete leaderboard data
