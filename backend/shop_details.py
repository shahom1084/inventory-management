import jwt
import psycopg2
from functools import wraps
from flask import Blueprint, request, jsonify
from config import DATABASE_URL, SECRET_KEY

shop_bp = Blueprint('shop', __name__)

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

@shop_bp.route('/api/shop', methods=['POST'])
@token_required
def create_shop(current_user_id):
    """Creates a new shop and links it to the current user."""
    data = request.get_json()
    name = data.get('name')
    gstin = data.get('gstin')
    address = data.get('address')

    if not name:
        return jsonify({"error": "Shop name is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Insert the new shop, link to current user via user_id
        cur.execute(
            "INSERT INTO shop (name, gstin, address, user_id) VALUES (%s, %s, %s, %s) RETURNING id;",
            (name, gstin, address, current_user_id)
        )
        new_shop_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({"message": "Shop created successfully", "shop_id": new_shop_id}), 201

    except Exception as e:
        conn.rollback()
        print(f"Error in create_shop: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        cur.close()
        conn.close()

@shop_bp.route('/api/shop', methods=['GET'])
@token_required
def get_shop(current_user_id):
    """Returns the current user's shop or 404 if none exists."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id, name, gstin, address FROM shop WHERE user_id = %s LIMIT 1;",
            (current_user_id,)
        )
        row = cur.fetchone()
        if not row:
            return jsonify({"error": "No shop found for user"}), 404
        shop = {"id": row[0], "name": row[1], "gstin": row[2], "address": row[3]}
        return jsonify({"shop": shop}), 200
    except Exception as e:
        print(f"Error in get_shop: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        cur.close()
        conn.close()