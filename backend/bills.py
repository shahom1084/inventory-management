from flask import Blueprint, request, jsonify
from db import get_db_connection
from decorators import token_required
from items import get_items
import json
bills_bp = Blueprint('bills', __name__)

@bills_bp.route('/api/bills', methods=['GET'])
@token_required
def get_bills(current_user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (current_user_id,))
        shop_record = cur.fetchone()
        if not shop_record:
            return jsonify({"error": "No shop associated with this user.Please register your shop"}), 404
        
        shop_id = shop_record[0]
        cur.execute("SELECT id,customer_id,total_amount, created_at FROM bills WHERE shop_id = %s ORDER BY created_at DESC;", (shop_id,))
        bills = cur.fetchall()
        
        bills_list = [
            {"id": bill[0], "customer_id":bill[1],"totalAmount": float(bill[2]), "createdAt": bill[3].isoformat()}
            for bill in bills
        ]
        
        return jsonify({"bills": bills_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@bills_bp.route('/api/start-bills', methods=['POST','GET'])
@token_required
def create_bill(current_user_id):
    data = request.get_json()
    customer_phone = data.get('phoneNumber')
    customer_name = data.get('name')
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (current_user_id,))
        shop_record = cur.fetchone()
        if not shop_record:
            return jsonify({"error": "No shop associated with this user.Please register your shop"}), 404
        
        shop_id = shop_record[0]
        
        cur.execute("SELECT id FROM customers WHERE phone_number = %s AND shop_id = %s;", (customer_phone, shop_id))
        customer_record = cur.fetchone()
        
        if not customer_record:
            cur.execute("INSERT INTO customers (phone_number, shop_id,name) VALUES (%s, %s) RETURNING id;", (customer_phone, shop_id,customer_name))
            customer_id = cur.fetchone()[0]
            conn.commit()
        else:
            customer_id = customer_record[0]
        items_j=get_items(current_user_id)
        items=json.loads(items_j.get_data())
        print(items)
        return None 
    except Exception as e:
        return jsonify({"error": str(e)}), 500
