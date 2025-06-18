const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 數據庫配置
const db = mysql.createConnection({
  host: '139.162.106.254',
  port: 3306,
  user: 'mynamo101',
  password: 'My331619@',
  database: 'admin_x_soundjaeger'
});

const JWT_SECRET = 'your-secret-key-change-this'; // 請更改為安全的密鑰

// 創建必要的數據庫表
const createTables = () => {
  // 用戶表（合併 tier 欄位）
  db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      paypal_payer_id VARCHAR(255),
      tier ENUM('free', 'Support', 'Creator''s Choice', 'My Hero') DEFAULT 'free',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  // 受保護檔案表
  db.query(`
    CREATE TABLE IF NOT EXISTS protected_files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      file_id VARCHAR(255) UNIQUE NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_size VARCHAR(50),
      file_format VARCHAR(10),
      download_url VARCHAR(500) NOT NULL,
      required_tier ENUM('free', 'Support', 'Creator''s Choice', 'My Hero') DEFAULT 'Support',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // 更新現有 protected_files 表的 ENUM
  db.query(`
    ALTER TABLE protected_files 
    MODIFY COLUMN required_tier ENUM('free', 'Support', 'Creator''s Choice', 'My Hero') DEFAULT 'Support'
  `, (err) => {
    if (err && !err.message.includes('duplicate')) {
      console.log('更新 required_tier ENUM:', err.message);
    }
  });
  // 付款歷史表（不再關聯 user_subscriptions）
  db.query(`
    CREATE TABLE IF NOT EXISTS payment_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      amount DECIMAL(10,2),
      currency VARCHAR(3),
      paypal_payment_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
};

// 初始化數據庫表
createTables();

// 密碼安全驗證函數
function validatePassword(password) {
  const errors = [];
  
  // 最小長度檢查
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // 最大長度檢查
  if (password.length > 128) {
    errors.push('Password must be no more than 128 characters long');
  }
  
  // 必須包含至少一個小寫字母
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
    // 必須包含至少一個大寫字母
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // 檢查常見弱密碼
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common and not secure');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// 驗證會員狀態的中間件（直接查 users.tier）
function verifyMembership(requiredTier = 'Support') {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ 
          error: 'No authentication token provided',
          membership_required: true,
          required_tier: requiredTier
        });
      }
      // 驗證 JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      // 查詢用戶會員等級
      db.query(
        'SELECT * FROM users WHERE id = ?',
        [decoded.userId],
        (err, results) => {
          if (err || results.length === 0) {
            return res.status(500).json({ error: 'Database error' });
          }
          const user = results[0];
          const tierLevels = {
            'free': 0,
            'Support': 1,
            'Creator\'s Choice': 2,
            'My Hero': 3
          };
          if (tierLevels[user.tier] < tierLevels[requiredTier]) {
            return res.status(403).json({ 
              error: 'Insufficient membership tier',
              current_tier: user.tier,
              required_tier: requiredTier,
              upgrade_required: true
            });
          }
          req.user = decoded;
          req.user.tier = user.tier;
          next();
        }
      );
    } catch (error) {
      return res.status(401).json({ 
        error: 'Invalid token',
        membership_required: true,
        required_tier: requiredTier
      });
    }
  };
}

// 註冊接口（直接寫 tier='free'）
app.post('/api/signup', async (req, res) => {
  let { username, email, password, name } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用戶名和密碼不能為空' });
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      error: 'Password does not meet security requirements',
      details: passwordValidation.errors
    });
  }
  if (!email) email = username;
  const hash = await bcrypt.hash(password, 10);
  const insertSql = name
    ? 'INSERT INTO users (username, email, password, name, tier) VALUES (?, ?, ?, ?, ?)' 
    : 'INSERT INTO users (username, email, password, tier) VALUES (?, ?, ?, ?)';
  const insertParams = name ? [username, email, hash, name, 'free'] : [username, email, hash, 'free'];
  db.query(insertSql, insertParams, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.sqlMessage || '用戶名已存在' });
    }
    res.json({ message: '註冊成功' });
  });
});

// 登錄接口
app.post('/api/signin', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用戶名和密碼不能為空' });
  
  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ error: '用戶名或密碼錯誤' });
    
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: '用戶名或密碼錯誤' });
    
    // 生成 token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, name: user.name || '' } });
  });
});

