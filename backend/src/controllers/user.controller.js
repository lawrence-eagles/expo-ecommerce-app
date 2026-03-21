import { User } from "../models/user.model.js";

// address controllers
export async function addAddress(req, res) {
  try {
    const {
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault,
    } = req.body;

    const user = req.user;

    if (!fullName || !streetAddress || !city || !state || !zipCode) {
      return res.status(400).json({ error: "Missing required address fields" });
    }

    // if the incoming address is set as default i.e it's isDefault value is true
    // then set the isDefault value in all other addresses to false

    if (isDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault: isDefault || false,
    });

    await user.save();
    res
      .status(201)
      .json({ message: "Address added successfully", address: user.addresses });
  } catch (error) {
    console.error("Error in adding user address", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAddresses(req, res) {
  try {
    const user = req.user;
    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    console.error("Error fetching user addresses", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateAddress(req, res) {
  try {
    const {
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault,
    } = req.body;

    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ message: "Invalid address ID format" });
    }

    const user = req.user;

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (isDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    address.label = label || address.label;
    address.fullName = fullName || address.fullName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();

    res.status(200).json({
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error updating user address", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteAddress(req, res) {
  try {
    const { addressId } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ message: "Invalid address ID format" });
    }

    user.addresses.pull(addressId);
    await user.save();

    res.status(200).json({
      message: "Address deleted successfull",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error deleting address", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// wishlist controllers
export async function addToWishlist(req, res) {
  try {
    const { productId } = req.body;
    const user = req.user;

    // check if product is already in the wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res
      .status(200)
      .json({ message: "Product added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Error adding user to wishlist", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function remoteFromWishlist(req, res) {
  try {
    const { productId } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    // check if product is already in the wishlist
    if (!user.wishlist.includes(productId)) {
      return res
        .status(400)
        .json({ message: "Product is not in the wishlist" });
    }

    // When you have an instance of a Mongoose document, you can call .pull() directly on its array fields. This modifies the local document, which must then be saved to persist changes.
    user.wishlist.pull(productId);
    await user.save();

    res.status(200).json({
      message: "Product removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error removing product from wihslist", error);
    res.stats(500).json({ message: "Internal server error" });
  }
}

export async function getWishlist(req, res) {
  try {
    // we're using populate, bc wishlist is just an array of product ids
    const user = await User.findById(req.user._id).populate("wishlist");

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error("Error fetching wishlist", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
