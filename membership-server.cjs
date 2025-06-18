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
  // 用戶表
  db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      paypal_payer_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  // 用戶訂閱表
  db.query(`
    CREATE TABLE IF NOT EXISTS user_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      tier ENUM('free', 'Support', 'Creator''s Choice', 'My Hero') NOT NULL,
      paypal_subscription_id VARCHAR(255) UNIQUE,
      status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // 更新現有表的 ENUM 以包含 'free' 選項
  db.query(`
    ALTER TABLE user_subscriptions 
    MODIFY COLUMN tier ENUM('free', 'Support', 'Creator''s Choice', 'My Hero') NOT NULL
  `, (err) => {
    if (err && !err.message.includes('duplicate')) {
      console.log('更新 tier ENUM:', err.message);
    }
  });
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

  // 付款歷史表
  db.query(`
    CREATE TABLE IF NOT EXISTS payment_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subscription_id INT NOT NULL,
      amount DECIMAL(10,2),
      currency VARCHAR(3),
      paypal_payment_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE CASCADE
    )
  `);
};

// 初始化數據庫表
createTables();

// 驗證會員狀態的中間件
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
      
      // 從數據庫查詢用戶的會員狀態
      db.query(
        'SELECT * FROM user_subscriptions WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1',
        [decoded.userId],
        (err, results) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          if (results.length === 0) {
            return res.status(403).json({ 
              error: 'No active membership found',
              membership_required: true,
              required_tier: requiredTier
            });
          }

          const subscription = results[0];
            // 檢查會員等級是否符合要求
          const tierLevels = {
            'free': 0,
            'Support': 1,
            'Creator\'s Choice': 2,
            'My Hero': 3
          };

          if (tierLevels[subscription.tier] < tierLevels[requiredTier]) {
            return res.status(403).json({ 
              error: 'Insufficient membership tier',
              current_tier: subscription.tier,
              required_tier: requiredTier,
              upgrade_required: true
            });
          }

          req.user = decoded;
          req.membership = subscription;
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

// 註冊接口
app.post('/api/signup', async (req, res) => {
  let { username, email, password, name } = req.body;
  console.log('收到註冊請求:', req.body); // log 輸入資料
  console.log('name 欄位實際值:', name, 'username:', username, 'email:', email);
  if (!username || !password) return res.status(400).json({ error: '用戶名和密碼不能為空' });

  // 如果 email 沒有傳，直接用 username 當 email
  if (!email) email = username;

  const hash = await bcrypt.hash(password, 10);
  // 支援 name 欄位
  const insertSql = name
    ? 'INSERT INTO users (username, email, password, name) VALUES (?, ?, ?, ?)' 
    : 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  const insertParams = name ? [username, email, hash, name] : [username, email, hash];
  db.query(insertSql, insertParams, (err, result) => {
    if (err) {
      console.error('註冊失敗:', err); // log SQL 錯誤
      return res.status(400).json({ error: err.sqlMessage || '用戶名已存在' });
    }
      // 註冊成功後，為新用戶添加一個基本的會員等級記錄
    const userId = result.insertId;
    db.query(
      'INSERT INTO user_subscriptions (user_id, tier, status) VALUES (?, ?, ?)',
      [userId, 'free', 'active'],
      (subErr) => {
        if (subErr) {
          console.error('創建預設訂閱失敗:', subErr);
          // 即使創建訂閱失敗，註冊仍然成功
        } else {
          console.log(`為新用戶 ${userId} 創建了預設 free 等級會員`);
        }
      }
    );
    
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

// 檢查下載權限的 API
app.get('/api/check-download-access/:fileId', verifyMembership(), (req, res) => {
  const { fileId } = req.params;
  
  // 查詢檔案的會員要求
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

      const file = results[0];      const tierLevels = {
        'free': 0,
        'Support': 1,
        'Creator\'s Choice': 2,
        'My Hero': 3
      };

      if (tierLevels[req.membership.tier] >= tierLevels[file.required_tier]) {
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
          current_tier: req.membership.tier
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

// PayPal webhook 處理訂閱事件
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
    // 從 PayPal 用戶信息中找到對應的數據庫用戶
    db.query(
      'SELECT id FROM users WHERE paypal_payer_id = ?',
      [subscription.subscriber.payer_id],
      (err, results) => {
        if (err || results.length === 0) {
          console.error('User not found for PayPal payer:', subscription.subscriber.payer_id);
          return;
        }

        const userId = results[0].id;
        
        // 添加或更新訂閱記錄
        db.query(
          'INSERT INTO user_subscriptions (user_id, tier, paypal_subscription_id, status) VALUES (?, ?, ?, "active") ON DUPLICATE KEY UPDATE status = "active", tier = ?',
          [userId, tier, subscription.id, tier],
          (err) => {
            if (err) {
              console.error('Error updating subscription:', err);
            } else {
              console.log(`Subscription activated for user ${userId}, tier: ${tier}`);
            }
          }
        );
      }
    );
  }
}

function handleSubscriptionCancelled(subscription) {
  db.query(
    'UPDATE user_subscriptions SET status = "cancelled" WHERE paypal_subscription_id = ?',
    [subscription.id],
    (err) => {
      if (err) {
        console.error('Error cancelling subscription:', err);
      } else {
        console.log(`Subscription cancelled: ${subscription.id}`);
      }
    }
  );
}

function handlePaymentCompleted(payment) {
  // 記錄付款歷史
  db.query(
    'INSERT INTO payment_history (subscription_id, amount, currency, paypal_payment_id) SELECT id, ?, ?, ? FROM user_subscriptions WHERE paypal_subscription_id = ?',
    [payment.amount.total, payment.amount.currency, payment.id, payment.billing_agreement_id],
    (err) => {
      if (err) {
        console.error('Error recording payment:', err);
      }
    }
  );
}

// 獲取用戶基本資料（不需要會員等級）
app.get('/api/user/profile', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No authentication token provided'
      });
    }

    // 驗證 JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 從數據庫查詢用戶資料
    db.query('SELECT id, username, email, name FROM users WHERE id = ?', [decoded.userId], (err, userResults) => {
      if (err || userResults.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResults[0];
      
      // 查詢用戶訂閱狀態（可能沒有）
      db.query(
        'SELECT * FROM user_subscriptions WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1',
        [decoded.userId],        (err, subscriptionResults) => {
          let subscription = null;
          let tier = 'free'; // 預設等級
          
          if (!err && subscriptionResults.length > 0) {
            subscription = subscriptionResults[0];
            tier = subscription.tier;
          }

          res.json({
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              name: user.name || '',
              tier: tier
            },
            subscription: subscription
          });
        }
      );
    });
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid token'
    });
  }
});

// 獲取用戶訂閱狀態（需要會員等級）
app.get('/api/user/subscription', verifyMembership(), (req, res) => {
  res.json({
    user: req.user,
    subscription: req.membership
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
