function getApiBase() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001'
        : 'https://x.soundjaeger.com';
}

/**
 * 檢查下載權限
 * @param {string} token JWT Token
 * @param {string} fileName 檔案名稱
 * @returns {Promise<Response>} fetch response
 */
export async function checkDownloadAccess(token, fileName) {
    const apiBase = getApiBase();
    return fetch(`${apiBase}/api/check-download-access/${fileName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

/**
 * 註冊新會員
 * @param {Object} payload { name, username, email, password }
 * @returns {Promise<Response>} fetch response
 */
export async function signup({ name, username, email, password }) {
    const apiBase = getApiBase();
    return fetch(`${apiBase}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password })
    });
}

/**
 * 登入會員
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Response>} fetch response
 */
export async function signin(username, password) {
    const apiBase = getApiBase();
    return fetch(`${apiBase}/api/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
}

/**
 * 取得會員個人資料
 * @param {string} token JWT Token
 * @returns {Promise<Response>} fetch response
 */
export async function getUserProfile(token) {
    const apiBase = getApiBase();
    return fetch(`${apiBase}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}