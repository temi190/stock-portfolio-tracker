import React, { useState } from "react";
import Portfolio from "./components/Portfolio.js";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [portfolio, setPortfolio] = useState([
    { ticker: "AAPL", shares: 10, buyPrice: 160 },
    { ticker: "MSFT", shares: 9, buyPrice: 300 },
    { ticker: "TSLA", shares: 4, buyPrice: 250 },
    {"ticker": "AMZN", shares: 6, buyPrice: 140},   // Amazon
    {"ticker": "GOOGL", shares: 8, buyPrice: 120}   // Alphabet (Google)
  ]);

    const [newStock, setNewStock] = useState({ ticker: "", shares: "", buyPrice: "" });
  const [removeTicker, setRemoveTicker] = useState("");

  // Handle Add Stock
  const handleAddStock = (e) => {
    e.preventDefault();
    if (!newStock.ticker || newStock.shares <= 0 || newStock.buyPrice <= 0) {
      alert("Please enter valid stock details.");
      return;
    }
    setPortfolio([...portfolio, { ...newStock, shares: Number(newStock.shares), buyPrice: Number(newStock.buyPrice) }]);
    setNewStock({ ticker: "", shares: "", buyPrice: "" }); // reset form
  };

  // Handle Remove Stock
  const handleRemoveStock = (e) => {
    e.preventDefault();
    setPortfolio(portfolio.filter(stock => stock.ticker.toUpperCase() !== removeTicker.toUpperCase()));
    setRemoveTicker("");
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">📈 Stock Portfolio Tracker</h1>

      {/* Portfolio Component for charts */}
      <Portfolio data={portfolio} />

      {/* Portfolio Table */}
      <div className="card shadow-sm p-3 mb-4">
        <h3>Portfolio</h3>
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Ticker</th>
              <th>Shares</th>
              <th>Buy Price</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((stock, index) => (
              <tr key={index}>
                <td>{stock.ticker}</td>
                <td>{stock.shares}</td>
                <td>${stock.buyPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        {/* Add Stock Form */}
      <div className="card shadow-sm p-3 mb-4">
        <h3>Add Stock</h3>
        <form className="row g-3" onSubmit={handleAddStock}>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Ticker"
              value={newStock.ticker}
              onChange={(e) => setNewStock({ ...newStock, ticker: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Shares"
              value={newStock.shares}
              onChange={(e) => setNewStock({ ...newStock, shares: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Buy Price"
              value={newStock.buyPrice}
              onChange={(e) => setNewStock({ ...newStock, buyPrice: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <button className="btn btn-success w-100">Add</button>
          </div>
        </form>
      </div>

      {/* Remove Stock */}
      <div className="card shadow-sm p-3">
        <h3>Remove Stock</h3>
        <form className="row g-3" onSubmit={handleRemoveStock}>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Ticker"
              value={removeTicker}
              onChange={(e) => setRemoveTicker(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <button className="btn btn-danger w-100">Remove</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;