from flask import Blueprint, request, jsonify
from db import get_db_connection
from decorators import token_required

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/api/customers', methods=['GET'])
@token_required
def get_customers(current_user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (current_user_id,))
        shop_id = cur.fetchone()[0]

        cur.execute("SELECT id, name, phone_number, email, address FROM customers WHERE shop_id = %s AND is_delete = 0 ORDER BY name;", (shop_id,))
        customers = cur.fetchall()
        
        customers_list = [
            {"id": c[0], "name": c[1], "phone_number": c[2], "email": c[3], "address": c[4]}
            for c in customers
        ]
        
        return jsonify({"customers": customers_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@customers_bp.route('/api/customers', methods=['POST'])
@token_required
def create_customer(current_user_id):
    data = request.get_json()
    name = data.get('name')
    phone_number = data.get('phone_number')
    email = data.get('email')
    address = data.get('address')

    if not any([name, phone_number, email, address]):
        return jsonify({"error": "At least one field (name, phone, email, or address) is required."}), 400

    if phone_number and len(phone_number) != 10:
        return jsonify({"error": "Phone number must be 10 digits."}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (current_user_id,))
        shop_id = cur.fetchone()[0]

        if phone_number:
            cur.execute("SELECT id FROM customers WHERE phone_number = %s;", (phone_number,))
            if cur.fetchone():
                return jsonify({"error": "A customer with this phone number already exists"}), 409

        cur.execute("INSERT INTO customers (name, phone_number, email, address, shop_id) VALUES (%s, %s, %s, %s, %s) RETURNING id;", (name, phone_number, email, address, shop_id))
        new_customer_id = cur.fetchone()[0]
        conn.commit()
        
        return jsonify({"message": "Customer created successfully", "id": new_customer_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@customers_bp.route('/api/customers/<string:customer_id>', methods=['PUT'])
@token_required
def update_customer(current_user_id, customer_id):
    data = request.get_json()
    name = data.get('name')
    phone_number = data.get('phone_number')
    email = data.get('email')
    address = data.get('address')

    if not any([name, phone_number, email, address]):
        return jsonify({"error": "At least one field (name, phone, email, or address) is required."}), 400

    if phone_number and len(phone_number) != 10:
        return jsonify({"error": "Phone number must be 10 digits."}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (current_user_id,))
        shop_id = cur.fetchone()[0]

        cur.execute("SELECT id FROM customers WHERE id = %s AND shop_id = %s;", (customer_id, shop_id))
        if not cur.fetchone():
            return jsonify({"error": "Customer not found or access denied"}), 404

        cur.execute("UPDATE customers SET name = %s, phone_number = %s, email = %s, address = %s WHERE id = %s;", (name, phone_number, email, address, customer_id))
        conn.commit()
        
        return jsonify({"message": "Customer updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@customers_bp.route('/api/customers/<string:customer_id>', methods=['DELETE'])
@token_required
def delete_customer(current_user_id, customer_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (current_user_id,))
        shop_id = cur.fetchone()[0]

        cur.execute("SELECT id FROM customers WHERE id = %s AND shop_id = %s;", (customer_id, shop_id))
        if not cur.fetchone():
            return jsonify({"error": "Customer not found or access denied"}), 404

        cur.execute("UPDATE customers SET is_delete = 1 WHERE id = %s;", (customer_id,))
        conn.commit()
        
        return jsonify({"message": "Customer deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
