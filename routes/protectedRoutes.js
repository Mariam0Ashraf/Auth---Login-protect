const express = require("express");
const authService = require("../services/authService");

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

router.get("/profile", async (req, res) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const { data, error } = await authService.verifyToken(token);

  // A tampered or expired token sets error; getUser can also answer with no
  // user and no error, so both are checked before the door opens.
  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  res.json({ user: authService.toSafeUser(data.user) });
});

module.exports = router;
