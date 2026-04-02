import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createCheckout,
  updateCheckout,
  finalizeCheckout,
} from "../controllers/checkout.controller.js";

const router = Router();

router.use(protectRoute);

router.post("/", createCheckout);
router.put("/:id/pay", updateCheckout);
router.post("/:id/finalize", finalizeCheckout);

export default router;
