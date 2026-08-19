import { Router } from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Trade from "../models/Trade.js";
import { getQuote } from "../services/market.js";

const router = Router();

/* =========================================================
   GET PORTFOLIO
   Calculates portfolio using CURRENT stock prices
========================================================= */

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const trades = await Trade.find({
      user: user._id
    }).sort({
      createdAt: 1
    });

    /*
      Build holdings from all BUY / SELL trades
    */

    const map = {};

    for (const t of trades) {

      if (!map[t.symbol]) {
        map[t.symbol] = {
          symbol: t.symbol,
          quantity: 0,
          invested: 0
        };
      }

      if (t.side === "BUY") {

        map[t.symbol].quantity += Number(
          t.quantity
        );

        map[t.symbol].invested += Number(
          t.total
        );

      } else if (t.side === "SELL") {

        map[t.symbol].quantity -= Number(
          t.quantity
        );

        map[t.symbol].invested -= Number(
          t.total
        );
      }
    }

    /*
      Remove holdings where quantity is 0
      or negative.
    */

    const activeHoldings = Object.values(map)
      .filter(
        x => x.quantity > 0
      );

    /*
      Get CURRENT market price
      for every holding.
    */

    const holdings = await Promise.all(

      activeHoldings.map(async (x) => {

        const stock = await getQuote(
          x.symbol
        );

        if (!stock) {
          return {
            ...x,
            name: x.symbol,
            price: 0,
            avgCost: 0,
            marketValue: 0,
            pnl: 0
          };
        }

        /*
          CURRENT MARKET VALUE

          Current stock price × quantity
        */

        const marketValue =
          Number(stock.price) *
          Number(x.quantity);

        /*
          AVERAGE BUY COST
        */

        const avgCost =
          Number(x.invested) /
          Number(x.quantity);

        /*
          CURRENT UNREALIZED P&L

          Current market value - invested amount
        */

        const pnl =
          marketValue -
          Number(x.invested);

        return {

          symbol: x.symbol,

          quantity: x.quantity,

          invested: Number(
            x.invested.toFixed(2)
          ),

          name: stock.name,

          price: Number(
            stock.price
          ),

          avgCost: Number(
            avgCost.toFixed(2)
          ),

          marketValue: Number(
            marketValue.toFixed(2)
          ),

          pnl: Number(
            pnl.toFixed(2)
          )

        };
      })
    );

    /*
      TOTAL INVESTED
    */

    const invested =
      holdings.reduce(
        (sum, h) =>
          sum + Number(h.invested),
        0
      );

    /*
      TOTAL CURRENT MARKET VALUE
    */

    const marketValue =
      holdings.reduce(
        (sum, h) =>
          sum + Number(h.marketValue),
        0
      );

    /*
      TOTAL PORTFOLIO VALUE

      Cash + current market value
    */

    const totalValue =
      Number(user.cash) +
      marketValue;

    /*
      TOTAL CURRENT UNREALIZED P&L
    */

    const pnl =
      marketValue -
      invested;

    /*
      RESPONSE
    */

    res.json({

      cash: Number(
        user.cash.toFixed(2)
      ),

      holdings,

      invested: Number(
        invested.toFixed(2)
      ),

      marketValue: Number(
        marketValue.toFixed(2)
      ),

      totalValue: Number(
        totalValue.toFixed(2)
      ),

      pnl: Number(
        pnl.toFixed(2)
      )

    });

  } catch (error) {

    console.error(
      "PORTFOLIO ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load portfolio"
    });
  }
});


/* =========================================================
   ADD / REMOVE WATCHLIST
========================================================= */

router.post(
  "/watchlist/:symbol",
  auth,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.userId
        );

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      const symbol =
        req.params.symbol.toUpperCase();

      if (
        user.watchlist.includes(
          symbol
        )
      ) {

        user.watchlist =
          user.watchlist.filter(
            x => x !== symbol
          );

      } else {

        user.watchlist = [
          ...user.watchlist,
          symbol
        ];

      }

      await user.save();

      res.json(
        user.watchlist
      );

    } catch (error) {

      console.error(
        "WATCHLIST UPDATE ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Watchlist update failed"
      });
    }
  }
);


/* =========================================================
   GET WATCHLIST
========================================================= */

router.get(
  "/watchlist",
  auth,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.userId
        );

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      res.json(
        user.watchlist
      );

    } catch (error) {

      console.error(
        "WATCHLIST ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load watchlist"
      });
    }
  }
);


export default router;