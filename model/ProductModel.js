const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    CategoryID: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: String, required: true, default: "متوفر" } 
});

module.exports = mongoose.model('Product', ProductSchema);