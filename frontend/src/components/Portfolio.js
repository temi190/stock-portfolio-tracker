import React, { useEffect, useState } from "react";

function Portfolio() {
  // State to store portfolio data
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Flask API when component mounts
  useEffect(() => {
    fetch("http://127.0.0.1:5000/portfolio")
      .then(res => res.json())
      .then(data => {
        setPortfolio(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading portfolio...</p>;

  return (
    <div>
      <h2>My Portfolio</h2>
      <table>
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
              <td>${stock.buy_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Portfolio;
