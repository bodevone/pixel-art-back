import os

from flask import Flask
from flask_socketio import SocketIO, emit
from flask_mongoengine import MongoEngine
from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['MONGODB_SETTINGS'] = {
    'db': os.environ.get('MONGO_DB'),
    'host': os.environ.get('MONGO_HOST'),
    'port': os.environ.get('MONGO_PORT'),
    'username': os.environ.get('MONGO_USERNAME'),
    'password': os.environ.get('MONGO_PASSWORD')
}
db = MongoEngine(app)
socketio = SocketIO(app)

if __name__ == '__main__':
    socketio.run(app)


@socketio.on('connect')
def test_connect():
    emit('my response', {'data': 'Connected'})


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


@socketio.on('change color')
def handle_change_color():
    pass