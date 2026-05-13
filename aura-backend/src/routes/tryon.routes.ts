import { Router } from "express";
import multer from "multer";
import OpenAI, { toFile } from "openai";
import Generation from "../models/Generation";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

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

    // Allow custom prompt from frontend, or use the default
    const customPrompt = req.body.prompt as string | undefined;
    const prompt = customPrompt?.trim()
      ? customPrompt
      : "Create a realistic virtual try-on image. Use the person from the uploaded images and dress them with the clothing from the reference images. Keep the face, body shape, pose, lighting, and background realistic. Make the final image clean, fashionable, and suitable for an e-commerce fashion platform.";

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

    // Store in MongoDB and return URL instead of raw base64
    const saved = await Generation.create({
      title: "Virtual Try-On",
      method: "Try-On",
      imageBase64,
      mimeType: "image/png",
      prompt,
    });

    // Build the image URL from the backend's own origin
    const protocol = req.protocol;
    const host = req.get("host");
    const imageUrl = `${protocol}://${host}/api/images/${saved._id}`;

    res.json({
      imageUrl,
      imageId: saved._id.toString(),
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
