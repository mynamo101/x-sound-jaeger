// 翻译加载器 - 在页面加载后动态加载正确的翻译
// 使用 JSON 文件作为唯一的翻译数据源

// 全局翻译加载器
window.TranslationLoader = {
    translations: {},
    
    // 获取当前语言
    getCurrentLanguage() {
        return localStorage.getItem('lang') || 'zh';
    },
    
    // 动态加载翻译文件
    async loadTranslationFiles() {
        try {
            const zhResponse = await fetch('/src/locales/zh.json');
            const enResponse = await fetch('/src/locales/en.json');
            
            this.translations.zh = await zhResponse.json();
            this.translations.en = await enResponse.json();
            
            return this.translations;
        } catch (error) {
            console.error('Failed to load translation files:', error);
            return {};
        }
    },
      // 加载翻译到全局变量
    async loadTranslations() {
        // 如果翻译文件还没有加载，先加载它们
        if (!this.translations.zh || !this.translations.en) {
            await this.loadTranslationFiles();
        }
        
        const currentLang = this.getCurrentLanguage();
        const t = this.translations[currentLang];
        
        // 将翻译对象添加到全局作用域
        window.currentTranslations = t;
        window.currentLanguage = currentLang;
        
        return t;
    },
      // 初始化翻译加载器
    async init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                await this.loadTranslations();
                this.updatePageTitle();
            });
        } else {
            await this.loadTranslations();
            this.updatePageTitle();
        }
        
        // 监听语言变化
        window.addEventListener('storage', async (e) => {
            if (e.key === 'lang') {
                await this.loadTranslations();
                this.updatePageTitle();
            }
        });
    },
    
    // 更新页面标题（仅用于首页和特定页面）
    updatePageTitle() {
        const path = window.location.pathname;
        const t = window.currentTranslations;
        
        if (!t) return;
        
        // 更新文档标题
        if (path === '/') {
            document.title = `${t.homepage.title_hero} - X-Sound Jaeger`;
        } else if (path.includes('/blog')) {
            document.title = `${t.blog_page.title_hero} - X-Sound Jaeger`;
        } else if (path.includes('/tags') && !path.includes('/tags/')) {
            document.title = `${t.tags_page.title_hero} - X-Sound Jaeger`;
        } else if (path.includes('/authors') && !path.includes('/authors/')) {
            document.title = `${t.authors_page.title_hero} - X-Sound Jaeger`;
        }
    }
};

// 自动初始化
window.TranslationLoader.init();
