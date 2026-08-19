import { getStock } from "../data/stocks.js";

/*
=========================================================
BASE STOCK DATA
=========================================================
*/

const fallback = {
  RELIANCE: {
    price: 1450.50,
    volatility: 0.0018
  },

  TCS: {
    price: 3120.75,
    volatility: 0.0015
  },

  INFY: {
    price: 1585.20,
    volatility: 0.0020
  },

  HDFCBANK: {
    price: 1745.60,
    volatility: 0.0016
  },

  ICICIBANK: {
    price: 1265.40,
    volatility: 0.0019
  },

  SBIN: {
    price: 845.30,
    volatility: 0.0025
  },

  ITC: {
    price: 415.80,
    volatility: 0.0014
  },

  BHARTIARTL: {
    price: 1895.25,
    volatility: 0.0021
  }
};


/*
=========================================================
MARKET SETTINGS
=========================================================
*/

/*
One candle represents 5 seconds.
*/

const CANDLE_INTERVAL = 5000;


/*
=========================================================
CURRENT SIMULATED PRICES
=========================================================
*/

const simulatedPrices = {};

for (const symbol of Object.keys(fallback)) {

  simulatedPrices[symbol] =
    fallback[symbol].price;

}


/*
=========================================================
CANDLE HISTORY
=========================================================
*/

const candleHistory = {};


/*
=========================================================
CURRENT ACTIVE CANDLE
=========================================================
*/

const activeCandles = {};


/*
=========================================================
INITIALIZE MARKET
=========================================================
*/

for (const symbol of Object.keys(fallback)) {

  const startingPrice =
    fallback[symbol].price;

  const volatility =
    fallback[symbol].volatility;

  candleHistory[symbol] = [];

  let previousClose =
    startingPrice;


  /*
  Create 30 historical candles
  */

  for (let i = 0; i < 30; i++) {

    const open =
      previousClose;


    const movement =
      (Math.random() - 0.5) *
      2 *
      volatility;


    const close =
      Math.max(
        1,
        open * (1 + movement)
      );


    const high =
      Math.max(open, close) *
      (
        1 +
        Math.random() *
        volatility
      );


    const low =
      Math.min(open, close) *
      (
        1 -
        Math.random() *
        volatility
      );


    const time =
      Date.now() -
      ((30 - i) * CANDLE_INTERVAL);


    candleHistory[symbol].push({

      time,

      open:
        Number(open.toFixed(2)),

      high:
        Number(high.toFixed(2)),

      low:
        Number(low.toFixed(2)),

      close:
        Number(close.toFixed(2))

    });


    previousClose =
      close;

  }


  /*
  Current simulated price
  */

  simulatedPrices[symbol] =
    Number(
      previousClose.toFixed(2)
    );


  /*
  Create the first active candle
  */

  activeCandles[symbol] = {

    time: Date.now(),

    open:
      simulatedPrices[symbol],

    high:
      simulatedPrices[symbol],

    low:
      simulatedPrices[symbol],

    close:
      simulatedPrices[symbol]

  };

}


/*
=========================================================
GENERATE PRICE MOVEMENT
=========================================================
*/

function updatePrice(symbol) {

  const config =
    fallback[symbol];


  if (!config) {

    return 100;

  }


  const currentPrice =
    simulatedPrices[symbol] ||
    config.price;


  const volatility =
    config.volatility;


  /*
  Small random movement
  */

  const movement =
    (Math.random() - 0.5) *
    2 *
    volatility;


  let newPrice =
    currentPrice *
    (1 + movement);


  /*
  Keep price positive
  */

  newPrice =
    Math.max(
      1,
      newPrice
    );


  newPrice =
    Number(
      newPrice.toFixed(2)
    );


  simulatedPrices[symbol] =
    newPrice;


  return newPrice;

}


/*
=========================================================
UPDATE ACTIVE CANDLE
=========================================================
*/

