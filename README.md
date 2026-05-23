# ⚡ TechZone — Computer Accessories Store

A full-stack e-commerce website with Flask (Python), HTML, CSS, and JavaScript, connected to TiDB Cloud (MySQL-compatible).

---

## 📁 Project Structure

```
techzone/
├── app.py                  ← Python/Flask backend (API + routes)
├── requirements.txt        ← Python dependencies
├── templates/
│   ├── base.html           ← Shared navbar/footer layout
│   ├── index.html          ← Home page
│   ├── login.html          ← Login page
│   ├── register.html       ← Register page
│   ├── products.html       ← Products page
│   ├── cart.html           ← Cart page
│   └── contact.html        ← Contact page
└── static/
    ├── css/
    │   └── style.css       ← All styles
    └── js/
        ├── main.js         ← Shared JS (session, toast, cart badge)
        ├── auth.js         ← Login/Register/Contact form handlers
        ├── products.js     ← Product grid + filter logic
        └── cart.js         ← Cart CRUD operations
```

---

## 🚀 Setup & Run Locally

### 1. Install Python 3.10+

### 2. Install dependencies
```bash
cd techzone
pip install -r requirements.txt
```

### 3. Set your database password
Open `app.py` and find line:
```python
'password': 'YOUR_DB_PASSWORD_HERE',
```
Replace with your actual TiDB password.

### 4. Run the server
```bash
python app.py
```
Visit: **http://localhost:5000**

---

## 🌐 Deploy to Production (PythonAnywhere — Free)

1. Create a free account at https://www.pythonanywhere.com
2. Upload all files via the Files tab
3. Open a Bash console and run:
   ```bash
   pip3 install --user flask flask-cors pymysql cryptography
   ```
4. Go to **Web** tab → Add a new web app → Flask → Python 3.10
5. Set **Source code** to `/home/yourusername/techzone`
6. Set **WSGI file** path and edit it:
   ```pythonz
   import sys
   sys.path.insert(0, '/home/yourusername/techzone')
   from app import app as application
   ```
7. Reload the web app → your site is live!

---

## 🌐 Deploy to Render (Free tier)

1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
5. Add environment variable: `DB_PASSWORD=your_password`
6. Update `app.py` to use `os.environ.get('DB_PASSWORD')`

---

## 🗄️ Database (TiDB Cloud)

Connection details in `app.py`:
- **Host:** gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com
- **Port:** 4000
- **User:** FN9xZ3ZawWbMri6.root
- **Database:** sys

### Tables auto-created on startup:
| Table | Purpose |
|-------|---------|
| `users` | Login/register accounts |
| `cart` | Cart items per user |
| `contacts` | Contact form submissions |
| `orders` | Completed checkout orders |

---

## 🔐 Security Notes

- Passwords are SHA-256 hashed before storage
- Sessions managed server-side with Flask
- SSL required for TiDB connection (included)
- **Change your DB password after sharing it**

---

## 📦 Features

- ✅ Register & Login (saved to DB)
- ✅ Session-based authentication
- ✅ Product catalog with category filters
- ✅ Add to cart (requires login)
- ✅ Cart management (qty, remove, checkout)
- ✅ Order placement (saved to DB)
- ✅ Contact form (saved to DB)
- ✅ Responsive design (mobile friendly)
- ✅ Modern dark UI with animations
