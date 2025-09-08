from flask import Blueprint, request, jsonify
from db import get_db_connection
from decorators import token_required

items_bp = Blueprint('items', __name__)
@items_bp.route('/api/items', methods=['GET'])
@token_required
def get_items(current_user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (current_user_id,))
        shop_record = cur.fetchone()
        if not shop_record:
            return jsonify({"error": "No shop associated with this user.Please register you shop."}), 404
        shop_id = shop_record[0]
        cur.execute("SELECT name,description,cost_price,wholesale_price,retail_price,stock_quantity from items where shop_id=%s;",(shop_id,))
        items = cur.fetchall()
        items_list = []
        for item in items:
            items_list.append({
                "name": item[0],
                "description": item[1],
                "cost_price": str(item[2]),
                "wholesale_price": str(item[3]),
                "retail_price": str(item[4]),
                "stock_quantity": item[5]
            })
        return jsonify({"items": items_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@items_bp.route('/api/create-items', methods=['POST'])
@token_required
def create_item(current_user_id):
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    cost_price = data.get('cost_price')
    wholesale_price = data.get('wholesale_price')
    retail_price = data.get('retail_price')
    stock_quantity = data.get('stock_quantity')

    if not name or not retail_price:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (current_user_id,))
        shop_record = cur.fetchone()
        if not shop_record:
            return jsonify({"error": "No shop associated with this user.Please register your shop."}), 404
        shop_id = shop_record[0]
        cur.execute(
            "INSERT INTO items (shop_id, name, description, cost_price, wholesale_price, retail_price, stock_quantity) VALUES (%s, %s, %s, %s, %s, %s, %s);",
            (shop_id, name, description, cost_price, wholesale_price, retail_price, stock_quantity)
        )
        conn.commit()
        return jsonify({"message": "Item created successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()