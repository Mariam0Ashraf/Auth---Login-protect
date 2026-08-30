const authService = require("../services/authService");

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

// One guard for every locked door. It answers 401 itself, so a route that sits
// behind it can assume req.user exists and never repeats an auth check.
async function requireAuth(req, res, next) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const { data, error } = await authService.verifyToken(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = data.user;
  req.token = token;
  next();
}

module.exports = { requireAuth, extractBearerToken };
