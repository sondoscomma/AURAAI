import { Router } from "express";
import OpenAI, { toFile } from "openai";
import Generation from "../models/Generation";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { buildImageUrl } from "../utils/buildImageUrl";
import { modelGenerateSchema, validateBody } from "../utils/validation";

const router = Router();

// ─── POST /generate — Generate AI model image ───
router.post("/generate", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Server configuration error: Missing API key",
      });
    }

    // Validate request body
    const parsed = validateBody(modelGenerateSchema, req.body);
    const { prompt, gender, ageRange, ethnicity, bodyType, clothingStyle, pose, garmentImage } = parsed;

    // Optional: direction and groupId for linking multi-view generations
    const direction = (req.body.direction === "front" || req.body.direction === "right") ? req.body.direction : null;
    const groupId = typeof req.body.groupId === "string" && req.body.groupId.length > 0 ? req.body.groupId : null;

    const hasGarment = typeof garmentImage === "string" && garmentImage.length > 0;

    const garmentPreservationRules = `
STRICT GARMENT PRESERVATION RULES — YOU MUST FOLLOW THESE:
- Do NOT add any extra elements, accessories, buttons, zippers, pockets, logos, embroidery, patterns, or decorations that are NOT present in the original garment image.
- Do NOT modify, alter, or redesign the garment in any way — no changing colors, no adding prints, no adding layers, no adding texture.
- Do NOT add jewelry, scarves, belts, hats, bags, sunglasses, or any accessory that was not part of the original garment.
- Do NOT add extra clothing layers underneath or on top of the garment (no undershirts, no jackets, no cardigans unless shown in the reference).
- Do NOT change the garment's neckline, sleeve length, hemline, fit, or silhouette from the original design.
- Do NOT add any text, writing, brand names, or labels to the garment.
- The garment must appear EXACTLY as shown in the reference image — same fabric, same color, same cut, same stitching, same every detail.
- If the garment is plain, keep it plain. If it has a pattern, keep that exact pattern. No additions, no enhancements, no artistic modifications.
- The ONLY thing you should do is put the exact same garment onto the model's body naturally. Nothing more, nothing less.`;

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

${garmentPreservationRules}

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

IMPORTANT: Do NOT add any extra clothing items, accessories, or decorations beyond what is described. Keep the outfit exactly as specified — no extra layers, no extra patterns, no extra elements.

Style:
Photorealistic, professional studio lighting, full body visible, clean background, fashion e-commerce quality, high detail.
`;

    const openai = new OpenAI({ apiKey });

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

    // Store in MongoDB — userId is set if the user is logged in, otherwise saved as guest
    const saved = await Generation.create({
      userId: undefined,
      title: `${gender} ${ethnicity} Model`,
      method,
      imageBase64,
      mimeType: "image/png",
      prompt: finalPrompt,
      direction,
      groupId,
    });

    const imageUrl = buildImageUrl(req, saved._id.toString());

    return res.json({
      id: saved._id,
      title: saved.title,
      method: saved.method,
      imageUrl,
      imageId: saved._id.toString(),
      mimeType: "image/png",
      createdAt: saved.createdAt,
      description: finalPrompt,
      direction,
      groupId,
    });
  } catch (error: any) {
    console.error("OpenAI image generation error:", error);

    const status = error?.status || 500;
    const message = error?.message || "OpenAI image generation failed";

    return res.status(status).json({ message });
  }
});

// ─── POST /save — Save a generation result to the database ───
// Used by result pages to persist generated images for cloud sync
router.post("/save", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, method, imageBase64, mimeType, prompt, direction, groupId } = req.body;

    if (!imageBase64 || typeof imageBase64 !== "string" || imageBase64.length < 100) {
      return res.status(400).json({
        message: "Valid imageBase64 data is required (minimum 100 characters).",
      });
    }

    // Validate base64 format (allow both raw base64 and data URLs)
    const rawBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");

    const saved = await Generation.create({
      userId: req.userId,
      title: title || "Saved Generation",
      method: method || "Manual Save",
      imageBase64: rawBase64,
      mimeType: mimeType || "image/png",
      prompt: prompt || "",
      direction: (direction === "front" || direction === "right") ? direction : null,
      groupId: typeof groupId === "string" && groupId.length > 0 ? groupId : null,
    });

    const imageUrl = buildImageUrl(req, saved._id.toString());

    return res.status(201).json({
      id: saved._id,
      title: saved.title,
      method: saved.method,
      imageUrl,
      imageId: saved._id.toString(),
      mimeType: saved.mimeType,
      direction: saved.direction,
      groupId: saved.groupId,
      createdAt: saved.createdAt,
    });
  } catch (error: any) {
    console.error("Save generation error:", error);
    const status = error?.status || 500;
    const message = error?.message || "Failed to save generation";
    return res.status(status).json({ message });
  }
});

// ─── GET /history — Paginated generation history for the user ───
router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    // Pagination: default page 1, 20 items per page
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      Generation.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .select("_id title method mimeType createdAt direction groupId prompt")
        .skip(skip)
        .limit(limit),
      Generation.countDocuments({ userId: req.userId }),
    ]);

    // Build imageUrl for each history item
    const historyWithUrls = history.map((item) => ({
      _id: item._id,
      title: item.title,
      method: item.method,
      mimeType: item.mimeType,
      imageUrl: buildImageUrl(req, item._id.toString()),
      direction: item.direction,
      groupId: item.groupId,
      prompt: item.prompt,
      createdAt: item.createdAt,
    }));

    return res.json({
      data: historyWithUrls,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load history",
    });
  }
});

export default router;
