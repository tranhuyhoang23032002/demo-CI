const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Kết nối đến PostgreSQL
const pool = new Pool({
    user: 'leehoang_user',
    host: 'dpg-cs7niqqj1k6c73fk2700-a.singapore-postgres.render.com',
    database: 'leehoang',
    password: 'HCrpWSYSqlkfuJvMYmcywpbq8w3EvQm5',
    port: 5432,
    ssl: true // Sử dụng SSL/TLS
});

pool.connect()
    .then(() => {
        console.log('Đã kết nối thành công đến PostgreSQL');
    })
    .catch((error) => {
        console.error('Lỗi kết nối đến PostgreSQL:', error);
    });

// Middleware cho CORS
app.use(cors());

// Middleware để xử lý JSON và URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đường dẫn tới các tài nguyên tĩnh
app.use(express.static(path.join(__dirname, './')));

// Route cho trang chủ
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
});

// Tạo bảng users nếu chưa tồn tại
pool.query(`CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    phone VARCHAR(20),
    address TEXT,
    location VARCHAR(50)
)`)
.then(() => {
    console.log('Bảng users đã được tạo hoặc đã tồn tại');
})
.catch((error) => {
    console.error('Lỗi khi tạo bảng users:', error);
});

// Route lấy danh sách người dùng
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        const users = result.rows;
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu từ PostgreSQL' });
    }
});

// Route thêm người dùng mới
app.post('/api/users', async (req, res) => {
    try {
        const { username, phone, address, location } = req.body;
        const result = await pool.query('INSERT INTO users(username, phone, address, location) VALUES($1, $2, $3, $4) RETURNING *', [username, phone, address, location]);
        const newUser = result.rows[0];
        res.json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi thêm người dùng vào PostgreSQL' });
    }
});

// Route xoá người dùng
app.delete('/api/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const result = await pool.query('DELETE FROM users WHERE username = $1 RETURNING *', [username]);
        const deletedUser = result.rows[0];

        if (!deletedUser) {
            return res.status(404).json({ error: `Không tìm thấy người dùng với username: ${username}` });
        }

        res.json({ message: `Người dùng ${username} đã bị xoá.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi xoá người dùng từ PostgreSQL' });
    }
});

// Route cập nhật thông tin người dùng
app.put('/api/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { phone, address, location } = req.body;

        const result = await pool.query('UPDATE users SET phone = $1, address = $2, location = $3 WHERE username = $4 RETURNING *', [phone, address, location, username]);
        const updatedUser = result.rows[0];

        if (!updatedUser) {
            return res.status(404).json({ error: `Không tìm thấy người dùng với username: ${username}` });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi cập nhật người dùng trong PostgreSQL' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}/`);
});
