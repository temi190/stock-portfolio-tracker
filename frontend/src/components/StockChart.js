import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

function generateStockData(days = 30, startPrice = 100) {
  let data = [];
  let price = startPrice;

  for (let i = 0; i < days; i++) {
    // Simulate daily movement: +/- between -3% to +3%
    const change = price * (Math.random() * 0.06 - 0.03);
    price = Math.max(10, price + change); // keep it positive
    data.push({
      date: `Day ${i + 1}`,
      price: price.toFixed(2)
    });
  }

  return data;
}

const data = generateStockData(20, 150);

export default function StockChart() {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h3 className="text-xl font-semibold mb-4">Stock Price Chart</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}