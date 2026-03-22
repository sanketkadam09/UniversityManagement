const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['university_admin', 'college_admin', 'student'],
    required: true,
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
  },
  facultyInfo: {
    employeeId: {
      type: String,
      sparse: true,
    },
    department: String,
    specialization: String,
    phone: String,
  },
  studentInfo: {
    rollNumber: {
      type: String,
      sparse: true,
    },
    department: String,
    semester: Number,
    year: Number,
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
}, {
  timestamps: true,
});

// ======================
// 🔥 HASH PASSWORD BEFORE SAVE
// ======================
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ======================
// 🔥 COMPARE PASSWORD METHOD
// ======================
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ collegeId: 1 });

module.exports = mongoose.model('User', userSchema);