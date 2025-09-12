from flask import Blueprint, request, jsonify
from db import get_db_connection
from decorators import token_required
from functions import fetch_items
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
        cur.execute("SELECT id,customer_id,total_amount, bill_date FROM bills WHERE shop_id = %s", (shop_id,))
        bills = cur.fetchall()
        
        bills_list = [
            {"id": bill[0], "customer_id":bill[1],"totalAmount": float(bill[2]), "bill_date": bill[3].isoformat()}
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
            cur.execute("INSERT INTO customers (phone_number, shop_id,name) VALUES (%s, %s, %s) RETURNING id;", (customer_phone, shop_id,customer_name))
            customer_id = cur.fetchone()[0]
            conn.commit()
        else:
            customer_id = customer_record[0]
        
        items = fetch_items(current_user_id)
        if isinstance(items, str):
            return jsonify({"error": items}), 404

        return jsonify({"items": items})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bills_bp.route('/api/customer-prices', methods=['GET'])
@token_required
def get_customer_prices(current_user_id):
    phone_number = request.args.get('phone_number')
    if not phone_number or len(phone_number) != 10:
        return jsonify({"error": "A 10-digit phone number is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (current_user_id,))
        shop_record = cur.fetchone()
        if not shop_record:
            return jsonify({"error": "No shop associated with this user."}), 404
        shop_id = shop_record[0]

        cur.execute("SELECT id FROM customers WHERE TRIM(phone_number) = %s AND shop_id = %s;", (phone_number, shop_id))
        customer_record = cur.fetchone()

        all_items = fetch_items(current_user_id)
        if isinstance(all_items, str):
            return jsonify({"error": all_items}), 404

        if not customer_record:
            return jsonify({"items": all_items, "customer_items": []}), 200

        customer_id = customer_record[0]

        cur.execute("""
            SELECT item_id, custom_price
            FROM customer_item_prices
            WHERE customer_id = %s;
        """, (customer_id,))
        customer_prices_records = cur.fetchall()
        
        customer_prices_map = {str(record[0]): float(record[1]) for record in customer_prices_records}

        customer_items = []
        for item in all_items:
            item_id_str = str(item['id'])
            if item_id_str in customer_prices_map:
                customer_item = item.copy()
                customer_item['custom_price'] = customer_prices_map[item_id_str]
                customer_items.append(customer_item)

        return jsonify({"items": all_items, "customer_items": customer_items}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()