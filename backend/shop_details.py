import jwt
import psycopg2
from functools import wraps
from flask import Blueprint, request, jsonify
from config import DB_CONFIG, SECRET_KEY

shop_bp = Blueprint('shop', __name__)

def get_db_connection():
    conn = psycopg2.connect(**DB_CONFIG)
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
        # Step 1: Insert the new shop and get its generated UUID
        cur.execute(
            "INSERT INTO shop (name, gstin, address) VALUES (%s, %s, %s) RETURNING id;",
            (name, gstin, address)
        )
        new_shop_id = cur.fetchone()[0]

        # Step 2: Update the users table to link this new shop to the user
        cur.execute(
            "UPDATE users SET shop_id = %s WHERE id = %s;",
            (new_shop_id, current_user_id)
        )
        
        # Commit both operations as a single transaction
        conn.commit()
        
        return jsonify({"message": "Shop created and linked successfully", "shop_id": new_shop_id}), 201

    except Exception as e:
        conn.rollback() # Rollback both operations if anything fails
        print(f"Error in create_shop: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        cur.close()
        conn.close()