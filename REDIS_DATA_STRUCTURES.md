# Redis Data Structures Used

## Primary Implemented Structure

### 1. Sorted Set (ZSET)
Use case:
- Keep per-user ranking of most viewed menu items.

Key pattern:
- mostViewed:{userId}

Member format:
- {itemId}|{itemName}

Score:
- Number of views for that item by that user.

Why ZSET fits:
- Automatically keeps items sorted by score.
- Supports efficient ranking and top-N retrieval.
- Supports incremental updates when views increase.
- Supports exact score replacement when editing values.

Example:
- Key: mostViewed:user_001
- Member: item_001|Grilled Chicken Bowl
- Score: 14

## Optional Secondary Structure (Documented, Not Required for Rubric)

### 2. String Key for Health/Meta
Use case:
- Connection health is validated via PING (no persisted schema required).

Reason:
- Not central to CRUD feature, but useful for operational checks.

## CRUD Mapping Summary
- Create: ZADD
- Read (all): ZREVRANGE / ZRANGE with REV and WITHSCORES
- Read (one): ZSCORE after locating member by item id
- Update exact: ZADD or ZREM + ZADD
- Update increment: ZINCRBY
- Delete one: ZREM
- Delete all: DEL
