import { Router } from "express";
import OpenAI, { toFile } from "openai";
import Generation from "../models/Generation";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { buildImageUrl } from "../utils/buildImageUrl";
import { modelGenerateSchema, modelGenerateWithGarmentSchema, imageAdjustSchema, validateBody } from "../utils/validation";

const router = Router();

// ─── POST /generate — Generate AI model image (front view only) ───
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
    const { prompt, gender, ageRange, ethnicity, bodyType, clothingStyle, pose } = parsed;

    // Garment is no longer part of the /generate endpoint.
    // It has been moved to /generate-with-garment for the result page workflow.

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

IMPORTANT: Do NOT add any extra clothing items, accessories, or decorations beyond what is described. Keep the outfit exactly as specified — no extra layers, no extra patterns, no extra elements.

Style:
Photorealistic, professional studio lighting, full body visible, clean background, fashion e-commerce quality, high detail.
`;

    const openai = new OpenAI({ apiKey });

    // No garment: text-to-image generation
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

    const method = "AI Generation";

    // Generate a groupId for linking subsequent garment try-on generations
    const groupId = req.body.groupId || null;

    const saved = await Generation.create({
      userId: undefined,
      title: `${gender} ${ethnicity} Model`,
      method,
      imageBase64,
      mimeType: "image/png",
      prompt: finalPrompt,
      direction: "front",
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
      direction: "front",
      groupId: saved.groupId,
    });
  } catch (error: any) {
    console.error("OpenAI image generation error:", error);

    const status = error?.status || 500;
    const message = error?.message || "OpenAI image generation failed";

    return res.status(status).json({ message });
  }
});

// ─── POST /generate-with-garment — Generate AI model with garment + base image + prompt ───
// This endpoint takes a previously generated AI model image, a garment image, and an optional prompt
// to produce a new image with the garment on the model (front view only)
router.post("/generate-with-garment", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Server configuration error: Missing API key",
      });
    }

    // Validate request body
    const parsed = validateBody(modelGenerateWithGarmentSchema, req.body);
    const { prompt, gender, ageRange, ethnicity, bodyType, clothingStyle, pose, garmentImage, baseImage } = parsed;

    // Optional: groupId for linking related generations
    const groupId = typeof req.body.groupId === "string" && req.body.groupId.length > 0 ? req.body.groupId : null;

    // Optional: baseImageId reference to the previously generated model
    const baseImageId = typeof req.body.baseImageId === "string" && req.body.baseImageId.length > 0 ? req.body.baseImageId : null;

    // The userPrompt is the custom text the user typed in the GenerationResult page
    const userPrompt = typeof req.body.userPrompt === "string" ? req.body.userPrompt : "";

    const hasGarment = typeof garmentImage === "string" && garmentImage.length > 0;
    const hasBaseImage = typeof baseImage === "string" && baseImage.length > 0;

    if (!hasGarment) {
      return res.status(400).json({
        message: "Garment image is required for generate-with-garment endpoint",
      });
    }

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

    const baseImageInstruction = hasBaseImage
      ? `
IMPORTANT — BASE IMAGE REFERENCE:
A previously generated AI model image is provided as the base/reference image. You MUST:
- Maintain the same model appearance (face, body type, pose, ethnicity) as shown in the base image.
- Keep the same model identity and characteristics.
- The model should look like the same person from the base image, now wearing the uploaded garment.
- Do NOT change the model's facial features, skin tone, or body proportions from the base image.
`
      : "";

    // Build the prompt using the user's custom prompt if provided,
    // otherwise fall back to the full prompt from model attributes
    const userCustomPrompt = userPrompt.trim() || prompt.trim();

    const finalPrompt = `
Create a realistic full-body fashion model wearing the provided garment for a virtual try-on fashion app.

Model details:
- Gender: ${gender}
- Age range: ${ageRange}
- Ethnicity: ${ethnicity}
- Body type: ${bodyType}
- Clothing style: ${clothingStyle}
- Pose: ${pose}

User description:
${userCustomPrompt}

${baseImageInstruction}

${garmentPreservationRules}

