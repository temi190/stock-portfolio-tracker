import React, { useEffect, useState } from "react";
import StockChart from "../components/StockChart";

function Portfolio({ data }) {
  const [selectedTicker, setSelectedTicker] = useState(null);


  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📊 My Stock Portfolio</h2>

      <table className="table table-striped table-hover table-bordered shadow-sm">
        <thead className="table-primary">
          <tr>
            <th>Ticker</th>
            <th>Shares</th>
            <th>Buy Price</th>
            <th>Current Price</th>
            <th>Value</th>
            <th>P/L</th>
            <th>Chart</th>
          </tr>
        </thead>
        <tbody>
          {data.map((stock, idx) => (
            <tr key={idx}>
              <td className="fw-bold">{stock.ticker}</td>
              <td>{stock.shares}</td>
              <td>${stock.buy_price}</td>
              <td>
                {stock.current_price
                  ? `$${stock.current_price.toFixed(2)}`
                  : "-"}
              </td>
              <td>
                {stock.value ? `$${stock.value.toFixed(2)}` : "-"}
              </td>
              <td
                className={
                  stock.pl >= 0 ? "text-success fw-bold" : "text-danger fw-bold"
                }
              >
                {stock.pl ? `$${stock.pl.toFixed(2)}` : "-"}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setSelectedTicker(stock.ticker)}
                >
                  View Chart
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Chart Section */}
      {selectedTicker && (
        <div className="mt-5">
          <h3 className="text-center">{selectedTicker} Price History</h3>
          <StockChart ticker={selectedTicker} />
          <div className="text-center mt-3">
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedTicker(null)}
            >
              Close Chart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;