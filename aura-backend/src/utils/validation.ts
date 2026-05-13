/**
 * Input validation schemas using Zod.
 * Centralized here so all routes use the same validation logic.
 */
import { z } from "zod";

/** Signup request validation */
export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be at most 128 characters"),
});

/** Login request validation */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

/** Model generation request validation (no garment — garment is on the result page) */
export const modelGenerateSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(4000, "Prompt too long"),
  gender: z.enum(["Female", "Male"], { message: "Gender is required" }),
  ageRange: z.string().min(1, "Age range is required"),
  ethnicity: z.string().min(1, "Ethnicity is required"),
  bodyType: z.string().min(1, "Body type is required"),
  clothingStyle: z.string().min(1, "Clothing style is required"),
  pose: z.string().min(1, "Pose is required"),
});

/** Model generation with garment request validation */
export const modelGenerateWithGarmentSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(4000, "Prompt too long"),
  gender: z.enum(["Female", "Male"], { message: "Gender is required" }),
  ageRange: z.string().min(1, "Age range is required"),
  ethnicity: z.string().min(1, "Ethnicity is required"),
  bodyType: z.string().min(1, "Body type is required"),
  clothingStyle: z.string().min(1, "Clothing style is required"),
  pose: z.string().min(1, "Pose is required"),
  garmentImage: z.string().min(1, "Garment image is required"), // base64 data URL, required
  baseImage: z.string().optional(), // base64 data URL or HTTP URL of previously generated model, optional
  baseImageId: z.string().optional(), // MongoDB ObjectId of the previously generated model, optional
  userPrompt: z.string().max(4000, "User prompt too long").optional(), // custom prompt from the result page
});

/** Image adjustment request validation (for chat-based refinement) */
export const imageAdjustSchema = z.object({
  prompt: z.string().min(1, "Adjustment prompt is required").max(4000, "Prompt too long"),
  gender: z.enum(["Female", "Male"], { message: "Gender is required" }),
  ageRange: z.string().min(1, "Age range is required"),
  ethnicity: z.string().min(1, "Ethnicity is required"),
  bodyType: z.string().min(1, "Body type is required"),
  clothingStyle: z.string().min(1, "Clothing style is required"),
  pose: z.string().min(1, "Pose is required"),
  baseImage: z.string().min(1, "Base image is required for adjustment"), // the current image to adjust
  baseImageId: z.string().optional(), // MongoDB ObjectId of the image being adjusted
  userPrompt: z.string().max(4000, "User prompt too long").optional(), // the user's chat message
});

/** Try-on generation request validation (prompt is optional) */
export const tryonPromptSchema = z.object({
  prompt: z.string().max(4000, "Prompt too long").optional(),
});

/** Helper: validate request body against a Zod schema.
 *  Returns parsed data or throws a formatted error. */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw Object.assign(new Error(firstError?.message || "Validation failed"), {
      status: 400,
    });
  }
  return result.data;
}