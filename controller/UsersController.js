const User = require("../model/UserModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT secret missing');
 
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "Credentials required", state: 0 });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) return res.status(401).json({ msg: "Invalid credentials", state: 0 });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ msg: "Invalid credentials", state: 0 });

    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        username: user.username 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      msg: "Login successful", 
      state: 1, 
      token,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: error.message, state: 0 });
  }
};

exports.signup = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;

    if (!username || !password || !email || !phone) {
      return res.status(400).json({ msg: "All fields required", state: 0 });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(409).json({ msg: "User exists", state: 0 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword, email, phone });
    const userData = newUser.toObject();
    delete userData.password;

    res.status(201).json({ msg: "User created", state: 1, data: userData });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ msg: error.message, state: 0 });
  }
};

exports.validateUpdate = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ msg: "Invalid email format", state: 0 });
    }
    
    if (phone && !/^[0-9]{10,15}$/.test(phone)) {
      return res.status(400).json({ msg: "Phone must be 10-15 digits", state: 0 });
    }
    
    next();
  } catch (error) {
    console.error('Validate Update Error:', error);
    res.status(500).json({ msg: error.message, state: 0 });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found", state: 0 });
    }

    res.json({ msg: "User updated successfully", state: 1, data: updatedUser });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ msg: error.message, state: 0 });
  }
};