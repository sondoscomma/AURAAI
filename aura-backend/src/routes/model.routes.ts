import { Router } from "express";
import OpenAI from "openai";
import Generation from "../models/Generation";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/generate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Missing OPENAI_API_KEY in .env",
      });
    }

    const openai = new OpenAI({ apiKey });

    const {
      prompt,
      gender,
      ageRange,
      ethnicity,
      bodyType,
      clothingStyle,
      pose,
    } = req.body;

    const finalPrompt = `
Create a realistic full-body fashion model for a virtual try-on fashion app.

Model details:
- Gender: ${gender}
- Age range: ${ageRange}
- Ethnicity: ${ethnicity}
- Body type: ${bodyType}
- Clothing style: ${clothingStyle}
- Pose: ${pose}

User description:
${prompt}

Style:
Photorealistic, professional studio lighting, full body visible, clean background, fashion e-commerce quality, high detail.
`;

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: finalPrompt,
      size: "1024x1536",
      quality: "high",
      n: 1,
    });

    const imageBase64 = result.data?.[0]?.b64_json;

    if (!imageBase64) {
      return res.status(500).json({
        message: "No image returned from OpenAI",
      });
    }

    const saved = await Generation.create({
      userId: req.userId,
      title: `${gender} ${ethnicity} Model`,
      method: "AI Generation",
      imageBase64,
      mimeType: "image/png",
      prompt: finalPrompt,
    });

    return res.json({
      id: saved._id,
      title: saved.title,
      method: saved.method,
      imageBase64,
      mimeType: "image/png",
      createdAt: saved.createdAt,
      description: finalPrompt,
    });
  } catch (error: any) {
    console.error("OpenAI image generation error:", error);

    return res.status(error?.status || 500).json({
      message: error?.message || "OpenAI image generation failed",
    });
  }
});

router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const history = await Generation.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("_id title method imageBase64 mimeType createdAt");

    return res.json(history);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load history",
    });
  }
});

export default router;