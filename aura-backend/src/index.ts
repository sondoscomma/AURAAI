import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import modelRoutes from "./routes/model.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tryOnRoutes from "./routes/tryon.routes";
dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/tryon", tryOnRoutes);
const PORT = Number(process.env.PORT || 5000);

(async () => {
  await connectDB(process.env.MONGO_URI!);
  app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
})();