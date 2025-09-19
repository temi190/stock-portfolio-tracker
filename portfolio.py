import sqlite3
import yfinance as yf
from datetime import date

# Path to your SQLite database
DB_PATH = "data/portfolio.db"

def add_stock(ticker, shares, buy_price, buy_date=None):
    """Add a stock to the portfolio, or update if it already exists"""
    if buy_date is None:
        buy_date = date.today().isoformat()

    ticker = ticker.upper()

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        # Check if the stock already exists
        cursor.execute("SELECT shares, buy_price FROM Portfolio WHERE ticker = ?", (ticker,))
        result = cursor.fetchone()

        if result:
            # Stock exists: update shares and average buy price
            old_shares, old_price = result
            total_shares = old_shares + shares
            # Calculate weighted average buy price
            new_price = round((old_shares * old_price + shares * buy_price) / total_shares, 2)
            cursor.execute(
                "UPDATE Portfolio SET shares = ?, buy_price = ?, buy_date = ? WHERE ticker = ?",
                (total_shares, new_price, buy_date, ticker)
            )
        else:
            # Stock does not exist: insert new
            cursor.execute(
                "INSERT INTO Portfolio (ticker, shares, buy_price, buy_date) VALUES (?, ?, ?, ?)",
                (ticker, shares, buy_price, buy_date)
            )

        conn.commit()

def remove_stock(ticker, shares_to_sell=None):
    """
    Remove a stock completely or partially from the portfolio.
    If shares_to_sell is None, removes the entire position.
    """
    ticker = ticker.upper()

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT shares FROM Portfolio WHERE ticker = ?", (ticker,))
        result = cursor.fetchone()

        if not result:
            print(f"⚠️ {ticker} not found in portfolio.")
            return

        current_shares = result[0]

        if shares_to_sell is None or shares_to_sell >= current_shares:
            # Remove entire stock
            cursor.execute("DELETE FROM Portfolio WHERE ticker = ?", (ticker,))
        else:
            # Reduce shares
            new_shares = current_shares - shares_to_sell
            cursor.execute("UPDATE Portfolio SET shares = ? WHERE ticker = ?", (new_shares, ticker))

        conn.commit()

def get_portfolio():
    """Fetch all portfolio entries"""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT ticker, shares, buy_price, buy_date FROM Portfolio")
        return cursor.fetchall()

def get_portfolio_value():
    """Calculate total portfolio value and P/L"""
    rows = get_portfolio()
    total_value = 0
    total_pl = 0
    results = []

    for ticker, shares, buy_price, buy_date in rows:
        stock = yf.Ticker(ticker)
        current_price = stock.history(period="1d")['Close'].iloc[-1]
        value = shares * current_price
        pl = (current_price - buy_price) * shares

        results.append({
            "ticker": ticker,
            "shares": shares,
            "buy_price": buy_price,
            "current_price": round(current_price, 2),
            "value": round(value, 2),
            "pl": round(pl, 2)
        })

        total_value += value
        total_pl += pl

    return results, round(total_value, 2), round(total_pl, 2)
