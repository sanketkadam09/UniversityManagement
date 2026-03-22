const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ================= GENERATE TOKEN =================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  try {
    let {
      name,
      email,
      password,
      role,
      collegeId,
      studentInfo,
      facultyInfo
    } = req.body;

    // 🔍 Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    email = email.toLowerCase().trim();

    // 🔍 Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // ✅ Create user (password auto hashed via model)
    const user = await User.create({
      name,
      email,
      password,
      role,
      collegeId,
      studentInfo,
      facultyInfo,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });

  } catch (error) {
    console.error('❌ Register error:', error.message);

    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
});


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    // 🔍 Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    email = email.toLowerCase().trim();

    console.log(`📌 Login attempt: ${email}`);

    // 🔍 Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 🔐 Compare password (bcrypt)
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log('❌ Wrong password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    console.log('✅ Login successful');

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
        studentInfo: user.studentInfo,
        facultyInfo: user.facultyInfo,
        token,
      },
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);

    res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
});


// ================= GET CURRENT USER =================
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('collegeId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error('❌ Get user error:', error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;