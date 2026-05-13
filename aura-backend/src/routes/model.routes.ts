import { Router } from "express";
import OpenAI, { toFile } from "openai";
import Generation from "../models/Generation";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * Build the full image URL for a generation ID.
 * Uses BASE_URL env variable if set (recommended for production behind proxies).
 * Falls back to req.protocol + req.get('host').
 */
function buildImageUrl(req: any, generationId: any): string {
  const baseUrl = process.env.BASE_URL;
  if (baseUrl) {
    return `${baseUrl}/api/images/${generationId}`;
  }
  // Fallback: construct from request (now works correctly with trust proxy)
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/api/images/${generationId}`;
}

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
      garmentImage, // optional base64 garment image from Upload Garment page
    } = req.body;

    const hasGarment = typeof garmentImage === "string" && garmentImage.length > 0;

    const finalPrompt = hasGarment
      ? `
Create a realistic full-body fashion model wearing the provided garment for a virtual try-on fashion app.

Model details:
- Gender: ${gender}
- Age range: ${ageRange}
- Ethnicity: ${ethnicity}
- Body type: ${bodyType}
- Clothing style: ${clothingStyle}
- Pose: ${pose}

User description:
${prompt}

IMPORTANT: The model MUST be wearing the exact garment shown in the reference image. Preserve the garment's design, color, pattern, and details precisely. Dress the model in this garment naturally and realistically.

Style:
Photorealistic, professional studio lighting, full body visible, clean background, fashion e-commerce quality, high detail.
`
      : `
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

    let imageBase64: string | undefined;

    if (hasGarment) {
      // Garment provided: use openai.images.edit() with garment as input
      // Strip data URL prefix if present (e.g. "data:image/png;base64,")
      const base64Raw = garmentImage.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Raw, "base64");

      const garmentFile = await toFile(buffer, "garment.png", {
        type: "image/png",
      });

      const result = await openai.images.edit({
        model: "gpt-image-1",
        image: [garmentFile],
        prompt: finalPrompt,
        size: "1024x1536",
        quality: "high",
      });

      imageBase64 = result.data?.[0]?.b64_json;
    } else {
      // No garment: text-to-image generation
      const result = await openai.images.generate({
        model: "gpt-image-1",
        prompt: finalPrompt,
        size: "1024x1536",
        quality: "high",
        n: 1,
      });

      imageBase64 = result.data?.[0]?.b64_json;
    }

    if (!imageBase64) {
      return res.status(500).json({
        message: "No image returned from OpenAI",
      });
    }

    const method = hasGarment ? "AI Generation + Garment" : "AI Generation";

    // Store in MongoDB — return URL instead of huge base64 payload
    const saved = await Generation.create({
      userId: req.userId,
      title: `${gender} ${ethnicity} Model`,
      method,
      imageBase64,
      mimeType: "image/png",
      prompt: finalPrompt,
    });

    // Build the image URL — uses BASE_URL env or falls back to request headers
    const imageUrl = buildImageUrl(req, saved._id);

    return res.json({
      id: saved._id,
      title: saved.title,
      method: saved.method,
      imageUrl,
      imageId: saved._id.toString(),
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
      .select("_id title method mimeType createdAt");

    // Build imageUrl for each history item
    const historyWithUrls = history.map((item) => ({
      _id: item._id,
      title: item.title,
      method: item.method,
      mimeType: item.mimeType,
      imageUrl: buildImageUrl(req, item._id),
      createdAt: item.createdAt,
    }));

    return res.json(historyWithUrls);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load history",
    });
  }
});

export default router;
