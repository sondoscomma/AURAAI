import { Router } from "express";
import multer from "multer";
import OpenAI, { toFile } from "openai";
import Generation from "../models/Generation";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { buildImageUrl } from "../utils/buildImageUrl";
import { tryonPromptSchema, validateBody } from "../utils/validation";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/generate", requireAuth, upload.array("images", 16), async (req: AuthRequest, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Server configuration error: Missing API key",
      });
    }

    const files = req.files as Express.Multer.File[];

    if (!files || files.length < 2) {
      return res.status(400).json({
        message: "Upload at least 2 images: person image and clothing image.",
      });
    }

    // Validate prompt if provided
    const parsed = validateBody(tryonPromptSchema, req.body);
    const customPrompt = parsed.prompt;

    const prompt = customPrompt?.trim()
      ? customPrompt
      : "Create a realistic virtual try-on image. Use the person from the uploaded images and dress them with the clothing from the reference images. Keep the face, body shape, pose, lighting, and background realistic. Make the final image clean, fashionable, and suitable for an e-commerce fashion platform.";

    // Optional: direction and groupId for linking multi-view generations
    const direction = (req.body.direction === "front" || req.body.direction === "right") ? req.body.direction : null;
    const groupId = typeof req.body.groupId === "string" && req.body.groupId.length > 0 ? req.body.groupId : null;

    const openai = new OpenAI({ apiKey });

    const imageFiles = await Promise.all(
      files.map((file) =>
        toFile(file.buffer, file.originalname, {
          type: file.mimetype,
        })
      )
    );

    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFiles,
      prompt,
      size: "1024x1536",
      quality: "high",
    });

    const imageBase64 = result.data?.[0]?.b64_json;

    if (!imageBase64) {
      return res.status(500).json({ message: "No image generated." });
    }

    // Store in MongoDB with userId so the generation has an owner
    const saved = await Generation.create({
      userId: req.userId,
      title: "Virtual Try-On",
      method: "Try-On",
      imageBase64,
      mimeType: "image/png",
      prompt,
      direction,
      groupId,
    });

    const imageUrl = buildImageUrl(req, saved._id.toString());

    res.json({
      id: saved._id,
      title: saved.title,
      method: saved.method,
      imageUrl,
      imageId: saved._id.toString(),
      mimeType: "image/png",
      createdAt: saved.createdAt,
      direction,
      groupId,
    });
  } catch (error: any) {
    console.error("Try-on error:", error);

    const status = error?.status || 500;
    const message = error?.message || "Try-on generation failed.";

    res.status(status).json({ message });
  }
});

export default router;
