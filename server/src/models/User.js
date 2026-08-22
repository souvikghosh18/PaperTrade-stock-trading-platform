import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  cash: { type: Number, default: 100000 },
  watchlist: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);
