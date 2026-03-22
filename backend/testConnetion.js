import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully");
    
    // Close connection after test
    mongoose.connection.close();
  } catch (error) {
    console.log("❌ Connection failed:");
    console.log(error.message);
  }
}

connectDB();