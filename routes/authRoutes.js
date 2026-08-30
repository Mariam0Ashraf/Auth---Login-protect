const express = require("express");
const authService = require("../services/authService");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password } = req.body || {};

  if (!authService.hasCredentials(email, password)) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await authService.signUp(email, password);

  if (error) {
    return res.status(error.status || 400).json({ error: error.message });
  }

  res.status(201).json({ user: data.user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!authService.hasCredentials(email, password)) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await authService.logIn(email, password);

  if (error) {
    return res.status(401).json({ error: "Invalid login credentials" });
  }

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    token_type: data.session.token_type,
    expires_at: data.session.expires_at,
    user: { id: data.user.id, email: data.user.email },
  });
});

// Protected: the guard verifies the token before this route ends its session.
router.post("/logout", requireAuth, async (req, res) => {
  await authService.logOut(req.token);

  res.status(204).send();
});

module.exports = router;
