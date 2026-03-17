const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  body: { type: String, required: true },
  timestamp: { type: Date, default: () => new Date() },
});

module.exports = mongoose.model("Message", messageSchema);
