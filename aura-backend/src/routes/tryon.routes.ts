import { Router } from "express";
import multer from "multer";
import OpenAI, { toFile } from "openai";
import Generation from "../models/Generation";
import { buildImageUrl } from "../utils/buildImageUrl";
import { tryonPromptSchema, validateBody } from "../utils/validation";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/generate", upload.array("images", 16), async (req, res) => {
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

    const garmentPreservationRules = `STRICT GARMENT PRESERVATION RULES — YOU MUST FOLLOW THESE:
- Do NOT add any extra elements, accessories, buttons, zippers, pockets, logos, embroidery, patterns, or decorations that are NOT present in the original garment image.
- Do NOT modify, alter, or redesign the garment in any way — no changing colors, no adding prints, no adding layers, no adding texture.
- Do NOT add jewelry, scarves, belts, hats, bags, sunglasses, or any accessory that was not part of the original garment.
- Do NOT add extra clothing layers underneath or on top of the garment (no undershirts, no jackets, no cardigans unless shown in the reference).
- Do NOT change the garment's neckline, sleeve length, hemline, fit, or silhouette from the original design.
- Do NOT add any text, writing, brand names, or labels to the garment.
- The garment must appear EXACTLY as shown in the reference image — same fabric, same color, same cut, same stitching, same every detail.
- If the garment is plain, keep it plain. If it has a pattern, keep that exact pattern. No additions, no enhancements, no artistic modifications.
- The ONLY thing you should do is put the exact same garment onto the person's body naturally. Nothing more, nothing less.`;

    const prompt = customPrompt?.trim()
      ? `${customPrompt}\n\n${garmentPreservationRules}`
      : `Create a realistic virtual try-on image. Use the person from the uploaded images and dress them with the clothing from the reference images. Keep the face, body shape, pose, lighting, and background realistic. Make the final image clean, fashionable, and suitable for an e-commerce fashion platform.\n\n${garmentPreservationRules}`;

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

    // Store in MongoDB — userId is set if the user is logged in, otherwise saved as guest
    const saved = await Generation.create({
      userId: undefined,
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
