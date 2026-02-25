from flask import Flask, request, jsonify
from datetime import datetime, timedelta

app = Flask(__name__)


@app.post("/analyze")
def analyze():
    data = request.get_json(force=True)
    text = data.get("text", "")
    discount = float(data.get("discount", 0) or 0)

    # Dummy AI: parse baris yang mengandung angka sebagai "item harga"
    items = []
    total = 0.0

    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        # Cari angka terakhir di baris sebagai harga
        parts = line.split()
        price = None
        for part in reversed(parts):
            try:
                price = float(part.replace(",", ""))
                break
            except ValueError:
                continue
        if price is not None:
            description = " ".join(p for p in parts if p != str(price))
            items.append({"description": description or "Item", "price": price})
            total += price

    total_after_discount = max(total - discount, 0)

    suggested_due = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")

    return jsonify(
        {
            "items": items,
            "totalAmount": total_after_discount,
            "suggestedDueDate": suggested_due,
        }
    )


if __name__ == "__main__":
    app.run(port=5001, debug=True)


