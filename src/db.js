const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load .env file if present
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/realtime-chat";

async function connectDb() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

module.exports = { connectDb };
