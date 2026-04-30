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

    const prompt =
      "Create a realistic virtual try-on image. Use the person from the uploaded images and dress them with the clothing from the reference images. Keep the face, body shape, pose, lighting, and background realistic. Make the final image clean, fashionable, and suitable for an e-commerce fashion platform.";

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

    res.json({
      imageBase64,
      mimeType: "image/png",
    });
  } catch (error: any) {
    console.error("Try-on error:", error);

    res.status(error?.status || 500).json({
      message: error?.message || "Try-on generation failed.",
    });
  }
});

export default router;