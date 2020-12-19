import os
import json

from flask import Flask, Response
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_pymongo import PyMongo
from bson.json_util import dumps
from dotenv import load_dotenv
load_dotenv()

DB_USERNAME = os.environ.get('DB_USERNAME')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_HOST = os.environ.get('DB_HOST')
DB_NAME = os.environ.get('DB_NAME')

app = Flask(__name__)
CORS(app)
app.config["MONGO_URI"] = f"mongodb+srv://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}?retryWrites=true&w=majority"
mongo = PyMongo(app)
pixels_collection = mongo.db.pixels
socketio = SocketIO(app, cors_allowed_origins='*')

user_count = 0


@socketio.on('connect')
def handle_connect():
    global user_count
    user_count += 1
    emit('user count', user_count, broadcast=True)
    pixels_str = dumps(pixels_collection.find())
    pixels_arr = json.loads(pixels_str)
    pixels = {}
    for pixel in pixels_arr:
        pixels[pixel['id']] = pixel['color']
    pixels.update({
        'maxRow': 100,
        'maxCol': 100
    })
    emit('pixels', pixels)


@socketio.on('disconnect')
def handle_disconnect():
    global user_count
    user_count -= 1
    emit('user count', user_count, broadcast=True)


@socketio.on('change color')
def handle_change_color(pixel_data):
    pixels_collection.replace_one(
        {
            'id': pixel_data['id']
        },
        pixel_data,
        upsert=True
    )
    pixel = {pixel_data['id']: pixel_data['color']}
    emit('color changed', pixel, broadcast=True)


@app.route('/ping')
def hello_world():
    return Response('pong')


if __name__ == '__main__':
    socketio.run(
        app, host='0.0.0.0', port=5000
    )
