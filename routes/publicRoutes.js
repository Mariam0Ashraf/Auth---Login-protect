const express = require("express");

const router = express.Router();

router.get("/info", (req, res) => {
  res.json({ message: "Welcome stranger! This info is public." });
});

module.exports = router;
