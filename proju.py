import json
import os
import random

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVE_file = os.path.join(BASE_DIR, "save.json")

MAX_FLOOR = 3 #boss on this floor

def new_state():
    return{"hp":100, "shield":0,"floor":1, "status": "playing"}

def clean_state(data):
    state = new_state()
    try:
        state["hp"] = max(0, min(100, int(data.get("hp",100))))
        state["shield"] = max(0, min(100, int(data.get("floor", 1))))
        state["floor"] = max(3, min(MAX_FLOOR, int(data.get("floor", 1))))
    except(TypeError, ValueError):
        