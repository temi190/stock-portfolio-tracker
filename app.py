from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from portfolio import add_stock, remove_stock, get_portfolio, get_portfolio_value
import yfinance as yf
import requests
from flask_bcrypt import Bcrypt
import hashlib
import secrets

app = Flask(__name__)
CORS(app)


bcrypt = Bcrypt(app)

users = {}  # { username: { "password": hashed_password } }
sessions = {}  # { token: username }

# Utility: hash password
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if username in users:
        return jsonify({"error": "User already exists"}), 400

    users[username] = {"password": hash_password(password)}
    return jsonify({"message": f"User {username} registered successfully"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if username not in users:
        return jsonify({"error": "User not found"}), 404

    hashed = hash_password(password)
    if users[username]["password"] != hashed:
        return jsonify({"error": "Invalid password"}), 401

    # Generate session token
    token = secrets.token_hex(16)
    sessions[token] = username

    return jsonify({"message": "Login successful", "token": token})



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
    ticker = data.get("ticker").upper()
    shares = data.get("shares")
    buy_price = data.get("buy_price")
    
    # Validate ticker
    stock = yf.Ticker(ticker)
    if stock.history(period="1d").empty:
        return jsonify({"error": "Invalid ticker"}), 400

    portfolio.append({
        "ticker": ticker,
        "shares": shares,
        "buy_price": buy_price
    })
    return jsonify({"message": f"{shares} shares of {ticker} added."})

# POST to remove stock
@app.route('/remove', methods=['POST'])
def remove():
    data = request.get_json()
    ticker = data.get("ticker")
    shares_to_sell = data.get("shares_to_sell")  # optional
    remove_stock(ticker, shares_to_sell)
    return jsonify({"message": f"{ticker} updated/removed."})

@app.route("/compare", methods=["POST"])
def compare():
    data = request.json
    tickers = data.get("tickers", [])
    mode = data.get("mode", "normalised")  # "normalised" or "raw"
    
    result = {}
    for ticker in tickers:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="6mo")
        closes = hist["Close"].tolist()
        dates = hist.index.strftime("%Y-%m-%d").tolist()

        if mode == "normalised":
            base = closes[0] if closes else 1
            closes = [(c / base) * 100 for c in closes]

        result[ticker] = closes
        result[f"{ticker}_dates"] = dates

    return jsonify(result)

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)