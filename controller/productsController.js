const Product = require('../model/ProductModel');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose')
exports.addProduct = async (req, res) => {
    try {
        const { name, description, price, CategoryID, stock } = req.body;
        
        // Convert to numbers
        const priceNum = parseFloat(price);
        // const stockNum = parseInt(stock);
        
        if (isNaN(priceNum)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid price value" 
            });
        }
        
        // if (isNaN(stockNum)) {
        //     return res.status(400).json({ 
        //         success: false, 
        //         error: "Invalid stock value" 
        //     });
        // }
        
        const imagePath = req.file ? req.file.filename : null;
        
        if (!imagePath) {
            return res.status(400).json({ 
                success: false, 
                error: "Image is required" 
            });
        }
        
        // Validate CategoryID
        if (!mongoose.Types.ObjectId.isValid(CategoryID)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid category ID" 
            });
        }
        
        const newProduct = new Product({
            name,
            description,
            price: priceNum,
            image: imagePath,
            CategoryID,
            stock
        });
        
        await newProduct.save();
        res.status(201).json({ 
            success: true, 
            data: newProduct,
            message: "Product added successfully"
        });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Get all products with populated category names
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'CategoryID',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          categoryName: {
            $ifNull: [
              { $arrayElemAt: ['$category.Categoryname', 0] },
              'Uncategorized'
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
          stock: 1,
          CategoryID: 1,
          categoryName: 1
        }
      }
    ]);

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message
    });
  }
};
// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('CategoryID');

    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message
    });
  }
};