import mongoose from "mongoose";

const generationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    method: String,
    imageBase64: String,
    mimeType: {
      type: String,
      default: "image/png",
    },
    prompt: String,
  },
  { timestamps: true }
);

export default mongoose.model("Generation", generationSchema);