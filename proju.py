import json
import os
import random

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVE_FILE = os.path.join(BASE_DIR, "save.json")

MAX_FLOOR = 3 #biggest boss on this floor

def new_state():
    return {"hp": 100, "shield": 0, "floor": 1, "status": "playing", "inventory": []}

def clean_state(data):
    state = new_state()
    try:
        state["hp"] = max(0, min(100, int(data.get("hp", 100))))
        state["shield"] = max(0, min(100, int(data.get("shield", 0))))
        state["floor"] = max(1, min(MAX_FLOOR, int(data.get("floor", 1))))
        status = data.get("status", "playing")
        state["status"] = status if status in ("playing", "won", "dead") else "playing"
        inv = data.get("inventory", [])
        state["inventory"] = [i for i in inv if i in ("sword", "potion", "shield")]
    except (TypeError, ValueError):
        return new_state()
    return state

def load_state():
    if not os.path.exists(SAVE_FILE):
        return new_state()
    try:
        with open(SAVE_FILE, "r", encoding="utf-8") as f:
            return clean_state(json.load(f))
    except (json.JSONDecodeError, OSError):
        return new_state()

def save_state(state):
    with open(SAVE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/state")
def get_state():
    return jsonify(load_state())

@app.route("/api/attack", methods=["POST"])
def attack():
    state = load_state()
    if state["status"] != "playing":
        return jsonify(state)

    damage = random.randint(5, 20)
    if state["shield"] > 0:
        absorbed = min(state["shield"], damage)
        state["shield"] -= absorbed
        damage -= absorbed
    state["hp"] = max(0, state["hp"] - damage)

    if state["hp"] == 0:
        state["status"] = "dead"
    save_state(state)
    return jsonify(state)

@app.route("/api/reset", methods=["POST"])
def reset():
    state = new_state()
    save_state(state)
    return jsonify(state)

if __name__ == "__main__":
    app.run(debug=True)
