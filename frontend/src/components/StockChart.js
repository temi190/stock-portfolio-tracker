import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

export default function StockChart({ ticker }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:5000/price?ticker=${ticker}`);
        const data = await response.json();
        setChartData(data);
      } catch (err) {
        console.error("Error fetching stock data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  if (loading) return <p>Loading chart...</p>;
  if (!chartData.length) return <p>No data available for {ticker}</p>;

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h3 className="text-xl font-semibold mb-4">{ticker} Price History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}