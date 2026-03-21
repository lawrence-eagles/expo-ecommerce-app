import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createOrder(req, res) {
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Suggested method to compute total from the server-side because getting total from the client side via req.body is not recommended since client can manipulate total.
    // const { orderItems, shippingAddress, paymentResult } = req.body;
    // let totalPrice = 0;
    // for (const item of orderItems) {
    //   const product = await Product.findById(item.product._id).select("price");
    //   if (!product) {
    //     return res.status(404).json({ message: `product ${item.name} not found` });
    //   }
    //   totalPrice += product.price * item.quantity;
    // }

    // validate products and stock
    for (const item of orderItems) {
      // suggested method to validate order items shapte before dereferencing nested fields.
      //   if (
      //     !item?.product?._id ||
      //     !Number.isFinite(item.quantity) ||
      //     item.quantity <= 0
      //   ) {
      //     return res.status(400).json({ message: "Invalid order item payload" });
      //   }
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res
          .status(404)
          .json({ message: `product ${item.name} not found` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }
    }

    const order = await Order.create({
      user: user._id,
      clerkId: user.clerkId,
      orderItems,
      shippingAddress,
      paymentResult,
      totalPrice,
    });

    // update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error creating order", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ clerkId: req.user.clerkId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    // check if each order has been reviewed
    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        const review = await Review.findOne({ orderId: order._id });
        return {
          ...order.toObject(),
          hasReviewed: !!review,
        };
      }),
    );

    res.status(200).json({ orders: ordersWithReviewStatus });
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
