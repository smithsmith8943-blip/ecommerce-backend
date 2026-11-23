require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/dbConnection");
const sanitize = require("./middleware/sanitize");
const { errorHandler } = require("./middleware/errorHandler");

connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use(sanitize);

app.get("/", (req, res) => res.send("API running"));
app.use("/api/auth", require("./routes/authenticationRoutes"));
app.use("/api/users", require("./routes/userProfileRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log(`Server on port ${process.env.PORT}`)
);