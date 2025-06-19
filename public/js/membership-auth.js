// 會員認證管理器
class MembershipAuth {
    constructor() {
        // 根据环境自动选择API地址
        this.apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3001' 
            : 'https://x.soundjaeger.com';
        this.token = localStorage.getItem('auth_token');
        this.userInfo = JSON.parse(localStorage.getItem('user_info') || 'null');
    }

    // 檢查是否已登錄
    isAuthenticated() {
        return !!this.token && !!this.userInfo;
    }

    // 獲取用戶信息
    getUserInfo() {
        return this.userInfo;
    }

    // 取得會員等級（同步，優先取本地）
    getTier() {
        return this.userInfo?.tier || null;
    }

    // 登錄（自動取得會員等級）
    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/api/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                this.token = data.token;
                this.userInfo = data.user;
                // 取得會員等級
                const tier = await this.fetchTier();
                if (tier) this.userInfo.tier = tier;
                localStorage.setItem('auth_token', this.token);
                localStorage.setItem('user_info', JSON.stringify(this.userInfo));
                localStorage.setItem('login_time', Date.now().toString());
                return { success: true, data };
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // 從API獲取會員等級
    async fetchTier() {
        if (!this.token) return null;
        try {
            const response = await fetch(`${this.apiBase}/api/user/subscription`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                return data.subscription?.tier || null;
            }
        } catch (e) {}        return null;
    }

    // 登出
    logout() {
        this.token = null;
        this.userInfo = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('login_time');
        window.location.reload();
    }

    // 獲取訂閱狀態
    async getSubscriptionStatus() {
        if (!this.token) return null;

        try {
            const response = await fetch(`${this.apiBase}/api/user/subscription`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const data = await response.json();
                return data.subscription;
            }
        } catch (error) {
            console.error('Failed to get subscription status:', error);
        }
        return null;
    }

    // 檢查檔案下載權限
    async checkDownloadAccess(fileId) {
        if (!this.token) {
            return { 
                access: false, 
                error: 'not_authenticated',
                redirectTo: '/signin'
            };
        }

        try {
            const response = await fetch(`${this.apiBase}/api/check-download-access/${fileId}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();
            
            if (response.ok) {
                return { access: true, data };
            } else {
                return { 
                    access: false, 
                    error: data.error,
                    currentTier: data.current_tier,
                    requiredTier: data.required_tier,
                    redirectTo: data.upgrade_required ? '/membership' : '/signin'
                };
            }
        } catch (error) {
            return { 
                access: false, 
                error: 'network_error',
                redirectTo: '/signin'
            };
        }
    }
}

// 會員等級名稱統一為 Free, Starter, Explorer, Creator

// 全局實例
window.membershipAuth = new MembershipAuth();