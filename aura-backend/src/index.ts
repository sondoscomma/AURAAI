import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import modelRoutes from "./routes/model.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tryOnRoutes from "./routes/tryon.routes";
import { globalErrorHandler } from "./middleware/error";
import Generation from "./models/Generation";
import { buildImageUrl } from "./utils/buildImageUrl";

dotenv.config();

const app = express();

// Trust the Render.com reverse proxy so req.protocol returns 'https'
app.set("trust proxy", 1);

// Increase payload limit for base64 garment images in JSON body
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ─── Rate Limiting ───
// General rate limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Strict rate limiter for generation endpoints: 10 requests per 15 minutes per IP
const generationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many generation requests. Please wait before trying again." },
});

// Auth rate limiter: 5 requests per 15 minutes per IP (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts. Please wait before trying again." },
});

app.use(generalLimiter);

// ─── CORS ───
const allowedOrigins = [
  "https://auraaai-one.vercel.app",
  "https://auraai-one.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check against explicit allowlist
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel preview deployment or localhost
      if (origin.includes("vercel.app") || origin.includes("localhost")) {
        return callback(null, true);
      }

      // Reject unknown origins
      callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Health Check ───
app.get("/health", (_req, res) => res.json({ ok: true }));

// ─── Image Serving Endpoint ───
// Serves stored images from MongoDB by ID
app.get("/api/images/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format to prevent injection
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid image ID format" });
    }

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

// ─── Get a single generation by ID ───
// Returns metadata + imageUrl for a generation
app.get("/api/generations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid generation ID format" });
    }

    const generation = await Generation.findById(id);

    if (!generation) {
      return res.status(404).json({ message: "Generation not found" });
    }

    // Optional: check that the requesting user owns this generation
    // (skip for now to support sharing generation results)
    const imageUrl = buildImageUrl(req, generation._id.toString());

    return res.json({
      id: generation._id,
      title: generation.title,
      method: generation.method,
      imageUrl,
      imageId: generation._id.toString(),
      mimeType: generation.mimeType,
      prompt: generation.prompt,
      direction: generation.direction,
      groupId: generation.groupId,
      createdAt: generation.createdAt,
      updatedAt: generation.updatedAt,
    });
  } catch (error) {
    console.error("Get generation error:", error);
    return res.status(500).json({ message: "Failed to fetch generation" });
  }
});

// ─── Get all generations in a group (e.g. front + right views) ───
app.get("/api/generations/group/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId || groupId.length < 1) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    const generations = await Generation.find({ groupId })
      .sort({ direction: 1, createdAt: 1 })
      .select("_id title method mimeType prompt direction groupId createdAt");

    if (generations.length === 0) {
      return res.status(404).json({ message: "No generations found for this group" });
    }

    const results = generations.map((item) => ({
      id: item._id,
      title: item.title,
      method: item.method,
      imageUrl: buildImageUrl(req, item._id.toString()),
      imageId: item._id.toString(),
      mimeType: item.mimeType,
      prompt: item.prompt,
      direction: item.direction,
      groupId: item.groupId,
      createdAt: item.createdAt,
    }));

    return res.json({ data: results, count: results.length });
  } catch (error) {
    console.error("Get generation group error:", error);
    return res.status(500).json({ message: "Failed to fetch generation group" });
  }
});

// ─── Routes ───
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", userRoutes);
app.use("/api/models", generationLimiter, modelRoutes);
app.use("/api/tryon", generationLimiter, tryOnRoutes);

// ─── Global Error Handler (must be after all routes) ───
app.use(globalErrorHandler);

// ─── Start Server ───
const PORT = Number(process.env.PORT || 5000);

(async () => {
  try {
    await connectDB(process.env.MONGO_URI!);
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
