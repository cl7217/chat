const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String },
  picture: { type: String },
  createdAt: { type: Date, default: Date.now }
})

// make username unique if desired
userSchema.index({ username: 1 }, { unique: true, sparse: true })

module.exports = mongoose.model('User', userSchema)
