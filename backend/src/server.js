import express from "express";
// import path from "path";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { serve } from "inngest/express";

import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";

import { functions, inngest } from "./config/inngest.js";

const app = express();
// credentials: true allows the browser to send the cookies to the server with the request
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

// const __dirname = path.resolve();

app.use(express.json());

app.use(clerkMiddleware()); // add auth object under the request so we can say req.auth

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

app.get("/", (req, res) => res.status(200).json({ message: "Success" }));

// make app ready for deployment
// if (ENV.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../admin/dist")));

//   app.get("/{*any}", (req, res) => {
//     res.sendFile(path.join(__dirname, "../admin", "dist", "index.html"));
//   });
// }

const startServer = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log("Server is up and running");
  });
};

startServer();
