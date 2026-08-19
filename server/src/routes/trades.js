import { Router } from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Trade from "../models/Trade.js";
import { getQuote } from "../services/market.js";

const router = Router();

/* =========================================================
   CALCULATE BROKERAGE + OTHER CHARGES
   Simulated realistic brokerage for paper trading
========================================================= */

function calculateCharges(total, side) {

  // Brokerage: 0.03% of order value, maximum ₹20
  const brokerage = Math.min(
    total * 0.0003,
    20
  );

  // Simulated transaction charge
  const transactionCharge =
    total * 0.0000325;

  // SEBI charge
  const sebiCharge =
    total * 0.000001;

  // STT - simulated equity delivery charge
  const stt =
    total * 0.001;

  // Stamp duty only on BUY
  const stampDuty =
    side === "BUY"
      ? total * 0.00015
      : 0;

  // GST on brokerage + transaction charge
  const gst =
    (brokerage + transactionCharge) * 0.18;

  // All charges except brokerage
  const charges =
    stt +
    stampDuty +
    transactionCharge +
    sebiCharge +
    gst;

  return {
    brokerage: Number(brokerage.toFixed(2)),
    charges: Number(charges.toFixed(2))
  };
}


/* =========================================================
   PLACE TRADE
========================================================= */

router.post("/", auth, async (req, res) => {

  try {

    const {
      symbol,
      side,
      quantity
    } = req.body;


    const stock =
      await getQuote(symbol);


    const qty =
      Number(quantity);


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !stock ||
      !["BUY", "SELL"].includes(side) ||
      !Number.isInteger(qty) ||
      qty <= 0
    ) {

      return res.status(400).json({
        message: "Invalid order"
      });

    }


    if (!stock?.price) {

      return res.status(503).json({
        message:
          "Market price is unavailable. Configure an allowed market-data provider first."
      });

    }


    const user =
      await User.findById(req.userId);


    if (!user) {

      return res.status(404).json({
        message: "User not found"
      });

    }


    /* =====================================================
       STOCK VALUE
    ===================================================== */

    const total =
      Number(
        (Number(stock.price) * qty).toFixed(2)
      );


    /* =====================================================
       CALCULATE BROKERAGE + CHARGES
    ===================================================== */

    const {
      brokerage,
      charges
    } =
      calculateCharges(
        total,
        side
      );


    /*
      BUY:
      Stock value + charges = money deducted

      SELL:
      Stock value - charges = money received
    */

    const finalTotal =
      side === "BUY"
        ? Number(
          (
            total +
            brokerage +
            charges
          ).toFixed(2)
        )
        : Number(
          (
            total -
            brokerage -
            charges
          ).toFixed(2)
        );


    /* =====================================================
       CHECK OWNED SHARES
    ===================================================== */

    const ownedTrades =
      await Trade.find({
        user: user._id,
        symbol: stock.symbol
      });


    const owned =
      ownedTrades.reduce(
        (sum, t) =>
          sum +
          (
            t.side === "BUY"
              ? t.quantity
              : -t.quantity
          ),
        0
      );


    /* =====================================================
       BUY - CHECK CASH
    ===================================================== */

    if (
      side === "BUY" &&
      finalTotal > user.cash
    ) {

      return res.status(400).json({
        message:
          `Insufficient virtual cash. Required ₹${finalTotal.toFixed(2)}`
      });

    }


    /* =====================================================
       SELL - CHECK HOLDINGS
    ===================================================== */

    if (
      side === "SELL" &&
      qty > owned
    ) {

      return res.status(400).json({
        message:
          `You only own ${owned} shares`
      });

    }


    /* =====================================================
       UPDATE USER CASH
    ===================================================== */

    if (side === "BUY") {

      user.cash =
        Number(
          (
            user.cash -
            finalTotal
          ).toFixed(2)
        );

    } else {

      user.cash =
        Number(
          (
            user.cash +
            finalTotal
          ).toFixed(2)
        );

    }


    await user.save();


    /* =====================================================
       SAVE TRADE
    ===================================================== */

    const trade =
      await Trade.create({

        user:
          user._id,

        symbol:
          stock.symbol,

        side,

        quantity:
          qty,

        price:
          Number(stock.price),

        total,

        brokerage,

        charges,

        finalTotal

      });


    /* =====================================================
       RESPONSE
    ===================================================== */

    res.status(201).json({

      message:
        `${side} order executed successfully`,

      trade,

      cash:
        user.cash

    });


  } catch (e) {

    console.error(
      "TRADE ERROR:",
      e
    );

    res.status(500).json({
      message: "Trade failed"
    });

  }

});


/* =========================================================
   GET ORDER HISTORY
========================================================= */

router.get("/", auth, async (req, res) => {

  try {

    const trades =
      await Trade.find({
        user: req.userId
      })
        .sort({
          createdAt: -1
        });


    res.json(trades);

  } catch (e) {

    console.error(
      "ORDERS ERROR:",
      e
    );

    res.status(500).json({
      message: "Failed to load orders"
    });

  }

});


export default router;