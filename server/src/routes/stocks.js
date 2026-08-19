import { Router } from "express";
import { stocks, getStock } from "../data/stocks.js";
import { getQuote, getHistory } from "../services/market.js";

const router = Router();

router.get("/", async (req, res) => {
  const q = (req.query.search || "").toLowerCase();
  const list = q ? stocks.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) : stocks;
  const result = await Promise.all(list.map(s => getQuote(s.symbol)));
  res.json(result);
});

router.get("/:symbol", async (req, res) => {
  const stock = getStock(req.params.symbol);
  if (!stock) return res.status(404).json({ message: "Stock not found" });
  const quote = await getQuote(stock.symbol);
  const history = await getHistory(stock.symbol);
  res.json({ ...quote, history });
});

export default router;
