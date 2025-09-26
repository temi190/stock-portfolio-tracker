from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from portfolio import add_stock, remove_stock, get_portfolio, get_portfolio_value
import yfinance as yf

app = Flask(__name__)
CORS(app)


portfolio = [
    {"ticker": "AAPL", "shares": 10, "buy_price": 160},
    {"ticker": "MSFT", "shares": 9, "buy_price": 300},
    {"ticker": "TSLA", "shares": 4, "buy_price": 250}
]

@app.route("/portfolio")
def get_portfolio():
    data = []
    for stock in portfolio:
        ticker = yf.Ticker(stock["ticker"])
        current_price = ticker.history(period="1d")["Close"].iloc[-1]

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


@app.route('/')
def home():
    return render_template('index.html')

# GET all portfolio entries
@app.route('/portfolio', methods=['GET'])
def portfolio():
    data = get_portfolio()
    result = [
        {"ticker": t, "shares": s, "buy_price": b, "buy_date": d}
        for t, s, b, d in data
    ]
    return jsonify(result)

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