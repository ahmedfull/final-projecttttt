const CategoryModel = require('../model/CatogaryModel');
const jwt = require('jsonwebtoken');


exports.getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { Categoryname } = req.body;
    const newCategory = await CategoryModel.create({ Categoryname });
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { Categoryname } = req.body;
    const newCategory = await CategoryModel.create({ Categoryname });
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: "Authentication token required"
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
exports.createCategory = async (req, res) => {
  try {
    const { Categoryname } = req.body;
    
    if (!Categoryname?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const existingCategory = await CategoryModel.findOne({ 
      Categoryname: new RegExp(`^${Categoryname}$`, 'i') 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }

    const newCategory = await CategoryModel.create({ Categoryname });
    
    res.status(201).json({
      success: true,
      data: newCategory,
      message: "Category created successfully"
    });

  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : "Server error"
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find()
      .sort({ Categoryname: 1 })
      .select('_id Categoryname');

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });
  }
};

// Middleware export for route protection
exports.authenticate = authenticate;