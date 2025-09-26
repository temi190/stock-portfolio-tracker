from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from portfolio import add_stock, remove_stock, get_portfolio, get_portfolio_value
import yfinance as yf
import requests

app = Flask(__name__)
CORS(app)

NEWS_API_KEY = "937d6f23b6e541b8be85410c3195f798"  

@app.route("/news", methods=["GET"])
def get_news():
    symbol = request.args.get("ticker")
    if not symbol:
        return jsonify({"error": "Ticker is required"}), 400

    url = "https://newsapi.org/v2/everything"
    params = {
        "q": symbol,
        "apiKey": NEWS_API_KEY,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 5
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()
        if data.get("status") != "ok":
            return jsonify({"error": "Failed to fetch news"}), 500

        articles = [
            {
                "title": article["title"],
                "url": article["url"],
                "source": article["source"]["name"],
                "publishedAt": article["publishedAt"]
            }
            for article in data.get("articles", [])
        ]
        return jsonify(articles)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


portfolio = [
    {"ticker": "AAPL", "shares": 10, "buy_price": 160},
    {"ticker": "MSFT", "shares": 9, "buy_price": 300},
    {"ticker": "TSLA", "shares": 4, "buy_price": 250}
]

@app.route("/portfolio", methods=['GET'])
def get_portfolio_data():
    data = []
    for stock in portfolio:
        ticker = yf.Ticker(stock["ticker"])
        # Get latest close price (1d history)
        history = ticker.history(period="1d")
        if not history.empty:
            current_price = history["Close"].iloc[-1]
        else:
            current_price = stock["buy_price"]  # fallback

        value = stock["shares"] * current_price
        pl = (current_price - stock["buy_price"]) * stock["shares"]

        data.append({
            "ticker": stock["ticker"],
            "shares": stock["shares"],
            "buy_price": stock["buy_price"],
            "current_price": float(current_price),
            "value": float(value),
            "pl": float(pl)
        })
    return jsonify(data)

@app.route("/price", methods=['GET'])
def get_price():
    ticker_symbol = request.args.get("ticker")
    ticker = yf.Ticker(ticker_symbol)
    history = ticker.history(period="1mo")
    chart_data = [
        {"date": str(date.date()), "price": float(row["Close"])}
        for date, row in history.iterrows()
    ]
    return jsonify(chart_data)



@app.route('/')
def home():
    return render_template('index.html')


# GET total portfolio value and P/L
@app.route('/value', methods=['GET'])
def portfolio_value():
    stocks, total_value, total_pl = get_portfolio_value()
    return jsonify({
        "stocks": stocks,
        "total_value": total_value,
        "total_pl": total_pl
    })

# POST to add stock
@app.route('/add', methods=['POST'])
def add():
    data = request.get_json()
    ticker = data.get("ticker")
    shares = data.get("shares")
    buy_price = data.get("buy_price")
    add_stock(ticker, shares, buy_price)
    return jsonify({"message": f"{shares} shares of {ticker} added."})

# POST to remove stock
@app.route('/remove', methods=['POST'])
def remove():
    data = request.get_json()
    ticker = data.get("ticker")
    shares_to_sell = data.get("shares_to_sell")  # optional
    remove_stock(ticker, shares_to_sell)
    return jsonify({"message": f"{ticker} updated/removed."})

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)