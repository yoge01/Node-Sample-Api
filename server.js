// server.js
const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const mysql = require("mysql2");
const config = require("./DbConfig");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const port = process.env.PORT || 3005;

require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyparser.json());
app.use(express.json());
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));

// Create connection pool
const pool = mysql.createPool(config);
pool.getConnection((err, connection) => {
  if (err) console.error("Database connection failed:", err);
  else {
    console.log("Database connected successfully.");
    connection.release();
  }
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// Login route to generate JWT token
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const dummyUser = {
    id: 1,
    username: "admin",
    passwordHash: await bcrypt.hash("admin123", 10)
  };

  const validPassword = await bcrypt.compare(password, dummyUser.passwordHash);
  if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: dummyUser.id, username: dummyUser.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Student routes
const studentRoutes = require("./Routes/Studentroutes")(pool, authenticateToken);
app.use("/api", studentRoutes);

// Start server
app.listen(3005, () => {
  console.log(`🚀 API server running at ${port}`);
});

// app.listen(3005, () => {
//   console.log('🚀 API server running at http://localhost:3005');
// });
