# Redis Commands for All Use Cases (CRUD)

## Initialization

Clear all Redis keys (development only):

```bash
FLUSHALL
```

## Data Structure

Sorted set per user:

- Key: mostViewed:{userId}
- Member: {itemId}|{itemName}
- Score: views count

## CREATE

Add item with initial views:

```bash
ZADD mostViewed:user_001 1 "item_001|Grilled Chicken Bowl"
```

## READ

Read full leaderboard descending:

```bash
ZREVRANGE mostViewed:user_001 0 -1 WITHSCORES
```

Read top 5:

```bash
ZREVRANGE mostViewed:user_001 0 4 WITHSCORES
```

Read one item's score:

```bash
ZSCORE mostViewed:user_001 "item_001|Grilled Chicken Bowl"
```

## UPDATE

Increment views by 1:

```bash
ZINCRBY mostViewed:user_001 1 "item_001|Grilled Chicken Bowl"
```

Set exact views to 20:

```bash
ZADD mostViewed:user_001 20 "item_001|Grilled Chicken Bowl"
```

Rename item label while keeping item id (remove old + add new):

```bash
ZREM mostViewed:user_001 "item_001|Grilled Chicken Bowl"
ZADD mostViewed:user_001 20 "item_001|Chicken Bowl"
```

## DELETE

Delete one item from leaderboard:

```bash
ZREM mostViewed:user_001 "item_001|Chicken Bowl"
```

Delete entire leaderboard for a user:

```bash
DEL mostViewed:user_001
```

## API to Redis Command Mapping

POST /api/most-viewed/:userId
- ZADD

GET /api/most-viewed/:userId
- ZRANGE key start stop REV WITHSCORES

GET /api/most-viewed/:userId/:itemId
- ZRANGE + ZSCORE

PUT /api/most-viewed/:userId/:itemId
- MULTI -> ZREM + ZADD

PATCH /api/most-viewed/:userId/:itemId/increment
- ZINCRBY

DELETE /api/most-viewed/:userId/:itemId
- ZREM

DELETE /api/most-viewed/:userId
- DEL
