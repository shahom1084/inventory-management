from flask import Flask
from auth import auth_bp
from shop_details import shop_bp
from homepage import homepage_bp
from items import items_bp
app = Flask(__name__)

app.register_blueprint(auth_bp)
app.register_blueprint(shop_bp)
app.register_blueprint(homepage_bp)
app.register_blueprint(items_bp)
@app.route('/')
def index():
    return "✅ Your backend server is running correctly and the API blueprint is registered!"


if __name__ == '__main__':
    app.run(debug=True, port=5000)

