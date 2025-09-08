from flask import Blueprint, request, jsonify
from db import get_db_connection
from decorators import token_required
homepage_bp = Blueprint('homepage', __name__)
@homepage_bp.route('/api/homepage', methods=['GET'])
@token_required
def get_shop_name(current_user_id):
    conn=get_db_connection()
    cur=conn.cursor()
    try:
        cur.execute("SELECT id from shop where user_id=%s;",(current_user_id,))
        shop_record=cur.fetchone()
        if shop_record:
            shop_id=shop_record[0]
            cur.execute("SELECT name from shop where id=%s;",(shop_id,))
            shop_name=cur.fetchone()[0]
            return jsonify({"shopName":shop_name}),200
        else:
            return jsonify({"shopName":None,"message":"No shop associated with this user.Please register your shop"}),404
    except Exception as e:
        return jsonify({"error":str(e)}),500
    finally:
        cur.close()
        conn.close()