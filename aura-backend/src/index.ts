import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import modelRoutes from "./routes/model.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tryOnRoutes from "./routes/tryon.routes";
import Generation from "./models/Generation";
dotenv.config();

const app = express();

// Trust the Render.com reverse proxy so req.protocol returns 'https'
app.set("trust proxy", 1);

// Increase payload limit for base64 garment images in JSON body
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// CORS: Allow all origins that the frontend might use
const allowedOrigins = [
  "https://auraaai-one.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow any Vercel preview deployment
      if (origin.includes("vercel.app") || origin.includes("localhost")) {
        return callback(null, true);
      }
      callback(null, true); // Allow all origins for now
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Image serving endpoint: serves stored images from MongoDB by ID
app.get("/api/images/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const generation = await Generation.findById(id);

    if (!generation || !generation.imageBase64) {
      return res.status(404).json({ message: "Image not found" });
    }

    const mimeType = generation.mimeType || "image/png";
    const buffer = Buffer.from(generation.imageBase64, "base64");

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    res.send(buffer);
  } catch (error) {
    console.error("Image serve error:", error);
    res.status(500).json({ message: "Failed to serve image" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/tryon", tryOnRoutes);

const PORT = Number(process.env.PORT || 5000);

(async () => {
  await connectDB(process.env.MONGO_URI!);
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
})();
