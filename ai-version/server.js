const express = require("express");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./openapi.json");
const { PORT } = require("./config");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use("/public", publicRoutes);

app.listen(PORT, () => {
  console.log(`Server running and connected to Supabase on port ${PORT}`);
});
