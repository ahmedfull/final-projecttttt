const Cart = require('../model/CartModel');

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');
        res.status(200).json({
            state: 1,
            data: cart?.items || [],
            msg: cart ? "Cart found" : "Cart empty"
        });
    } catch (error) {
        res.status(500).json({ state: 0, msg: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        let cart = await Cart.findOne({ userId }) || new Cart({ userId, items: [] });
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }
        await cart.save();
        res.status(200).json({ state: 1, data: cart.items, msg: "Item added" });
    } catch (error) {
        res.status(500).json({ state: 0, msg: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        const cart = await Cart.findOneAndUpdate(
            { userId, "items.productId": productId },
            { $set: { "items.$.quantity": quantity } },
            { new: true }
        ).populate('items.productId');
        if (!cart) return res.status(404).json({ state: 0, msg: "Item not found" });
        res.status(200).json({ state: 1, data: cart.items, msg: "Item updated" });
    } catch (error) {
        res.status(500).json({ state: 0, msg: error.message });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const cart = await Cart.findOneAndUpdate(
            { userId },
            { $pull: { items: { productId } } },
            { new: true }
        ).populate('items.productId');
        res.status(200).json({ state: 1, data: cart?.items || [], msg: "Item removed" });
    } catch (error) {
        res.status(500).json({ state: 0, msg: error.message });
    }
};
exports.sendCartEmail = async (req, res) => {
  try {
    const { imageData, cartItems, total, email: optionalEmail } = req.body;
    
    // Get email from either:
    // 1. The optional email provided in the request
    // 2. The authenticated user's email (from JWT)
    const userEmail = optionalEmail || req.user.email;
    
    if (!userEmail) {
      return res.status(400).json({
        state: 0,
        msg: "Email address is required"
      });
    }
} catch {
    console.log(err)
}}