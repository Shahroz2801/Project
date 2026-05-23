from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import pymysql
import hashlib
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'techzone_secret_key_2024'
CORS(app)

# ─── DATABASE CONFIG ───────────────────────────────────────────────
DB_CONFIG = {
    'host':     'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
    'port':     4000,
    'user':     'FN9xZ3ZawWbMri6.root',
    'password': '72IRUkbvfxBMBHHK',   # ← paste your password here
    'database': 'sys',
    'ssl':      {'ca': '/etc/ssl/certs/ca-certificates.crt'},
    'cursorclass': pymysql.cursors.DictCursor,
    'connect_timeout': 10,
}

def get_db():
    return pymysql.connect(**DB_CONFIG)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# ─── INIT TABLES ───────────────────────────────────────────────────
def init_db():
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                full_name  VARCHAR(100) NOT NULL,
                email      VARCHAR(150) NOT NULL UNIQUE,
                password   VARCHAR(255) NOT NULL,
                phone      VARCHAR(20),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cart (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                user_id    INT NOT NULL,
                product_id VARCHAR(50) NOT NULL,
                name       VARCHAR(200) NOT NULL,
                price      DECIMAL(10,2) NOT NULL,
                quantity   INT DEFAULT 1,
                image      VARCHAR(300),
                added_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id         INT AUTO_INCREMENT PRIMARY KEY,
                name       VARCHAR(100) NOT NULL,
                email      VARCHAR(150) NOT NULL,
                subject    VARCHAR(200),
                message    TEXT NOT NULL,
                sent_at    DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id           INT AUTO_INCREMENT PRIMARY KEY,
                user_id      INT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status       VARCHAR(50) DEFAULT 'pending',
                ordered_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        conn.commit()
        cur.close(); conn.close()
        print("✅ Database tables ready.")
    except Exception as e:
        print(f"⚠️  DB init error: {e}")

# ─── PAGE ROUTES ───────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/register')
def register_page():
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('register.html')

@app.route('/cart')
def cart_page():
    return render_template('cart.html')

@app.route('/contact')
def contact_page():
    return render_template('contact.html')

@app.route('/products')
def products_page():
    return render_template('products.html')

# ─── AUTH API ──────────────────────────────────────────────────────
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    full_name = data.get('full_name', '').strip()
    email     = data.get('email', '').strip().lower()
    password  = data.get('password', '')
    phone     = data.get('phone', '').strip()

    if not all([full_name, email, password]):
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400

    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({'success': False, 'message': 'Email already registered.'}), 409

        cur.execute(
            "INSERT INTO users (full_name, email, password, phone) VALUES (%s, %s, %s, %s)",
            (full_name, email, hash_password(password), phone)
        )
        conn.commit()
        user_id = cur.lastrowid
        cur.close(); conn.close()

        session['user_id']   = user_id
        session['user_name'] = full_name
        session['user_email']= email
        return jsonify({'success': True, 'message': 'Account created!', 'name': full_name})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not all([email, password]):
        return jsonify({'success': False, 'message': 'Email and password required.'}), 400

    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute(
            "SELECT id, full_name, email FROM users WHERE email=%s AND password=%s",
            (email, hash_password(password))
        )
        user = cur.fetchone()
        cur.close(); conn.close()

        if user:
            session['user_id']    = user['id']
            session['user_name']  = user['full_name']
            session['user_email'] = user['email']
            return jsonify({'success': True, 'message': 'Welcome back!', 'name': user['full_name']})
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401
    except Exception as e:
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/session')
def get_session():
    if 'user_id' in session:
        return jsonify({'logged_in': True, 'name': session['user_name'], 'email': session['user_email']})
    return jsonify({'logged_in': False})

# ─── CART API ──────────────────────────────────────────────────────
@app.route('/api/cart', methods=['GET'])
def get_cart():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in.'}), 401
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute("SELECT * FROM cart WHERE user_id=%s ORDER BY added_at DESC", (session['user_id'],))
        items = cur.fetchall()
        cur.close(); conn.close()
        return jsonify({'success': True, 'cart': items})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Please login first.'}), 401
    data = request.get_json()
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute(
            "SELECT id, quantity FROM cart WHERE user_id=%s AND product_id=%s",
            (session['user_id'], data['product_id'])
        )
        existing = cur.fetchone()
        if existing:
            cur.execute(
                "UPDATE cart SET quantity=quantity+1 WHERE id=%s",
                (existing['id'],)
            )
        else:
            cur.execute(
                "INSERT INTO cart (user_id, product_id, name, price, quantity, image) VALUES (%s,%s,%s,%s,%s,%s)",
                (session['user_id'], data['product_id'], data['name'], data['price'], 1, data.get('image',''))
            )
        conn.commit(); cur.close(); conn.close()
        return jsonify({'success': True, 'message': 'Added to cart!'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/cart/update', methods=['POST'])
def update_cart():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in.'}), 401
    data = request.get_json()
    try:
        conn = get_db(); cur = conn.cursor()
        if data['quantity'] <= 0:
            cur.execute("DELETE FROM cart WHERE id=%s AND user_id=%s", (data['cart_id'], session['user_id']))
        else:
            cur.execute("UPDATE cart SET quantity=%s WHERE id=%s AND user_id=%s",
                        (data['quantity'], data['cart_id'], session['user_id']))
        conn.commit(); cur.close(); conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/cart/remove', methods=['POST'])
def remove_from_cart():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in.'}), 401
    data = request.get_json()
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute("DELETE FROM cart WHERE id=%s AND user_id=%s", (data['cart_id'], session['user_id']))
        conn.commit(); cur.close(); conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/cart/checkout', methods=['POST'])
def checkout():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in.'}), 401
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute("SELECT SUM(price*quantity) as total FROM cart WHERE user_id=%s", (session['user_id'],))
        row = cur.fetchone()
        total = row['total'] or 0
        cur.execute("INSERT INTO orders (user_id, total_amount) VALUES (%s,%s)", (session['user_id'], total))
        cur.execute("DELETE FROM cart WHERE user_id=%s", (session['user_id'],))
        conn.commit(); cur.close(); conn.close()
        return jsonify({'success': True, 'message': 'Order placed successfully!'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ─── CONTACT API ───────────────────────────────────────────────────
@app.route('/api/contact', methods=['POST'])
def contact():
    data    = request.get_json()
    name    = data.get('name', '').strip()
    email   = data.get('email', '').strip()
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()

    if not all([name, email, message]):
        return jsonify({'success': False, 'message': 'Name, email and message are required.'}), 400
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute(
            "INSERT INTO contacts (name, email, subject, message) VALUES (%s,%s,%s,%s)",
            (name, email, subject, message)
        )
        conn.commit(); cur.close(); conn.close()
        return jsonify({'success': True, 'message': 'Message sent! We\'ll reply soon.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ─── RUN ───────────────────────────────────────────────────────────
if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
