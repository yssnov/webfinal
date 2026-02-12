// ==========================================
// CHINGIZ: User Model
// ==========================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema definition
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'premium'],
      default: 'user',
    },
    // User preferences for notifications and settings
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
      language: {
        type: String,
        default: 'en',
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Hash password before saving user
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
