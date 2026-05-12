import { Router } from "express";
import multer from "multer";
import OpenAI, { toFile } from "openai";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/generate", upload.array("images", 16), async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const files = req.files as Express.Multer.File[];

    if (!files || files.length < 2) {
      return res.status(400).json({
        message: "Upload at least 2 images: person image and clothing image.",
      });
    }

    const imageFiles = await Promise.all(
      files.map((file) =>
        toFile(file.buffer, file.originalname, {
          type: file.mimetype,
        })
      )
    );

    // Allow custom prompt from frontend, or use the default two-view prompt
    const customPrompt = req.body.prompt as string | undefined;
    const prompt = customPrompt?.trim()
      ? customPrompt
      : `Generate two virtual try-on images of the same person wearing the provided clothing:

1. FRONT VIEW — A realistic front-facing full-body shot showing the person wearing the clothing. Keep the face, body shape, pose, lighting, and background realistic.
2. RIGHT SIDE VIEW — A realistic right-side profile full-body shot of the same person wearing the same clothing, viewed from their right side. Maintain consistent lighting, clothing fit, and background style.

Both images should look clean, fashionable, and suitable for an e-commerce fashion platform. Ensure the clothing appearance is consistent across both views.`;

    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFiles,
      prompt,
      size: "1024x1536",
      quality: "high",
      n: 2, // Request 2 images: front view + right side view
    });

    if (!result.data || result.data.length < 2) {
      return res.status(500).json({
        message: "Expected 2 images but did not receive enough from the API.",
      });
    }

    const images = result.data.map((item, index) => ({
      view: index === 0 ? "front" : "right",
      imageBase64: item.b64_json,
      mimeType: "image/png",
    }));

    res.json({ images });
  } catch (error: any) {
    console.error("Try-on error:", error);

    res.status(error?.status || 500).json({
      message: error?.message || "Try-on generation failed.",
    });
  }
});

export default router;
