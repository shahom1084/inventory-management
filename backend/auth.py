import bcrypt
import jwt
import psycopg2
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from config import DB_CONFIG, SECRET_KEY

auth_bp = Blueprint('auth', __name__)

def get_db_connection():
    """Helper function to create a database connection."""
    conn = psycopg2.connect(**DB_CONFIG)
    return conn

@auth_bp.route('/api/check-user', methods=['POST'])
def check_user():
    """Checks if a user's phone number is already in the database."""
    phone_number = request.get_json().get('phoneNumber')
    if not phone_number or len(phone_number) != 10:
        return jsonify({"error": "A valid 10-digit phone number is required"}), 400
        
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM users WHERE phone_number = %s;", (phone_number,))
        user_exists = cur.fetchone() is not None
        return jsonify({"exists": user_exists})
    finally:
        cur.close()
        conn.close()

@auth_bp.route('/api/session', methods=['POST'])
def create_session():
    """
    Handles both login and registration after validating the temporary OTP.
    This is now the single endpoint for creating a user session.
    """
    data = request.get_json()
    phone_number = data.get('phoneNumber')
    password = data.get('password')
    entered_otp = data.get('otp')

    # --- NEW: OTP Verification Step ---
    # The temporary OTP logic is now securely on the server.
    # In a real app, you would compare this to a securely generated and stored OTP.
    correct_otp = phone_number[-4:]
    if entered_otp != correct_otp:
        # If the OTP is wrong, we stop right here.
        return jsonify({"error": "Invalid OTP"}), 401 # 401 Unauthorized is appropriate

    # --- EXISTING LOGIC: Proceeds only if OTP is correct ---
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, password_hash FROM users WHERE phone_number = %s;", (phone_number,))
        user_record = cur.fetchone()
        has_shop=False
        user_id = None
        if user_record:

            user_id = user_record[0]
            stored_hash = user_record[1].encode('utf-8')
            cur.execute("SELECT 1 FROM shop WHERE user_id = %s;", (user_id,))
            has_shop = cur.fetchone() is not None
            if not bcrypt.checkpw(password.encode('utf-8'), stored_hash):
                return jsonify({"error": "Invalid password"}), 401
        else:
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
            cur.execute(
                "INSERT INTO users (phone_number, password_hash) VALUES (%s, %s) RETURNING id;",
                (phone_number, hashed_password.decode('utf-8'))
            )
            user_id = cur.fetchone()[0]
            conn.commit()

        # If we have a valid user_id (from either login or signup), create the token
        if user_id:

            token = jwt.encode({
                'user_id': user_id, # It's better to use the non-sensitive primary key (id) in the token
                'exp': datetime.utcnow() + timedelta(days=365) # Shorter expiry is safer in real apps
            }, SECRET_KEY, algorithm="HS256")
            return jsonify({"message": "Session created successfully", "token": token,"has_shop": has_shop}), 200
        else:
            # This case should ideally not be reached if logic is correct
            return jsonify({"error": "Could not log in or create user"}), 500

    except Exception as e:
        conn.rollback()
        print(f"An error occurred: {e}") # It's good to log the actual error on the server
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        cur.close()
        conn.close()