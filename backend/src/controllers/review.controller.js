import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";

export async function createReview(req, res) {
  try {
    const { productId, orderId, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const user = req.user;

    // verify order exists and is delivered.
    // This is becuase you can only add review if order is delivered.
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // check if user made the order
    if (order.clerkId !== user.clerkId) {
      return res
        .status(403)
        .json({ message: "Not authorized to review this order" });
    }

    // check if order is delivered
    if (order.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Can only review delivered orders" });
    }

    // verify product is in the order
    const productInOrder = order.orderItems.find(
      (item) => item.product.toString() === productId.toString(),
    );
    if (!productInOrder) {
      return res
        .status(400)
        .json({ message: "Product not found in this order" });
    }

    // check if review already exists
    const existingReview = await Review.findOne({
      productId,
      userId: user._id,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      productId,
      userId: user._id,
      orderId,
      rating,
    });

    // update the product rating
    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const updateProduct = await Product.findByIdAndUpdate(
      productId,
      {
        averageRating: totalRating / reviews.length,
        totalReviews: reviews.length,
      },
      { new: true, runValidators: true },
    );

    if (!updateProduct) {
      await Review.findByIdAndDelete(review._id);
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    console.error("Error reviewing product", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteReview(req, res) {
  try {
    const { reviewId } = req.params;

    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID format" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(reviewId);

    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    await Product.findByIdAndUpdate(productId, {
      avaerageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
      totalReviews: reviews.length,
    });

    res.status(200).json({ message: "Reviews deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
