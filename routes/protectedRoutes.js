const express = require("express");

const router = express.Router();

// Pulls the token out of "Authorization: Bearer <token>".
// Returns null when the header is missing, uses another scheme, or carries
// no token at all — every one of those is a 401 rather than a crash.
function extractBearerToken(header) {
  if (typeof header !== "string") {
    return null;
  }

  const [scheme, token, ...rest] = header.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== "bearer" || !token || rest.length > 0) {
    return null;
  }

  return token;
}

router.get("/profile", (req, res) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  // Stage 3 replaces this with a real check against Supabase. For now the
  // route only proves a token was presented, not that it is genuine.
  res.json({ message: "A token was presented (not verified yet)" });
});

module.exports = router;
