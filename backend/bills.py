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
        cur.execute("""
            SELECT b.id, b.customer_id, c.name, b.total_amount, b.bill_date, b.status, b.amount_paid 
            FROM bills b
            LEFT JOIN customers c ON b.customer_id = c.id
            WHERE b.shop_id = %s
        """, (shop_id,))
        bills = cur.fetchall()
        
        bills_list = [
            {
                "id": bill[0], 
                "customer_id": bill[1],
                "customer_name": bill[2] or "Walk-in",
                "totalAmount": float(bill[3]), 
                "createdAt": bill[4].isoformat(), 
                "status": bill[5],
                "amountPaid": float(bill[6]) if bill[6] is not None else 0
            }
            for bill in bills
        ]
        
        return jsonify({"bills": bills_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@bills_bp.route('/api/bills/<string:bill_id>', methods=['GET'])
@token_required
def get_bill_details(current_user_id, bill_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # First, verify the bill belongs to the user's shop
        cur.execute("""
            SELECT b.id FROM bills b
            JOIN shop s ON b.shop_id = s.id
            WHERE b.id = %s AND s.user_id = %s;
        """, (bill_id, current_user_id))
        bill_record = cur.fetchone()
        if not bill_record:
            return jsonify({"error": "Bill not found or access denied"}), 404

        # Fetch bill details
        cur.execute("""
            SELECT b.id, b.customer_id, c.name, b.total_amount, b.bill_date, b.status, b.amount_paid 
            FROM bills b
            LEFT JOIN customers c ON b.customer_id = c.id
            WHERE b.id = %s
        """, (bill_id,))
        bill = cur.fetchone()

        if not bill:
            return jsonify({"error": "Bill not found"}), 404

        # Fetch bill items
        cur.execute("""
            SELECT bi.item_id, i.name, bi.quantity, bi.price_per_unit
            FROM bill_items bi
            JOIN items i ON bi.item_id = i.id
            WHERE bi.bill_id = %s
        """, (bill_id,))
        items = cur.fetchall()

        bill_details = {
            "id": bill[0],
            "customer_id": bill[1],
            "customer_name": bill[2] or "Walk-in",
            "totalAmount": float(bill[3]),
            "createdAt": bill[4].isoformat(),
            "status": bill[5],
            "amountPaid": float(bill[6]) if bill[6] is not None else 0,
            "items": [
                {
                    "id": item[0],
                    "name": item[1],
                    "quantity": item[2],
                    "price": float(item[3])
                }
                for item in items
            ]
        }
        
        return jsonify(bill_details), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@bills_bp.route('/api/start-bills', methods=['POST','GET'])
@token_required
def create_bill(current_user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (current_user_id,))
        shop_record = cur.fetchone()
        if not shop_record:
            return jsonify({"error": "No shop associated with this user.Please register your shop"}), 404  
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
@bills_bp.route('/api/create-bill', methods=['POST'])
@token_required
def create_new_bill(current_user_id):
    data = request.get_json()
    customer_name = data.get('customerName')
    customer_phone = data.get('customerPhone')
    bill_items = data.get('billItems')
    total_amount = data.get('totalAmount')
    status = data.get('status')
    amount_paid = data.get('amountPaid')

    if not bill_items or not isinstance(bill_items, list) or len(bill_items) == 0:
        return jsonify({"error": "At least one item is required to create a bill."} ), 400

    # Handle amount_paid based on status
    if status == 'paid':
        amount_paid = total_amount
    elif status == 'unpaid':
        amount_paid = 0
    elif status == 'partial':
        if amount_paid is None:
            amount_paid = total_amount 

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (current_user_id,))
        shop_record = cur.fetchone()
        if not shop_record:
            return jsonify({"error": "No shop associated with this user."} ), 404
        shop_id = shop_record[0]

        customer_id = None
        if customer_name or customer_phone:
            if customer_phone:
                cur.execute("SELECT id FROM customers WHERE phone_number = %s AND shop_id = %s;", (customer_phone, shop_id))
                customer_record = cur.fetchone()
                if customer_record:
                    customer_id = customer_record[0]
            
            if not customer_id and customer_name:
                cur.execute("SELECT id FROM customers WHERE name = %s AND shop_id = %s;", (customer_name, shop_id))
                customer_record = cur.fetchone()
                if customer_record:
                    customer_id = customer_record[0]

            if not customer_id:
                cur.execute(
                    "INSERT INTO customers (name, phone_number, shop_id) VALUES (%s, %s, %s) RETURNING id;",
                    (customer_name, customer_phone, shop_id)
                )
                customer_id = cur.fetchone()[0]
        
        # Insert into bills table
        cur.execute(
            """
            INSERT INTO bills (shop_id, customer_id, total_amount, status, amount_paid) 
            VALUES (%s, %s, %s, %s, %s) RETURNING id;
            """,
            (shop_id, customer_id, total_amount, status, amount_paid)
        )
        bill_id = cur.fetchone()[0]

        # Insert into bill_items table
        for item in bill_items:
            item_id = item.get('item').get('id')
            quantity = item.get('quantity')
            price = item.get('price')

            if not item_id or not quantity or price is None:
                conn.rollback()
                return jsonify({"error": "Each item must have item_id, quantity, and price."} ), 400

            cur.execute(
                """
                INSERT INTO bill_items (bill_id, item_id, quantity, price_per_unit) 
                VALUES (%s, %s, %s, %s);
                """,
                (bill_id, item_id, quantity, price)
            )

            # Save custom price if necessary
            if customer_id:
                cur.execute("SELECT retail_price, wholesale_price FROM items WHERE id = %s;", (item_id,))
                item_prices = cur.fetchone()
                if item_prices:
                    retail_price, wholesale_price = item_prices
                    # Using 'is not' for precise comparison with None
                    is_standard_price = (price is not None and retail_price is not None and float(price) == float(retail_price)) or \
                                        (price is not None and wholesale_price is not None and float(price) == float(wholesale_price))

                    if not is_standard_price:
                        # Upsert into customer_item_prices
                        cur.execute(
                            """
                            INSERT INTO customer_item_prices (customer_id, item_id, custom_price)
                            VALUES (%s, %s, %s)
                            ON CONFLICT (customer_id, item_id) DO UPDATE SET custom_price = EXCLUDED.custom_price;
                            """,
                            (customer_id, item_id, price)
                        )

        conn.commit()
        return jsonify({"message": "Bill created successfully", "bill_id": bill_id}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()