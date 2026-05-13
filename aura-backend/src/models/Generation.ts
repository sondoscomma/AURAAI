import mongoose from "mongoose";

const generationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Keep false so generation works for both auth and non-auth scenarios
    },
    title: String,
    method: String,
    imageBase64: String,
    mimeType: {
      type: String,
      default: "image/png",
    },
    prompt: String,
    // Direction of the generated view — only "front" is supported now
    // (multi-view generation has been simplified to front-only)
    direction: {
      type: String,
      enum: ["front", null],
      default: "front",
    },
    // Group ID links related generations together
    // (e.g. the original AI model generation and the subsequent garment try-on)
    groupId: {
      type: String,
      default: null,
    },
    // Reference to a previously generated model image ID.
    // Used when this generation is a "generate-with-garment" that builds
    // on top of an earlier front-view model generation.
    baseImageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Generation",
      default: null,
    },
    // The custom prompt provided by the user for the garment try-on.
    // This is separate from the full `prompt` field which contains the
    // entire system prompt sent to OpenAI.
    userPrompt: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for faster history queries by userId
generationSchema.index({ userId: 1, createdAt: -1 });
// Index for finding all generations in a group
generationSchema.index({ groupId: 1 });
// Index for finding generations that reference a specific base image
generationSchema.index({ baseImageId: 1 });

export default mongoose.model("Generation", generationSchema);
