export const stocks = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 0, change: 0, exchange: "NSE" },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 0, change: 0, exchange: "NSE" },
  { symbol: "INFY", name: "Infosys", price: 0, change: 0, exchange: "NSE" },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 0, change: 0, exchange: "NSE" },
  { symbol: "ICICIBANK", name: "ICICI Bank", price: 0, change: 0, exchange: "NSE" },
  { symbol: "SBIN", name: "State Bank of India", price: 0, change: 0, exchange: "NSE" },
  { symbol: "ITC", name: "ITC", price: 0, change: 0, exchange: "NSE" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", price: 0, change: 0, exchange: "NSE" }
];

export function getStock(symbol) {
  return stocks.find(s => s.symbol === symbol.toUpperCase());
}
