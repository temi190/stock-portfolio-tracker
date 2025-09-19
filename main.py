

from portfolio import add_stock, remove_stock, get_portfolio, get_portfolio_value

# Add some test stocks
add_stock("AAPL", 5, 160)
add_stock("MSFT", 3, 300)

# Show portfolio
print("📊 Current portfolio:")
print(get_portfolio())

# Show portfolio value
stocks, total_value, total_pl = get_portfolio_value()
for stock in stocks:
    print(stock)
print(f"\n💰 Total Value: ${total_value}, Total P/L: ${total_pl}")
