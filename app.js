const express = require("express");
const { createClient } = require("redis");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redis = createClient({ url: REDIS_URL });
redis.on("error", (err) => {
  console.error("Redis client error:", err.message);
});

function leaderboardKey(userId) {
  return `mostViewed:${userId}`;
}

function normalizePositiveNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

app.get("/api/health", async (req, res) => {
  try {
    const pong = await redis.ping();
    res.json({ status: "ok", redis: pong });
  } catch (error) {
    res.status(500).json({ error: "Redis unavailable", details: error.message });
  }
});

// CREATE: add a menu item with an initial view score for a user leaderboard.
app.post("/api/most-viewed/:userId", async (req, res) => {
  const { userId } = req.params;
  const { itemId, itemName, views } = req.body;

  if (!itemId || !itemName) {
    return res.status(400).json({ error: "itemId and itemName are required" });
  }

  const score = normalizePositiveNumber(views ?? 1);
  if (score === null) {
    return res.status(400).json({ error: "views must be a non-negative number" });
  }

  const key = leaderboardKey(userId);
  const member = `${itemId}|${itemName}`;

  await redis.zAdd(key, [{ score, value: member }]);
  return res.status(201).json({ message: "Created", userId, itemId, itemName, views: score });
});

// READ ALL: get top viewed menu items for a user.
app.get("/api/most-viewed/:userId", async (req, res) => {
  const { userId } = req.params;
  const limit = normalizePositiveNumber(req.query.limit ?? 10);
  if (limit === null) {
    return res.status(400).json({ error: "limit must be a non-negative number" });
  }

  const key = leaderboardKey(userId);
  const results = await redis.zRangeWithScores(key, 0, Math.max(0, limit - 1), { REV: true });

  const items = results.map((entry) => {
    const [itemId, itemName] = entry.value.split("|");
    return { itemId, itemName, views: entry.score };
  });

  return res.json({ userId, items });
});

// READ ONE: get one specific item score for a user leaderboard.
app.get("/api/most-viewed/:userId/:itemId", async (req, res) => {
  const { userId, itemId } = req.params;
  const key = leaderboardKey(userId);
  const members = await redis.zRange(key, 0, -1);

  const matched = members.find((member) => member.startsWith(`${itemId}|`));
  if (!matched) {
    return res.status(404).json({ error: "Not found" });
  }

  const score = await redis.zScore(key, matched);
  const [, itemName] = matched.split("|");
  return res.json({ userId, itemId, itemName, views: Number(score) });
});

// UPDATE: set an exact view score (and optionally rename) for an item.
app.put("/api/most-viewed/:userId/:itemId", async (req, res) => {
  const { userId, itemId } = req.params;
  const { views, itemName } = req.body;
  const nextScore = normalizePositiveNumber(views);

  if (nextScore === null) {
    return res.status(400).json({ error: "views must be a non-negative number" });
  }

  const key = leaderboardKey(userId);
  const members = await redis.zRange(key, 0, -1);
  const existing = members.find((member) => member.startsWith(`${itemId}|`));
  if (!existing) {
    return res.status(404).json({ error: "Not found" });
  }

  const currentName = existing.split("|")[1];
  const updatedName = itemName || currentName;
  const updatedMember = `${itemId}|${updatedName}`;

  await redis.multi().zRem(key, existing).zAdd(key, [{ score: nextScore, value: updatedMember }]).exec();

  return res.json({ message: "Updated", userId, itemId, itemName: updatedName, views: nextScore });
});

// UPDATE (alt): increment view count by one.
app.patch("/api/most-viewed/:userId/:itemId/increment", async (req, res) => {
  const { userId, itemId } = req.params;
  const key = leaderboardKey(userId);
  const members = await redis.zRange(key, 0, -1);
  const existing = members.find((member) => member.startsWith(`${itemId}|`));

  if (!existing) {
    return res.status(404).json({ error: "Not found" });
  }

  const nextScore = await redis.zIncrBy(key, 1, existing);
  const [, itemName] = existing.split("|");
  return res.json({ message: "Incremented", userId, itemId, itemName, views: Number(nextScore) });
});

// DELETE ONE: remove an item from a user leaderboard.
app.delete("/api/most-viewed/:userId/:itemId", async (req, res) => {
  const { userId, itemId } = req.params;
  const key = leaderboardKey(userId);
  const members = await redis.zRange(key, 0, -1);
  const existing = members.find((member) => member.startsWith(`${itemId}|`));

  if (!existing) {
    return res.status(404).json({ error: "Not found" });
  }

  await redis.zRem(key, existing);
  return res.json({ message: "Deleted item", userId, itemId });
});

// DELETE ALL: remove an entire user leaderboard.
app.delete("/api/most-viewed/:userId", async (req, res) => {
  const { userId } = req.params;
  const removed = await redis.del(leaderboardKey(userId));
  if (!removed) {
    return res.status(404).json({ error: "Leaderboard not found" });
  }
  return res.json({ message: "Deleted leaderboard", userId });
});

async function startServer() {
  await redis.connect();
  app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});