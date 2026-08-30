const express = require("express");
const { checkConnection } = require("./supabase");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/auth", authRoutes);

checkConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running and connected to Supabase on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Could not connect to Supabase:", error.message);
    process.exit(1);
  });
