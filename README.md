# WAMP Setup Instructions for Accountancy Dashboard

## 1. Prerequisites
- Install [WAMP Server](https://www.wampserver.com/en/)
- PHP and MySQL are included with WAMP

## 2. Project Setup
1. Copy the entire `DBMS Working FE` folder to your WAMP `www` directory (usually `C:/wamp64/www/`).
2. Start WAMP and ensure Apache and MySQL services are running (green icon in system tray).
3. Access the project in your browser:
   - Go to `http://localhost/DBMS%20Working%20FE/` (or the folder name you used)

## 3. Database Setup
- The project will automatically create the database and tables on first run (see `database.php`).
- Default MySQL user: `root`, password: (empty)
- Database name: `accountancy_dashboard`

## 4. Default Admin Login
- Email: `admin@accountancy.com`
- Password: `admin123`

## 5. Troubleshooting
- If you see session errors, check your PHP session save path in `php.ini`.
- If you get database connection errors, ensure MySQL is running and credentials in `config.php` are correct.
- For any path issues, always use the full URL: `http://localhost/DBMS%20Working%20FE/`

## 6. File Structure
- PHP backend: `.php` files in root and `api/`
- Frontend: `.html` and `js/`, `css/`
- All AJAX/fetch and form actions use relative paths for WAMP compatibility.

---

If you have any issues, check the browser console and WAMP logs for details.
