import { Router } from "express";
import {
  createProduct,
  getAllCustomers,
  getAllOrders,
  getAllProducts,
  getDashboardStats,
  updatedOrderStatus,
  updateProduct,
} from "../controllers/admin.controller.js";
import { adminOnly, protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// authomatically adds both middleware before each route below.
router.use(protectRoute, adminOnly);

// product routes
router.post("/products", upload.array("images", 3), createProduct);
router.get("/products", getAllProducts);
router.put("/products/:id", upload.array("images", 3), updateProduct);

// order routes
router.get("/orders", getAllOrders);
router.patch("/orders/:orderId/status", updatedOrderStatus);

// customer routes
router.get("/customers", getAllCustomers);
router.get("/stats", getDashboardStats);

export default router;
