import React, { useEffect, useState } from "react";

function StockNews({ ticker }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) return;

    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:5000/news?ticker=${ticker}`);
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [ticker]);

  if (loading) return <p>Loading news...</p>;

  return (
    <div className="mt-4">
      <h4>{ticker} News</h4>
      {articles.length === 0 ? (
        <p>No news available.</p>
      ) : (
        <ul className="list-group">
          {articles.map((article, idx) => (
            <li key={idx} className="list-group-item">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
              <p>{article.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StockNews;