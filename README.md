# PaperTrade V2 — Indian Stock Paper Trading

A portfolio-ready paper-trading simulator using React, Express, MongoDB and configurable market-data integration.

## Important
- Virtual money only; no real orders or brokerage.
- Stock symbols are real Indian NSE symbols, but the app does **not** ship with an unauthorized live NSE/BSE feed.
- To show live/near-live prices on a public deployment, configure a market-data provider that explicitly permits your intended display/use.
- The code includes a provider adapter (`server/src/services/market.js`) so a permitted free-tier provider can be plugged in without changing the trading UI.
- If no provider is configured, prices remain unavailable and BUY/SELL is disabled by the API rather than pretending that demo prices are live.

## Features
Auth, virtual ₹100,000 balance, Indian stock search, quote display, charts, simulated BUY/SELL, portfolio, P&L, order history, watchlist-ready architecture, responsive UI.

## Run
### Backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Market data
Set `MARKET_API_URL` and optionally `MARKET_API_KEY` only after checking the provider's current terms for public display, redistribution, caching, and commercial/non-commercial use.

A currently available example is Indian API, which states in its June 22, 2026 terms that its APIs are free and can be integrated into websites/apps, but also disclaims accuracy/availability and puts legal compliance responsibility on the user. Verify the individual API's terms before deployment.

Another free option to investigate is Tradient, which advertises free Indian market-data APIs; verify its current plan and display/redistribution terms before using it.

Do not scrape NSE/BSE web pages or reverse-engineer private endpoints for a public production app.
