const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// TODO: 替换为你的数据库信息
const db = mysql.createConnection({
  host: '139.162.106.254', // 只写IP，不要加端口
  port: 3306,              // 单独加上端口
  user: 'mynamo101', // 你的数据库用户名
  password: 'My331619@', // 你的数据库密码
  database: 'admin_x_soundjaeger' // 你的数据库名
});

// 注册接口
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
  const hash = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err) => {
    if (err) return res.status(400).json({ error: '用户名已存在' });
    res.json({ message: '注册成功' });
  });
});

// 登录接口
app.post('/api/signin', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ error: '用户名或密码错误' });
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: '用户名或密码错误' });
    // 生成 token
    const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1d' });
    res.json({ token });
  });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
