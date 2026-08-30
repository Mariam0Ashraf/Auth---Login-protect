const express = require("express");
const { requireAuth } = require("../middleware/requireAuth");
const authService = require("../services/authService");

const router = express.Router();

// Every route below is guarded. Adding one more needs no auth code at all.
router.use(requireAuth);

router.get("/profile", (req, res) => {
  res.json({ user: authService.toSafeUser(req.user) });
});

router.get("/dashboard", (req, res) => {
  res.json({
    message: `Welcome back, ${req.user.email}`,
    last_sign_in_at: req.user.last_sign_in_at,
  });
});

module.exports = router;
