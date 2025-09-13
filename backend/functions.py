# utils.py
from db import get_db_connection

def fetch_items(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM shop WHERE user_id = %s;", (user_id,))
        shop_record = cur.fetchone()
        if not shop_record:
            return ("No shop is registered with this user.") 
        shop_id = shop_record[0]

        cur.execute(
            "SELECT id, name, description, cost_price, wholesale_price, retail_price, stock_quantity, si_unit "
            "FROM items WHERE shop_id=%s AND is_delete = 0;", (shop_id,)
        )
        items = cur.fetchall()

        items_list = [{
            "id": item[0],
            "name": item[1],
            "description": item[2],
            "cost_price": float(item[3]) if item[3] is not None else None,
            "wholesale_price": float(item[4]) if item[4] is not None else None,
            "retail_price": float(item[5]) if item[5] is not None else None,
            "stock_quantity": float(item[6]),
            "si_unit": item[7]
        } for item in items]

        return items_list
    finally:
        cur.close()
        conn.close()
