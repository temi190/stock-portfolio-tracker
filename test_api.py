import requests

response = requests.post("http://127.0.0.1:5000/remove", json={
    "ticker": "AAPL",
    "shares_to_sell": 5
})

print(response.json())