Style:
Photorealistic, professional studio lighting, full body visible, clean background, fashion e-commerce quality, high detail.
`;

    const openai = new OpenAI({ apiKey });

    let imageBase64: string | undefined;

    // Build the array of image files for the edit API
    const imageFiles: any[] = [];

    // Add garment image
    const garmentBase64Raw = garmentImage.replace(/^data:[^;]+;base64,/, "");
    const garmentBuffer = Buffer.from(garmentBase64Raw, "base64");
    const garmentFile = await toFile(garmentBuffer, "garment.png", {
      type: "image/png",
    });
    imageFiles.push(garmentFile);

    // Add base image if provided (the previously generated model)
    if (hasBaseImage) {
      let baseBuffer: Buffer;
      if (baseImage.startsWith("http")) {
        // Fetch the image from URL
        const response = await fetch(baseImage);
        const arrayBuffer = await response.arrayBuffer();
        baseBuffer = Buffer.from(arrayBuffer);
      } else {
        const baseBase64Raw = baseImage.replace(/^data:[^;]+;base64,/, "");
        baseBuffer = Buffer.from(baseBase64Raw, "base64");
      }
      const baseFile = await toFile(baseBuffer, "base_model.png", {
        type: "image/png",
      });
      imageFiles.push(baseFile);
    }

    // Use openai.images.edit() with garment (and optionally base image) as input
    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFiles,
      prompt: finalPrompt,
      size: "1024x1536",
      quality: "high",
    });

    imageBase64 = result.data?.[0]?.b64_json;

    if (!imageBase64) {
      return res.status(500).json({
        message: "No image returned from OpenAI",
      });
    }

    const method = "AI Generation + Garment";

    // Store in MongoDB
    const saved = await Generation.create({
      userId: undefined,
      title: `${gender} ${ethnicity} Model with Garment`,
      method,
      imageBase64,
      mimeType: "image/png",
      prompt: finalPrompt,
      direction: "front",
      groupId,
      baseImageId: baseImageId || null,
      userPrompt: userPrompt,
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
      direction: "front",
      groupId,
      baseImageId: baseImageId || null,
      userPrompt: userPrompt,
    });
  } catch (error: any) {
    console.error("OpenAI generate-with-garment error:", error);

    const status = error?.status || 500;
    const message = error?.message || "OpenAI generation with garment failed";

    return res.status(status).json({ message });
  }
});

// ─── POST /adjust — Adjust a previously generated image based on chat prompt ───
// Takes the current image (baseImage) and a user's adjustment request to produce a refined image.
// Used by the GarmentChatAdjust page for interactive image refinement.
router.post("/adjust", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Server configuration error: Missing API key",
      });
    }

    // Validate request body
    const parsed = validateBody(imageAdjustSchema, req.body);
    const { prompt, gender, ageRange, ethnicity, bodyType, clothingStyle, pose, baseImage } = parsed;

    // Optional: groupId for linking related generations
    const groupId = typeof req.body.groupId === "string" && req.body.groupId.length > 0 ? req.body.groupId : null;

    // Optional: baseImageId reference to the image being adjusted
    const baseImageId = typeof req.body.baseImageId === "string" && req.body.baseImageId.length > 0 ? req.body.baseImageId : null;

    // The userPrompt is the chat message from the user
    const userPrompt = typeof req.body.userPrompt === "string" ? req.body.userPrompt : "";

    const hasBaseImage = typeof baseImage === "string" && baseImage.length > 0;

    if (!hasBaseImage) {
      return res.status(400).json({
        message: "Base image is required for adjustment",
      });
    }

    const preservationRules = `
STRICT IMAGE PRESERVATION RULES — YOU MUST FOLLOW THESE:
- This is an ADJUSTMENT to an existing generated image. Preserve the model's identity, facial features, skin tone, and body proportions.
- Preserve the garment/outfit EXACTLY as it appears in the base image — do NOT change its color, style, pattern, or design.
- Only apply the specific change requested by the user. Do NOT add any extra elements, accessories, or modifications not requested.
- If the user asks to change the pose, only change the pose — keep everything else the same.
- If the user asks to change the background, only change the background — keep the model and garment the same.
- If the user asks to add an accessory, only add that specific accessory — do not add any others.
- Do NOT change the garment's neckline, sleeve length, hemline, fit, or silhouette.
- The result should look like the same model in the same outfit, with only the requested adjustment applied.`;

    const finalPrompt = `
