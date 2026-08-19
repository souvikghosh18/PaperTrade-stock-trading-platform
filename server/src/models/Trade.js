import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true
    },

    side: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    // Stock value before charges
    total: {
      type: Number,
      required: true,
      min: 0
    },

    // Brokerage charged by broker
    brokerage: {
      type: Number,
      default: 0,
      min: 0
    },

    // Other applicable charges
    charges: {
      type: Number,
      default: 0,
      min: 0
    },

    // Final amount including brokerage + charges
    finalTotal: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Trade", tradeSchema);