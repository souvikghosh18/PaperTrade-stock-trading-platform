import React, {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Routes,
  Route,
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import { API } from "./api";

import {
  createChart,
  CandlestickSeries
} from "lightweight-charts";


/* =========================================================
   LAYOUT
========================================================= */

function Layout({ children }) {

  const nav = useNavigate();

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <div className="app">

      <header>

        <Link
          className="brand"
          to="/"
        >
          PaperTrade
        </Link>

        <nav>

          <Link to="/">
            Dashboard
          </Link>

          <Link to="/stocks">
            Markets
          </Link>

          <Link to="/orders">
            Orders
          </Link>

          <button onClick={logout}>
            Logout
          </button>

        </nav>

      </header>

      <main>
        {children}
      </main>

    </div>
  );
}


/* =========================================================
   LOGIN / REGISTER
========================================================= */

function Auth({ register = false }) {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [err, setErr] = useState("");


  const submit = async (e) => {

    e.preventDefault();

    setErr("");

    try {

      const r = await API.post(
        `/auth/${register ? "register" : "login"}`,
        form
      );

      localStorage.setItem(
        "token",
        r.data.token
      );

      window.location.href = "/";

    } catch (e) {

      setErr(
        e.response?.data?.message ||
        "Something went wrong"
      );

    }
  };


  return (

    <div className="auth">

      <div className="card auth-card">

        <h1>
          {register
            ? "Create account"
            : "Welcome back"}
        </h1>

        <p className="muted">
          Paper trading with virtual money.
        </p>


        <form onSubmit={submit}>

          {register && (

            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />

          )}


          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
          />


          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
          />


          <button className="primary">

            {register
              ? "Register"
              : "Login"}

          </button>

        </form>


        {err && (

          <p className="error">
            {err}
          </p>

        )}


        <p className="muted">

          {register
            ? "Already have an account? "
            : "New here? "}

          <Link
            to={
              register
                ? "/login"
                : "/register"
            }
          >

            {register
              ? "Login"
              : "Register"}

          </Link>

        </p>

      </div>

    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {

  const [p, setP] =
    useState(null);

  const [stocks, setStocks] =
    useState([]);

  const [watchlist, setWatchlist] =
    useState([]);


  const loadDashboard = async () => {

    try {

      const [
        portfolioRes,
        stocksRes,
        watchlistRes
      ] = await Promise.all([

        API.get("/portfolio"),

        API.get("/stocks"),

        API.get("/portfolio/watchlist")

      ]);


      setP(
        portfolioRes.data
      );

      setStocks(
        stocksRes.data
      );

      setWatchlist(
        watchlistRes.data
      );

    } catch (err) {

      console.log(
        "DASHBOARD ERROR:",
        err
      );

    }
  };


  useEffect(() => {

    loadDashboard();

    const interval =
      setInterval(
        loadDashboard,
        5000
      );

    return () => {

      clearInterval(
        interval
      );

    };

  }, []);


  if (!p) {
    return <Loading />;
  }


  const watchlistStocks =
    stocks.filter((s) =>
      watchlist.includes(
        s.symbol
      )
    );


  return (

    <Layout>

      <div className="hero">

        <div>

          <p className="eyebrow">
            PAPER TRADING
          </p>

          <h1>
            Your market dashboard
          </h1>

          <p className="muted">
            Practice investing with
            ₹1,00,000 virtual cash.
          </p>

          <p className="data-note">
            Market data: simulated provider •
            paper trading only
          </p>

        </div>


        <Link
          className="primary button"
          to="/stocks"
        >
          Explore markets
        </Link>

      </div>


      <div className="stats">

        <Stat
          label="Total portfolio"
          value={`₹${Number(
            p.totalValue || 0
          ).toLocaleString("en-IN")}`}
        />


        <Stat
          label="Available cash"
          value={`₹${Number(
            p.cash || 0
          ).toLocaleString("en-IN")}`}
        />


        <Stat
          label="Invested"
          value={`₹${Number(
            p.invested || 0
          ).toLocaleString("en-IN")}`}
        />


        <Stat
          label="P&L"
          value={`₹${Number(
            p.pnl || 0
          ).toLocaleString("en-IN")}`}
          positive={
            Number(p.pnl || 0) >= 0
          }
        />


        <Stat
          label="Return"
          value={`${Number(
            p.invested
              ? (p.pnl / p.invested) * 100
              : 0
          ).toFixed(2)}%`}
          positive={
            Number(p.pnl || 0) >= 0
          }
        />

      </div>


      {/* HOLDINGS */}

      <section className="card">

        <div className="section-title">

          <h2>
            Holdings
          </h2>

          <Link to="/orders">
            View orders
          </Link>

        </div>


        {p.holdings?.length ? (

          <table>

            <thead>

              <tr>

                <th>Symbol</th>
                <th>Qty</th>
                <th>Avg. cost</th>
                <th>Market value</th>
                <th>P&L</th>

              </tr>

            </thead>


            <tbody>

              {p.holdings.map((h) => (

                <tr
                  key={h.symbol}
                >

                  <td>

                    <Link
                      to={`/stocks/${h.symbol}`}
                    >

                      <b>
                        {h.symbol}
                      </b>

                      <small>
                        {h.name}
                      </small>

                    </Link>

                  </td>


                  <td>
                    {h.quantity}
                  </td>


                  <td>
                    ₹{h.avgCost}
                  </td>


                  <td>
                    ₹{h.marketValue}
                  </td>


                  <td
                    className={
                      Number(h.pnl) >= 0
                        ? "up"
                        : "down"
                    }
                  >
                    ₹{h.pnl}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        ) : (

          <Empty
            text="You don't own any stocks yet."
          />

        )}

      </section>


      {/* WATCHLIST */}

      <section className="card">

        <div className="section-title">

          <h2>
            My Watchlist
          </h2>

          <Link to="/stocks">
            Explore stocks
          </Link>

        </div>


        {watchlistStocks.length ? (

          <div className="grid">

            {watchlistStocks.map((s) => (

              <StockCard
                key={s.symbol}
                s={s}
              />

            ))}

          </div>

        ) : (

          <Empty
            text="Your watchlist is empty."
          />

        )}

      </section>


      {/* MARKET WATCH */}

      <section>

        <div className="section-title">

          <h2>
            Market watch
          </h2>

          <Link to="/stocks">
            See all
          </Link>

        </div>


        <div className="grid">

          {stocks
            .slice(0, 4)
            .map((s) => (

              <StockCard
                key={s.symbol}
                s={s}
              />

            ))}

        </div>

      </section>

    </Layout>
  );
}


/* =========================================================
   STAT
========================================================= */

function Stat({
  label,
  value,
  positive
}) {

  return (

    <div className="card stat">

      <span>
        {label}
      </span>

      <strong
        className={
          positive === undefined
            ? ""
            : positive
              ? "up"
              : "down"
        }
      >
        {value}
      </strong>

    </div>
  );
}


/* =========================================================
   STOCK CARD
========================================================= */

function StockCard({ s }) {

  if (!s) {
    return null;
  }


  return (

    <Link
      className="card stock-card"
      to={`/stocks/${s.symbol}`}
    >

      <div>

        <b>
          {s.symbol}
        </b>

        <small>
          {s.name}
        </small>

      </div>


      <strong>
        ₹{s.price}
      </strong>


      <span
        className={
          Number(s.change) >= 0
            ? "up"
            : "down"
        }
      >

        {Number(s.change) >= 0
          ? "+"
          : ""}

        {s.change}%

      </span>

    </Link>
  );
}


/* =========================================================
   LOADING
========================================================= */

function Loading() {

  return (

    <div className="loading">
      Loading…
    </div>

  );
}


/* =========================================================
   EMPTY
========================================================= */

function Empty({ text }) {

  return (

    <div className="empty">
      {text}
    </div>

  );
}


/* =========================================================
   MARKETS
========================================================= */

function Stocks() {

  const [stocks, setStocks] =
    useState([]);

  const [q, setQ] =
    useState("");


  const loadStocks = async () => {

    try {

      const r =
        await API.get(
          `/stocks?search=${encodeURIComponent(q)}`
        );

      setStocks(
        Array.isArray(r.data)
          ? r.data
          : []
      );

    } catch (err) {

      console.log(
        "STOCKS ERROR:",
        err
      );

    }

  };


  useEffect(() => {

    loadStocks();

    const interval =
      setInterval(
        loadStocks,
        5000
      );

    return () => {

      clearInterval(
        interval
      );

    };

  }, [q]);


  return (

    <Layout>

      <div className="page-head">

        <div>

          <p className="eyebrow">
            MARKETS
          </p>

          <h1>
            Explore stocks
          </h1>

        </div>


        <input
          className="search"
          placeholder="Search symbol or company…"
          value={q}
          onChange={(e) =>
            setQ(e.target.value)
          }
        />

      </div>


      <div className="grid">

        {stocks.map((s) => (

          <StockCard
            key={s.symbol}
            s={s}
          />

        ))}

      </div>

    </Layout>
  );
}


/* =========================================================
   CANDLESTICK CHART
========================================================= */

function CandleChart({
  history
}) {

  const chartContainerRef =
    useRef(null);

  const chartRef =
    useRef(null);

  const candleSeriesRef =
    useRef(null);


  /* CREATE CHART */

  useEffect(() => {

    if (
      !chartContainerRef.current
    ) {
      return;
    }


    const container =
      chartContainerRef.current;


    const getChartHeight = () => {

      if (
        window.innerWidth <= 480
      ) {
        return 240;
      }

      if (
        window.innerWidth <= 768
      ) {
        return 280;
      }

      return 360;
    };


    const chart =
      createChart(
        container,
        {
          width:
            container.clientWidth,

          height:
            getChartHeight(),

          layout: {
            background: {
              color: "#ffffff"
            },

            textColor:
              "#374151"
          },

          grid: {
            vertLines: {
              color: "#eeeeee"
            },

            horzLines: {
              color: "#eeeeee"
            }
          },

          rightPriceScale: {
            borderColor:
              "#dddddd"
          },

          timeScale: {
            borderColor:
              "#dddddd",

            timeVisible: true,

            secondsVisible: true,

            rightOffset: 3,

            barSpacing: 12,

            minBarSpacing: 5
          },

          crosshair: {
            vertLine: {
              width: 1,

              color: "#9ca3af",

              style: 3,

              labelBackgroundColor:
                "#374151"
            },

            horzLine: {
              width: 1,

              color: "#9ca3af",

              style: 3,

              labelBackgroundColor:
                "#374151"
            }
          }
        }
      );


    /* CANDLE SERIES */

    const candleSeries =
      chart.addSeries(
        CandlestickSeries,
        {
          upColor: "#16a34a",

          downColor: "#dc2626",

          borderVisible: false,

          wickUpColor:
            "#16a34a",

          wickDownColor:
            "#dc2626"
        }
      );


    chartRef.current =
      chart;

    candleSeriesRef.current =
      candleSeries;


    /* RESPONSIVE */

    const handleResize = () => {

      if (
        chartContainerRef.current
      ) {

        chart.applyOptions({

          width:
            chartContainerRef
              .current
              .clientWidth,

          height:
            getChartHeight()

        });

      }

    };


    window.addEventListener(
      "resize",
      handleResize
    );


    /* CLEANUP */

    return () => {

      window.removeEventListener(
        "resize",
        handleResize
      );

      chart.remove();

      chartRef.current =
        null;

      candleSeriesRef.current =
        null;

    };

  }, []);


  /* UPDATE DATA */

  useEffect(() => {

    if (
      !candleSeriesRef.current ||
      !Array.isArray(history) ||
      !history.length
    ) {
      return;
    }


    const candles = [];


    history.forEach(
      (item, index) => {

        if (!item) {
          return;
        }


        let time =
          Number(item.time);


        /* milliseconds → seconds */

        if (
          time > 100000000000
        ) {

          time =
            Math.floor(
              time / 1000
            );

        }


        /* fallback time */

        if (
          !Number.isFinite(time) ||
          time <= 0
        ) {

          time =
            Math.floor(
              Date.now() / 1000
            ) -
            (
              (history.length - index) * 5
            );

        }


        /* OHLC DATA */

        if (
          item.open !== undefined &&
          item.high !== undefined &&
          item.low !== undefined &&
          item.close !== undefined
        ) {

          const open =
            Number(item.open);

          const high =
            Number(item.high);

          const low =
            Number(item.low);

          const close =
            Number(item.close);


          if (
            Number.isFinite(open) &&
            Number.isFinite(high) &&
            Number.isFinite(low) &&
            Number.isFinite(close)
          ) {

            candles.push({

              time,

              open,

              high,

              low,

              close

            });

          }

          return;
        }


        /* PRICE ONLY FALLBACK */

        const close =
          Number(
            item.price || 0
          );


        const previous =
          index > 0
            ? Number(
              history[
                index - 1
              ]?.price || close
            )
            : close;


        const open =
          previous;


        const high =
          Math.max(
            open,
            close
          ) * 1.002;


        const low =
          Math.min(
            open,
            close
          ) * 0.998;


        if (
          Number.isFinite(close)
        ) {

          candles.push({

            time,

            open:
              Number(
                open.toFixed(2)
              ),

            high:
              Number(
                high.toFixed(2)
              ),

            low:
              Number(
                low.toFixed(2)
              ),

            close:
              Number(
                close.toFixed(2)
              )

          });

        }

      }
    );


    /* SORT */

    candles.sort(
      (a, b) =>
        Number(a.time) -
        Number(b.time)
    );


    /* REMOVE DUPLICATES */

    const uniqueCandles = [];

    const seen =
      new Set();


    for (
      const candle of candles
    ) {

      if (
        !seen.has(candle.time)
      ) {

        seen.add(
          candle.time
        );

        uniqueCandles.push(
          candle
        );

      }

    }


    /* STRICTLY INCREASING */

    const validCandles = [];


    for (
      const candle of uniqueCandles
    ) {

      const last =
        validCandles[
        validCandles.length - 1
        ];


      if (
        !last ||
        candle.time > last.time
      ) {

        validCandles.push(
          candle
        );

      }

    }


    /* SET DATA */

    if (
      validCandles.length
    ) {

      candleSeriesRef
        .current
        .setData(
          validCandles
        );


      if (
        chartRef.current
      ) {

        chartRef.current
          .timeScale()
          .fitContent();

      }

    }

  }, [history]);


  return (

    <div
      ref={chartContainerRef}
      className="candle-chart-container"
    />

  );
}


/* =========================================================
   STOCK DETAILS
   FIXED VERSION
========================================================= */

function StockDetails() {

  const { symbol } =
    useParams();


  const [s, setS] =
    useState(null);

  const [qty, setQty] =
    useState(1);

  const [side, setSide] =
    useState("BUY");

  const [msg, setMsg] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const [watchlist, setWatchlist] =
    useState([]);

  const [watchLoading, setWatchLoading] =
    useState(false);


  /* =======================================================
     LOAD STOCK
  ======================================================= */

  const loadStock = async () => {

    try {

      setError("");

      const r =
        await API.get(
          `/stocks/${encodeURIComponent(symbol)}`
        );


      /*
       * IMPORTANT:
       * Backend response must contain stock object.
       */

      if (
        !r.data
      ) {

        setS(null);

        setError(
          "Stock data not found."
        );

        return;
      }


      setS(
        r.data
      );

    } catch (err) {

      console.log(
        "STOCK DETAILS ERROR:",
        err
      );

      setS(null);

      setError(
        err.response?.data?.message ||
        "Unable to load stock details."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     INITIAL + EVERY 5 SECONDS
  ======================================================= */

  useEffect(() => {

    setS(null);

    setError("");

    setLoading(true);

    loadStock();


    const interval =
      setInterval(
        loadStock,
        5000
      );


    return () => {

      clearInterval(
        interval
      );

    };

  }, [symbol]);


  /* =======================================================
     LOAD WATCHLIST
  ======================================================= */

  useEffect(() => {

    API.get(
      "/portfolio/watchlist"
    )

      .then((r) => {

        setWatchlist(
          Array.isArray(r.data)
            ? r.data
            : []
        );

      })

      .catch((err) => {

        console.log(
          "WATCHLIST ERROR:",
          err
        );

      });

  }, []);


  /* =======================================================
     TOGGLE WATCHLIST
  ======================================================= */

  const toggleWatchlist =
    async () => {

      if (!s) {
        return;
      }


      setWatchLoading(
        true
      );


      try {

        const isWatching =
          watchlist.includes(
            s.symbol
          );


        const r =
          await API.post(
            `/portfolio/watchlist/${encodeURIComponent(s.symbol)}`
          );


        setWatchlist(
          Array.isArray(r.data)
            ? r.data
            : []
        );


        setMsg(
          isWatching
            ? `${s.symbol} removed from watchlist`
            : `${s.symbol} added to watchlist`
        );


      } catch (e) {

        console.log(
          "WATCHLIST ERROR:",
          e
        );


        setMsg(
          e.response?.data?.message ||
          "Watchlist update failed"
        );


      } finally {

        setWatchLoading(
          false
        );

      }

    };


  /* =======================================================
     TRADE
  ======================================================= */

  const trade = async () => {

    if (!s) {
      return;
    }


    const quantity =
      Number(qty);


    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {

      setMsg(
        "Please enter a valid whole-number quantity."
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to ${side} ${quantity} ${s.symbol} share${quantity > 1 ? "s" : ""}?`
      );


    if (!confirmed) {
      return;
    }


    try {

      const r =
        await API.post(
          "/trades",
          {
            symbol:
              s.symbol,

            side,

            quantity
          }
        );


      setMsg(
        r.data.message ||
        `${side} order executed`
      );


      await loadStock();


    } catch (e) {

      console.log(
        "TRADE ERROR:",
        e
      );


      setMsg(
        e.response?.data?.message ||
        "Order failed"
      );

    }

  };


  /* =======================================================
     IMPORTANT NULL PROTECTION
  ======================================================= */

  if (loading) {

    return (
      <Layout>
        <Loading />
      </Layout>
    );

  }


  if (!s) {

    return (

      <Layout>

        <div className="card">

          <h2>
            Unable to load stock
          </h2>

          <p className="error">
            {error ||
              "Stock information is unavailable."}
          </p>

          <Link
            to="/stocks"
            className="primary button"
          >
            ← Back to Markets
          </Link>

        </div>

      </Layout>

    );

  }


  /* =======================================================
     SAFE PRICE
  ======================================================= */

  const stockPrice =
    Number(s.price || 0);


  const estimatedTotal =
    stockPrice *
    Number(qty || 0);


  return (

    <Layout>

      <Link
        to="/stocks"
        className="back"
      >
        ← Markets
      </Link>


      <div className="detail-grid">


        {/* =================================================
           STOCK INFORMATION
        ================================================= */}

        <section className="card">

          <div className="stock-title">

            <div>

              <p className="eyebrow">
                {s.symbol}
              </p>

              <h1>
                {s.name}
              </h1>

            </div>


            <div className="price">

              ₹{stockPrice.toFixed(2)}


              <span
                className={
                  Number(s.change) >= 0
                    ? "up"
                    : "down"
                }
              >

                {Number(
                  s.change || 0
                ) >= 0
                  ? "+"
                  : ""}

                {Number(
                  s.change || 0
                ).toFixed(2)}%

              </span>

            </div>

          </div>


          {/* WATCHLIST */}

          <button
            onClick={
              toggleWatchlist
            }
            disabled={
              watchLoading
            }
            style={{

              marginTop:
                "15px",

              marginBottom:
                "15px",

              padding:
                "10px 18px",

              borderRadius:
                "8px",

              border:
                "1px solid #ccc",

              background:
                watchlist.includes(
                  s.symbol
                )
                  ? "#fff3cd"
                  : "#ffffff",

              cursor:
                watchLoading
                  ? "not-allowed"
                  : "pointer",

              fontSize:
                "15px",

              fontWeight:
                "600",

              maxWidth:
                "100%"

            }}
          >

            {watchLoading

              ? "Updating..."

              : watchlist.includes(
                s.symbol
              )

                ? "★ Remove from Watchlist"

                : "☆ Add to Watchlist"}

          </button>


          {/* CHART */}

          <div className="chart">

            <CandleChart
              history={
                Array.isArray(
                  s.history
                )
                  ? s.history
                  : []
              }
            />

          </div>

        </section>


        {/* =================================================
           TRADE BOX
        ================================================= */}

        <aside
          className="card order-box"
        >

          <h2>
            Trade {s.symbol}
          </h2>


          {/* BUY / SELL */}

          <div className="tabs">

            <button
              className={
                side === "BUY"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSide("BUY")
              }
            >
              Buy
            </button>


            <button
              className={
                side === "SELL"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSide("SELL")
              }
            >
              Sell
            </button>

          </div>


          {/* QUANTITY */}

          <label>

            Quantity

            <input
              type="number"
              min="1"
              step="1"
              value={qty}
              onChange={(e) =>
                setQty(
                  e.target.value
                )
              }
            />

          </label>


          {/* TOTAL */}

          <div className="order-total">

            <span>
              Estimated total
            </span>

            <b>
              ₹
              {estimatedTotal.toFixed(
                2
              )}
            </b>

          </div>


          {/* TRADE BUTTON */}

          <button
            className="primary wide"
            onClick={trade}
          >
            Place {side} order
          </button>


          {/* MESSAGE */}

          {msg && (

            <p
              className={
                msg
                  .toLowerCase()
                  .includes("failed") ||
                  msg
                    .toLowerCase()
                    .includes("insufficient") ||
                  msg
                    .toLowerCase()
                    .includes("invalid") ||
                  msg
                    .toLowerCase()
                    .includes("error")
                  ? "error"
                  : "success"
              }
            >
              {msg}
            </p>

          )}


          <small className="muted">

            Orders are simulated using
            virtual cash.

          </small>

        </aside>

      </div>

    </Layout>
  );
}


/* =========================================================
   ORDERS
========================================================= */

function Orders() {

  const [orders, setOrders] =
    useState([]);


  const loadOrders =
    async () => {

      try {

        const r =
          await API.get(
            "/trades"
          );


        setOrders(
          Array.isArray(r.data)
            ? r.data
            : []
        );


      } catch (err) {

        console.log(
          "ORDERS ERROR:",
          err
        );

      }

    };


  useEffect(() => {

    loadOrders();

  }, []);


  return (

    <Layout>

      <div className="page-head">

        <div>

          <p className="eyebrow">
            ACTIVITY
          </p>

          <h1>
            Order history
          </h1>

        </div>

      </div>


      <section className="card">

        <table>

          <thead>

            <tr>

              <th>Date</th>

              <th>Symbol</th>

              <th>Side</th>

              <th>Qty</th>

              <th>Price</th>

              <th>Total</th>

            </tr>

          </thead>


          <tbody>

            {orders.map((o) => (

              <tr
                key={o._id}
              >

                <td>

                  {o.createdAt
                    ? new Date(
                      o.createdAt
                    ).toLocaleString()
                    : "-"}

                </td>


                <td>

                  <b>
                    {o.symbol}
                  </b>

                </td>


                <td
                  className={
                    o.side === "BUY"
                      ? "up"
                      : "down"
                  }
                >
                  {o.side}
                </td>


                <td>
                  {o.quantity}
                </td>


                <td>
                  ₹{o.price}
                </td>


                <td>
                  ₹{o.finalTotal ?? o.total}
                </td>

              </tr>

            ))}

          </tbody>

        </table>


        {!orders.length && (

          <Empty
            text="No orders yet."
          />

        )}

      </section>

    </Layout>
  );
}


/* =========================================================
   APP
========================================================= */

export default function App() {

  const token =
    localStorage.getItem(
      "token"
    );


  return (

    <Routes>

      {/* LOGIN */}

      <Route
        path="/login"
        element={
          <Auth />
        }
      />


      {/* REGISTER */}

      <Route
        path="/register"
        element={
          <Auth register />
        }
      />


      {token ? (

        <>

          {/* DASHBOARD */}

          <Route
            path="/"
            element={
              <Dashboard />
            }
          />


          {/* MARKETS */}

          <Route
            path="/stocks"
            element={
              <Stocks />
            }
          />


          {/* STOCK DETAILS */}

          <Route
            path="/stocks/:symbol"
            element={
              <StockDetails />
            }
          />


          {/* ORDERS */}

          <Route
            path="/orders"
            element={
              <Orders />
            }
          />


          {/* UNKNOWN ROUTE */}

          <Route
            path="*"
            element={
              <Dashboard />
            }
          />

        </>

      ) : (

        <Route
          path="*"
          element={
            <Auth />
          }
        />

      )}

    </Routes>
  );
}