Adjust this AI-generated fashion model image for a virtual try-on fashion app.

Model details:
- Gender: ${gender}
- Age range: ${ageRange}
- Ethnicity: ${ethnicity}
- Body type: ${bodyType}
- Clothing style: ${clothingStyle}
- Pose: ${pose}

User's adjustment request:
${userPrompt || prompt}

${preservationRules}

Style:
Photorealistic, professional studio lighting, full body visible, clean background, fashion e-commerce quality, high detail.
`;

    const openai = new OpenAI({ apiKey });

    // Build the array of image files for the edit API
    const imageFiles: any[] = [];

    // Add base image (the current image to adjust)
    let baseBuffer: Buffer;
    if (baseImage.startsWith("http")) {
      const response = await fetch(baseImage);
      const arrayBuffer = await response.arrayBuffer();
      baseBuffer = Buffer.from(arrayBuffer);
    } else {
      const baseBase64Raw = baseImage.replace(/^data:[^;]+;base64,/, "");
      baseBuffer = Buffer.from(baseBase64Raw, "base64");
    }
    const baseFile = await toFile(baseBuffer, "current_image.png", {
      type: "image/png",
    });
    imageFiles.push(baseFile);

    // Use openai.images.edit() with the current image as input
    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFiles,
      prompt: finalPrompt,
      size: "1024x1536",
      quality: "high",
    });

    const imageBase64 = result.data?.[0]?.b64_json;

    if (!imageBase64) {
      return res.status(500).json({
        message: "No image returned from OpenAI",
      });
    }

    const method = "AI Adjustment";

    // Store in MongoDB
    const saved = await Generation.create({
      userId: undefined,
      title: `Adjusted ${gender} ${ethnicity} Model`,
      method,
      imageBase64,
      mimeType: "image/png",
      prompt: finalPrompt,
      direction: "front",
      groupId,
      baseImageId: baseImageId || null,
      userPrompt: userPrompt,
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
      direction: "front",
      groupId,
      baseImageId: baseImageId || null,
      userPrompt: userPrompt,
    });
  } catch (error: any) {
    console.error("OpenAI image adjustment error:", error);

    const status = error?.status || 500;
    const message = error?.message || "OpenAI image adjustment failed";

    return res.status(status).json({ message });
  }
});

// ─── POST /save — Save a generation result to the database ───
router.post("/save", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, method, imageBase64, mimeType, prompt, direction, groupId, baseImageId, userPrompt } = req.body;

    if (!imageBase64 || typeof imageBase64 !== "string" || imageBase64.length < 100) {
      return res.status(400).json({
        message: "Valid imageBase64 data is required (minimum 100 characters).",
      });
    }

    const rawBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");

    const saved = await Generation.create({
      userId: req.userId,
      title: title || "Saved Generation",
      method: method || "Manual Save",
      imageBase64: rawBase64,
      mimeType: mimeType || "image/png",
      prompt: prompt || "",
      direction: direction === "front" ? "front" : null,
      groupId: typeof groupId === "string" && groupId.length > 0 ? groupId : null,
      baseImageId: baseImageId || null,
      userPrompt: userPrompt || "",
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
      baseImageId: saved.baseImageId,
      userPrompt: saved.userPrompt,
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
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      Generation.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .select("_id title method mimeType createdAt direction groupId prompt baseImageId userPrompt")
        .skip(skip)
        .limit(limit),
      Generation.countDocuments({ userId: req.userId }),
    ]);

    const historyWithUrls = history.map((item) => ({
      _id: item._id,
      title: item.title,
      method: item.method,
      mimeType: item.mimeType,
      imageUrl: buildImageUrl(req, item._id.toString()),
      direction: item.direction,
      groupId: item.groupId,
      prompt: item.prompt,
      baseImageId: item.baseImageId,
      userPrompt: item.userPrompt,
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
