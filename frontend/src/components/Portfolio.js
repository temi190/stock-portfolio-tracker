import React, { useEffect, useState } from "react";

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/portfolio")
      .then((res) => res.json())
      .then((data) => setPortfolio(data))
      .catch((err) => console.error("Error fetching portfolio:", err));
  }, []);

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
          </tr>
        </thead>
        <tbody>
          {portfolio.map((stock, idx) => (
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
                className={stock.pl >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}
              >
                {stock.pl ? `$${stock.pl.toFixed(2)}` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Portfolio;

