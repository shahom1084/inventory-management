from dotenv import load_dotenv
load_dotenv()
import os
from flask import Flask
from auth import auth_bp
from shop_details import shop_bp
from homepage import homepage_bp
from items import items_bp
from bills import bills_bp
from customers import customers_bp
from flask_cors import CORS


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "https://inventoryandcustomermanagement.netlify.app"}})
app.register_blueprint(auth_bp)
app.register_blueprint(shop_bp)
app.register_blueprint(homepage_bp)
app.register_blueprint(items_bp)
app.register_blueprint(bills_bp)
app.register_blueprint(customers_bp)

@app.route('/')
def index():
    return "✅ Your backend server is running correctly and the API blueprint is registered!"


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)