function updateActiveCandle(symbol) {

  const candle =
    activeCandles[symbol];


  if (!candle) {

    return null;

  }


  /*
  Generate new price
  */

  const newPrice =
    updatePrice(symbol);


  /*
  Update close
  */

  candle.close =
    newPrice;


  /*
  Update HIGH
  */

  if (
    newPrice >
    candle.high
  ) {

    candle.high =
      newPrice;

  }


  /*
  Update LOW
  */

  if (
    newPrice <
    candle.low
  ) {

    candle.low =
      newPrice;

  }


  return candle;

}


/*
=========================================================
FINALIZE CURRENT CANDLE
=========================================================
*/

function finalizeCandle(symbol) {

  const candle =
    activeCandles[symbol];


  if (!candle) {

    return;

  }


  /*
  Add completed candle
  to history
  */

  candleHistory[symbol].push({

    time:
      candle.time,

    open:
      Number(
        candle.open.toFixed(2)
      ),

    high:
      Number(
        candle.high.toFixed(2)
      ),

    low:
      Number(
        candle.low.toFixed(2)
      ),

    close:
      Number(
        candle.close.toFixed(2)
      )

  });


  /*
  Keep only latest 30 candles
  */

  if (
    candleHistory[symbol].length >
    30
  ) {

    candleHistory[symbol].shift();

  }

}


/*
=========================================================
CREATE NEW ACTIVE CANDLE
=========================================================
*/

function startNewCandle(symbol) {

  const currentPrice =
    simulatedPrices[symbol] ||
    fallback[symbol].price;


  activeCandles[symbol] = {

    time:
      Date.now(),

    open:
      currentPrice,

    high:
      currentPrice,

    low:
      currentPrice,

    close:
      currentPrice

  };

}


/*
=========================================================
PROCESS MARKET
=========================================================
*/

function processMarket(symbol) {

  const now =
    Date.now();


  const active =
    activeCandles[symbol];


  /*
  Safety check
  */

  if (!active) {

    startNewCandle(symbol);

    return;

  }


  /*
  Check how old the candle is
  */

  const candleAge =
    now - active.time;


  /*
  If 5 seconds are completed,
  finalize old candle and
  start a new one.
  */

  if (
    candleAge >=
    CANDLE_INTERVAL
  ) {

    finalizeCandle(symbol);

    startNewCandle(symbol);

  }


  /*
  Update current active candle
  */

  updateActiveCandle(symbol);

}


/*
=========================================================
GET QUOTE
=========================================================
*/

export async function getQuote(symbol) {

  const s =
    symbol.toUpperCase();


  const base =
    getStock(s);


  if (!base) {

    return null;

  }


  /*
  Process market movement
  */

  processMarket(s);


  const price =
    simulatedPrices[s] ||
    fallback[s].price;


  const startingPrice =
    fallback[s].price;


  /*
  Percentage change from
  original starting price
  */

  const change =
    Number(

      (
        (
          (price - startingPrice) /
          startingPrice
        ) *
        100
      ).toFixed(2)

    );


  return {

    ...base,

    price:
      Number(
        price.toFixed(2)
      ),

    change,

    source:
      "simulated-market"

  };

}


/*
=========================================================
GET CANDLE HISTORY
=========================================================
*/

export async function getHistory(symbol) {

  const s =
    symbol.toUpperCase();


  if (!fallback[s]) {

    return [];

  }


  /*
  Return completed candles
  */

  const history =
    candleHistory[s].map(
      (candle) => ({
        ...candle
      })
    );


  /*
  Also include current active candle
  so chart updates live.
  */

  const active =
    activeCandles[s];


  if (active) {

    history.push({

      time:
        active.time,

      open:
        Number(
          active.open.toFixed(2)
        ),

      high:
        Number(
          active.high.toFixed(2)
        ),

      low:
        Number(
          active.low.toFixed(2)
        ),

      close:
        Number(
          active.close.toFixed(2)
        )

    });

  }


  /*
  Return latest 30 candles
  */

  return history.slice(-30);

}