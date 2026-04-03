import mongoose from "mongoose";
import { Checkout } from "../models/checkout.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";

export async function createCheckout(req, res) {
  // I removed totaPrice from req.body because total price should be calculated on the server side to prevent client manipulation.
  const { cartItems, shippingAddress, paymentMethod } = req.body;

  if (!cartItems || cartItems.length == 0) {
    return res.status(400).json({ message: "No items in checkout" });
  }

  try {
    // validate products and stock
    for (const item of cartItems) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for ${product.name}` });
      }
    }

    // Calculate total from server-side (don't trust client - ever.)
    let subtotal = 0;
    const checkoutItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product ${item.product.name} not found` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for ${product.name}` });
      }

      subtotal += product.price * item.quantity;
      checkoutItems.push({
        product: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0],
      });
    }

    const shipping = 10.0; // $10
    const tax = subtotal * 0.08; // 8%
    const totalPrice = (subtotal + shipping + tax) * 1381; // convert to dollars

    if (totalPrice <= 0) {
      return res.status(400).json({ error: "Invalid order total" });
    }

    // Create a new checkout session
    const newCheckout = await Checkout.create({
      user: req.user._id,
      clerkId: req.user.clerkId,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });

    res.status(201).json({ newCheckout });
  } catch (error) {
    console.error("Error creating checkout session", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function updateCheckout(req, res) {
  const { paymentStatus, paymentDetails } = req.body;

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid checkout ID format" });
    }

    const checkout = await Checkout.findById(id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    if (paymentStatus === "paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();
      await checkout.save();

      res.status(200).json({ checkout });
    } else {
      res.status(400).json({ message: "Invalid Payment Status" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function finalizeCheckout(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid checkout ID format" });
    }
    const checkout = await Checkout.findById(id);
    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }
    if (checkout.isPaid && !checkout.isFinalized) {
      // Create final order based on the checkout details
      const finalOrder = await Order.create({
        user: checkout.user,
        clerkId: checkout.clerkId,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        totalPrice: checkout.totalPrice,
        paymentResult: "Successful",
      });
      // update product stock
      for (const item of checkout.checkoutItems) {
        await Product.findByIdAndUpdate(item.product, {
          // item.product is already a string because we stored it as string in checkoutItems
          $inc: { stock: -item.quantity },
        });
      }
      // Mark the checkout as finalized to prevent duplicate orders
      checkout.isFinalized = true;
      checkout.finalizeAt = Date.now();
      await checkout.save();

      // Delete the cart associated with the user
      // await Cart.findOneAndDelete({ user: checkout.clerkId });
      res.status(201).json({ finalOrder });
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout already finalized" });
    } else {
      res.status(400).json({ message: "Checkout is not paid" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}
