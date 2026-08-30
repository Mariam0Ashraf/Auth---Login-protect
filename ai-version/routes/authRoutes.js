const express = require("express");
const authService = require("../services/authService");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const data = await authService.signUp(email, password);
    res.status(201).json(data.user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const data = await authService.signIn(email, password);
    res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid login credentials" });
  }
});

router.post("/logout", authenticate, async (req, res) => {
  await authService.signOut();
  res.status(204).send();
});

module.exports = router;
