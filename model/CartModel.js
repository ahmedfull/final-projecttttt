const mongoose = require('mongoose');
const CartSchema = require('../schema/Cart');

const CartModel = mongoose.model("Cart", CartSchema);
module.exports = CartModel;