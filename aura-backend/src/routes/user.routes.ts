import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { User } from "../models/User";

const router = Router();

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId).select("_id email");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ id: user._id, email: user.email });
});

export default router;