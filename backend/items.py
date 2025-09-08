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
            return jsonify({"error": "No shop associated with this user. Please register your shop."}), 404
        shop_id = shop_record[0]
        cur.execute("SELECT id, name, description, cost_price, wholesale_price, retail_price, stock_quantity, si_unit FROM items WHERE shop_id=%s;", (shop_id,))
        items = cur.fetchall()
        items_list = [{
            "id": item[0],
            "name": item[1],
            "description": item[2],
            "cost_price": str(item[3]) if item[3] is not None else None,
            "wholesale_price": str(item[4]) if item[4] is not None else None,
            "retail_price": str(item[5]) if item[5] is not None else None,
            "stock_quantity": item[6],
            "si_unit": item[7]
        } for item in items]
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
    si_unit = data.get('si_unit')

    if not name or not retail_price:
        return jsonify({"error": "Missing required fields"}), 400

    cost_price = cost_price if cost_price else None
    wholesale_price = wholesale_price if wholesale_price else None
    stock_quantity = stock_quantity if stock_quantity else 0

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (current_user_id,))
        shop_record = cur.fetchone()
        if not shop_record:
            return jsonify({"error": "No shop associated with this user. Please register your shop."}), 404
        shop_id = shop_record[0]
        cur.execute(
            "INSERT INTO items (shop_id, name, description, cost_price, wholesale_price, retail_price, stock_quantity, si_unit) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);",
            (shop_id, name, description, cost_price, wholesale_price, retail_price, stock_quantity, si_unit)
        )
        conn.commit()
        return jsonify({"message": "Item created successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@items_bp.route('/api/items/<string:item_id>', methods=['PUT'])
@token_required
def update_item(current_user_id, item_id):
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    cost_price = data.get('cost_price')
    wholesale_price = data.get('wholesale_price')
    retail_price = data.get('retail_price')
    stock_quantity = data.get('stock_quantity')
    si_unit = data.get('si_unit')

    if not name or not retail_price:
        return jsonify({"error": "Missing required fields"}), 400

    cost_price = cost_price if cost_price else None
    wholesale_price = wholesale_price if wholesale_price else None

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT shop.user_id FROM items JOIN shop ON items.shop_id = shop.id WHERE items.id = %s;", (item_id,))
        item_owner_record = cur.fetchone()
        if not item_owner_record or item_owner_record[0] != current_user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        cur.execute(
            '''
            UPDATE items 
            SET name = %s, description = %s, cost_price = %s, wholesale_price = %s, retail_price = %s, stock_quantity = %s, si_unit = %s
            WHERE id = %s;
            ''',
            (name, description, cost_price, wholesale_price, retail_price, stock_quantity, si_unit, item_id)
        )
        conn.commit()
        return jsonify({"message": "Item updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@items_bp.route('/api/items/<string:item_id>', methods=['DELETE'])
@token_required
def delete_item(current_user_id, item_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT shop.user_id FROM items JOIN shop ON items.shop_id = shop.id WHERE items.id = %s;", (item_id,))
        item_owner_record = cur.fetchone()
        if not item_owner_record or item_owner_record[0] != current_user_id:
            return jsonify({"error": "Unauthorized"}), 403

        cur.execute("DELETE FROM items WHERE id = %s;", (item_id,))
        conn.commit()
        
        if cur.rowcount == 0:
            return jsonify({"error": "Item not found"}), 404

        return jsonify({"message": "Item deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@items_bp.route('/api/items/<string:item_id>/stock', methods=['PATCH'])
@token_required
def update_stock(current_user_id, item_id):
    data = request.get_json()
    action = data.get('action')

    if action not in ['increment', 'decrement']:
        return jsonify({"error": "Invalid action"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT shop.user_id, items.stock_quantity FROM items JOIN shop ON items.shop_id = shop.id WHERE items.id = %s;", (item_id,))
        record = cur.fetchone()
        if not record or record[0] != current_user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        current_stock = record[1]
        
        if action == 'increment':
            new_stock = current_stock + 1
        else: # decrement
            if current_stock <= 0:
                return jsonify({"error": "Stock cannot be less than zero"}), 400
            new_stock = current_stock - 1

        cur.execute("UPDATE items SET stock_quantity = %s WHERE id = %s;", (new_stock, item_id))
        conn.commit()

        return jsonify({"message": "Stock updated successfully", "new_stock_quantity": new_stock}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()