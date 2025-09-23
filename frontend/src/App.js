import React, { useState, useEffect } from "react";

function App() {
  const [portfolio, setPortfolio] = useState([]);
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [removeTicker, setRemoveTicker] = useState("");
  const [removeShares, setRemoveShares] = useState("");

  // Fetch portfolio from Flask API
  const fetchPortfolio = async () => {
    const res = await fetch("http://127.0.0.1:5000/portfolio");
    const data = await res.json();
    setPortfolio(data);
  };

  // Add stock
  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch("http://127.0.0.1:5000/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker,
        shares: parseInt(shares),
        buy_price: parseFloat(buyPrice),
      }),
    });
    setTicker("");
    setShares("");
    setBuyPrice("");
    fetchPortfolio();
  };

  // Remove stock
  const handleRemove = async (e) => {
    e.preventDefault();
    await fetch("http://127.0.0.1:5000/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker: removeTicker,
        shares_to_sell: parseInt(removeShares),
      }),
    });
    setRemoveTicker("");
    setRemoveShares("");
    fetchPortfolio();
  };

  // Initial load
  useEffect(() => {
    fetchPortfolio();
  }, []);

  return (
    <div>
      <h1>Stock Portfolio Tracker</h1>

      <h2>Portfolio</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Shares</th>
            <th>Buy Price</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.map((stock, idx) => (
            <tr key={idx}>
              <td>{stock.ticker}</td>
              <td>{stock.shares}</td>
              <td>{stock.buy_price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Add Stock</h2>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        />
        <input
          type="number"
          placeholder="Shares"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
        />
        <input
          type="number"
          placeholder="Buy Price"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <h2>Remove Stock</h2>
      <form onSubmit={handleRemove}>
        <input
          type="text"
          placeholder="Ticker"
          value={removeTicker}
          onChange={(e) => setRemoveTicker(e.target.value)}
        />
        <input
          type="number"
          placeholder="Shares"
          value={removeShares}
          onChange={(e) => setRemoveShares(e.target.value)}
        />
        <button type="submit">Remove</button>
      </form>
    </div>
  );
}

export default App;