// 檢查下載權限的 API（直接查 users.tier）
app.get('/api/check-download-access/:fileId', verifyMembership(), (req, res) => {
  const { fileId } = req.params;
  db.query(
    'SELECT * FROM protected_files WHERE file_id = ?',
    [fileId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }
      const file = results[0];
      const tierLevels = {
        'free': 0,
        'Support': 1,
        'Creator\'s Choice': 2,
        'My Hero': 3
      };
      if (tierLevels[req.user.tier] >= tierLevels[file.required_tier]) {
        res.json({ 
          access_granted: true,
          download_url: file.download_url,
          file_info: {
            name: file.file_name,
            size: file.file_size,
            format: file.file_format
          }
        });
      } else {
        res.status(403).json({ 
          access_denied: true,
          required_tier: file.required_tier,
          current_tier: req.user.tier
        });
      }
    }
  );
});

// 添加受保護檔案的 API（管理員使用）
app.post('/api/admin/add-protected-file', (req, res) => {
  const { fileId, fileName, fileSize, fileFormat, downloadUrl, requiredTier } = req.body;
  
  db.query(
    'INSERT INTO protected_files (file_id, file_name, file_size, file_format, download_url, required_tier) VALUES (?, ?, ?, ?, ?, ?)',
    [fileId, fileName, fileSize, fileFormat, downloadUrl, requiredTier],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to add protected file' });
      }
      res.json({ message: 'Protected file added successfully' });
    }
  );
});

// PayPal webhook 處理訂閱事件（直接更新 users.tier）
app.post('/api/paypal-webhook', express.raw({type: 'application/json'}), (req, res) => {
  const event = req.body;
  switch (event.event_type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      handleSubscriptionActivated(event.resource);
      break;
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      handleSubscriptionCancelled(event.resource);
      break;
    case 'PAYMENT.SALE.COMPLETED':
      handlePaymentCompleted(event.resource);
      break;
  }
  res.status(200).send('OK');
});
function handleSubscriptionActivated(subscription) {
  const planIdToTier = {
    'P-3MP41776X70737201NBIOZRQ': 'Support',
    'P-5VY34435YG791411WNBIPG6A': 'Creator\'s Choice',
    'P-658069381H438834BNBIPIDA': 'My Hero'
  };
  const tier = planIdToTier[subscription.plan_id];
  if (tier) {
    db.query(
      'UPDATE users SET tier = ? WHERE paypal_payer_id = ?',
      [tier, subscription.subscriber.payer_id],
      (err, result) => {
        if (err) {
          console.error('Error updating user tier:', err);
        } else {
          console.log(`User ${subscription.subscriber.payer_id} 升級為 ${tier}`);
        }
      }
    );
  }
}
function handleSubscriptionCancelled(subscription) {
  db.query(
    'UPDATE users SET tier = ? WHERE paypal_payer_id = ?',
    ['free', subscription.subscriber.payer_id],
    (err) => {
      if (err) {
        console.error('Error cancelling user tier:', err);
      } else {
        console.log(`User ${subscription.subscriber.payer_id} 會員已取消，降級為 free`);
      }
    }
  );
}
function handlePaymentCompleted(payment) {
  // 記錄付款歷史
  db.query(
    'INSERT INTO payment_history (user_id, amount, currency, paypal_payment_id) SELECT id, ?, ?, ? FROM users WHERE paypal_payer_id = ?',
    [payment.amount.total, payment.amount.currency, payment.id, payment.payer.payer_info.payer_id],
    (err) => {
      if (err) {
        console.error('Error recording payment:', err);
      }
    }
  );
}

// 獲取用戶基本資料（直接查 users.tier）
app.get('/api/user/profile', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        error: 'No authentication token provided'
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    db.query('SELECT id, username, email, name, tier FROM users WHERE id = ?', [decoded.userId], (err, userResults) => {
      if (err || userResults.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const user = userResults[0];
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name || '',
          tier: user.tier
        }
      });
    });
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid token'
    });
  }
});

// 獲取用戶訂閱狀態（直接查 users.tier）
app.get('/api/user/subscription', verifyMembership(), (req, res) => {
  res.json({
    user: req.user
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
