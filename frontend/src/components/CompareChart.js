import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function CompareChart({ tickers }) {
  const [chartData, setChartData] = useState([]);
  const [mode, setMode] = useState("normalised"); // "normalised" or "raw"
  const [loading, setLoading] = useState(false);

  const fetchComparison = async () => {
    if (!tickers || tickers.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers, mode }),
      });
      const data = await response.json();

      if (!data || Object.keys(data).length === 0) {
        setChartData([]);
        setLoading(false);
        return;
      }

      const firstTicker = tickers[0];
      const length = data[firstTicker]?.length || 0;
      const chartArr = [];

      for (let i = 0; i < length; i++) {
        const point = { date: data[`${firstTicker}_dates`]?.[i] || "" };
        tickers.forEach((t) => {
          point[t] = data[t]?.[i] ?? null;
        });
        chartArr.push(point);
      }

      setChartData(chartArr);
    } catch (err) {
      console.error("Failed to fetch comparison:", err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever tickers or mode change
   useEffect(() => {
    fetchComparison(); // fetch initially
    const interval = setInterval(fetchComparison, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, [tickers]); // <-- make sure this line is exactly like this

  return (
    <div>
      <div className="mb-2">
        <button
          className="btn btn-primary me-2"
          onClick={() => setMode("normalised")}
          disabled={mode === "normalised"}
        >
          Normalised
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setMode("raw")}
          disabled={mode === "raw"}
        >
          Actual Prices
        </button>
      </div>

      {loading ? (
        <p>Loading chart...</p>
      ) : chartData.length === 0 ? (
        <p>No data to display</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis
              label={{
                value:
                  mode === "normalised" ? "Index (100 = start)" : "Price ($)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend />
            {Object.keys(chartData[0])
              .filter((key) => key !== "date")
              .map((ticker, idx) => (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  strokeWidth={2}
                  stroke={`hsl(${(idx * 60) % 360}, 70%, 50%)`}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default CompareChart;