const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
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
      tier ENUM('Free', 'Starter', 'Pro', 'Hero') DEFAULT 'Free',
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
      required_tier ENUM('Free', 'Starter', 'Pro', 'Hero') DEFAULT 'Starter',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // 更新現有 protected_files 表的 ENUM
  db.query(`
    ALTER TABLE protected_files 
    MODIFY COLUMN required_tier ENUM('Free', 'Starter', 'Pro', 'Hero') DEFAULT 'Starter'
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
            'Free': 0,
            'Starter': 1,
            'Pro': 2,
            'Hero': 3
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

// 註冊接口（直接寫 tier='Free'）
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
  const insertParams = name ? [username, email, hash, name, 'Free'] : [username, email, hash, 'Free'];
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

// 檢查下載權限的 API（支援所有會員等級包括免費）
app.get('/api/check-download-access/:fileId', verifyMembership('Free'), (req, res) => {
  const { fileId } = req.params;
  
  // 首先檢查資料庫中是否有該檔案
  db.query(
    'SELECT * FROM protected_files WHERE file_id = ?',
    [fileId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        // 檔案不在資料庫中，檢查是否為免費檔案路徑
        if (fileId.startsWith('test.wav') || req.originalUrl.includes('/Samples/')) {
          // /Samples/ 路徑下的檔案視為免費檔案，所有登入用戶都可下載
          return res.json({ 
            access_granted: true,
            download_url: `/Samples/${fileId}`,
            file_info: {
              name: fileId,
              size: 'Unknown',
              format: fileId.split('.').pop()?.toUpperCase() || 'UNKNOWN'
            },
            note: 'Free sample file'
          });
        }
        return res.status(404).json({ error: 'File not found' });
      }
      
      const file = results[0];
      const tierLevels = {
        'Free': 0,
        'Starter': 1,
        'Pro': 2,
        'Hero': 3
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
    'P-3MP41776X70737201NBIOZRQ': 'Starter',
    'P-5VY34435YG791411WNBIPG6A': 'Pro',
    'P-658069381H438834BNBIPIDA': 'Hero'
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
    ['Free', subscription.subscriber.payer_id],
    (err) => {
      if (err) {
        console.error('Error cancelling user tier:', err);
      } else {
        console.log(`User ${subscription.subscriber.payer_id} 會員已取消，降級為 Free`);
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

// 設定 multer 暫存路徑，之後再根據 tier 移動檔案
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 先暫存到 temp 資料夾
    const tempDir = path.join(__dirname, 'temp');
    fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// 改用 fields 支援多欄位
app.post('/api/admin/upload-protected-file', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'required_tier', maxCount: 1 }
]), (req, res) => {
  const required_tier = req.body.required_tier;
  console.log('Upload API - req.body:', req.body);
  console.log('Upload API - required_tier:', required_tier);
  
  if (!req.files || !req.files.file) return res.status(400).json({ error: '未選擇檔案' });
  const file = req.files.file[0];
  const file_id = file.originalname;
  const file_name = file.originalname;
  const file_size = file.size;
  const file_format = file.originalname.split('.').pop().toLowerCase();
  
  // 決定目標資料夾
  const folderMap = {
    'Free': 'Free',
    'Starter': 'Tier_1',
    'Pro': 'Tier_2',
    'Hero': 'Tier_3'
  };
  const folder = folderMap[required_tier] || 'Tier_1';
  console.log('Upload API - target folder:', folder);
  
  // 建立目標資料夾
  const targetDir = path.join(__dirname, 'public', 'audio', folder);
  fs.mkdirSync(targetDir, { recursive: true });
  
  // 移動檔案從 temp 到目標資料夾
  const tempPath = file.path;
  const finalPath = path.join(targetDir, file.originalname);
  
  console.log('Upload API - moving file from:', tempPath);
  console.log('Upload API - moving file to:', finalPath);
  
  fs.rename(tempPath, finalPath, (err) => {
    if (err) {
      console.error('File move error:', err);
      return res.status(500).json({ error: '檔案移動失敗', detail: err.message });
    }
    
    const download_url = `/audio/${folder}/${file.originalname}`;
    console.log('Upload API - final download_url:', download_url);
    
    // 寫入資料库
    db.query(
      `INSERT INTO protected_files (file_id, file_name, file_size, file_format, download_url, required_tier)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE file_size=VALUES(file_size), file_format=VALUES(file_format), download_url=VALUES(download_url), required_tier=VALUES(required_tier)`,
      [file_id, file_name, file_size, file_format, download_url, required_tier],
      (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: '資料庫寫入失敗', detail: err.message });
        }
        res.json({ message: '上傳成功', file: file_name, tier: required_tier, folder: folder });
      }
    );
  });
});

// 取得所有 protected_files
app.get('/api/admin/list-protected-files', (req, res) => {
  db.query(
    'SELECT file_name, required_tier, download_url FROM protected_files ORDER BY created_at DESC',
    (err, results) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(results);
    }
  );
});

// 刪除受保護檔案的 API
app.post('/api/admin/delete-protected-file', (req, res) => {
  const { file_name } = req.body;
  if (!file_name) return res.status(400).json({ error: '缺少檔名' });
  // 查詢檔案資訊
  db.query('SELECT * FROM protected_files WHERE file_name = ?', [file_name], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: '找不到檔案' });
    const file = results[0];
    // 刪除資料庫紀錄
    db.query('DELETE FROM protected_files WHERE file_name = ?', [file_name], (err2) => {
      if (err2) return res.status(500).json({ error: '資料庫刪除失敗' });
      // 刪除實體檔案
      const folderMap = {
        'Free': 'Free',
        'Starter': 'Tier_1',
        'Pro': 'Tier_2',
        'Hero': 'Tier_3'
      };
      const folder = folderMap[file.required_tier] || 'Tier_1';
      const filePath = path.join(__dirname, 'public', 'audio', folder, file_name);
      fs.unlink(filePath, (err3) => {
        // 即使檔案不存在也不影響
        res.json({ message: '已刪除' });
      });
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
