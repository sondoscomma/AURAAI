import mongoose from "mongoose";

const generationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Keep false so try-on works for both auth and non-auth scenarios
    },
    title: String,
    method: String,
    imageBase64: String,
    mimeType: {
      type: String,
      default: "image/png",
    },
    prompt: String,
    // Direction of the generated view (e.g. "front" or "right")
    direction: {
      type: String,
      enum: ["front", "right", null],
      default: null,
    },
    // Group ID links multiple views of the same generation session together
    // (e.g. front + right views from the same try-on)
    groupId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster history queries by userId
generationSchema.index({ userId: 1, createdAt: -1 });
// Index for finding all views in a generation group
generationSchema.index({ groupId: 1 });

export default mongoose.model("Generation", generationSchema);
