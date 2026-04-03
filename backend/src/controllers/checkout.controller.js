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
    // Validate cart items format and quantity
    for (const item of cartItems) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({ error: "Invalid item quantity" });
      }
    }

    // calculate subtotal
    const subTotal =
      cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ) ?? 0;

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

      checkoutItems.push({
        product: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0],
      });
    }

    // Calculate total from server-side (don't trust client - ever.)
    const shipping = 10.0; // $10
    const tax = subTotal * 0.08; // 8%
    const totalPriceInNaira = (subTotal + shipping + tax) * 1378.13; // convert to NGN using fixed exchange rate.
    const totalPrice = parseFloat(totalPriceInNaira.toFixed(2)); // round to 2 decimal places

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
      paymentStatus: "pending",
      isPaid: false,
    });

    res.status(201).json({ newCheckout });
  } catch (error) {
    console.error("Error creating checkout session", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function updateCheckout(req, res) {
  const { paymentDetails } = req.body;

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid checkout ID format" });
    }

    // const checkout = await Checkout.findById(id);
    const checkout = await Checkout.findOne({ _id: id, user: req.user._id }); // ensure user can only update their own checkout

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    if (paymentDetails.status === "success") {
      // instead of if paymentStatus === "paid", we can just check if paymentDetails is provided and valid, since paymentStatus is redundant if we have paymentDetails
      checkout.isPaid = true;
      checkout.paymentStatus = paymentDetails.status; // store the actual status from payment gateway (e.g. "success", "failed") instead of just "paid"
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
        // paymentResult: {
        //   id: checkout.paymentDetails?.reference,
        //   status: checkout.paymentStatus,
        // },
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
      checkout.finalizedAt = Date.now();
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
