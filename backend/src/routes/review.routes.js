import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createReview,
  deleteReview,
} from "../controllers/review.controller.js";

const router = Router();

router.post("/", protectRoute, createReview);

// this function is not implemented in the mobile app in the frontend
router.delete("/:reviewId", protectRoute, deleteReview);

export default router;
