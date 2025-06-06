import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import { connectDB } from "./utils/connectDB.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const localMongoURI = "mongodb://localhost:27017";
const MONGO_URI = process.env.MONGO_URI || localMongoURI;

connectDB(MONGO_URI).catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
});

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Frontend dev server
      "http://localhost:3001", // Optional alternate port
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/chatbot", chatbotRoutes);
// app.use(morgan("dev")); // Uncomment for request logging

// Test route
app.get("/", (req, res) => res.send("Server OK ✔"));

// API routes
app.use("/api", routes);

// Error handlers (LAST)
app.use(routeNotFound);
app.use(errorHandler);

// Routes
app.use("/api", routes);

// Error Handling
app.use(routeNotFound);
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Connected to MongoDB at: ${MONGO_URI}`);
});
