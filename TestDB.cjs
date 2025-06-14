const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: '139.162.106.254',
  port: 3306,
  user: 'mynamo101',
  password: 'My331619@',
  database: 'admin_x_soundjaeger'
});
connection.connect(err => {
  if (err) {
    console.error('連線失敗:', err);
  } else {
    console.log('連線成功！');
    connection.end();
  }
});
