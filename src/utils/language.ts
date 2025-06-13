// 语言工具函数 - 统一翻译管理
export function getCurrentLanguage() {
    // 如果是服务端渲染，返回默认语言
    if (typeof window === 'undefined') {
        return 'zh'; // 或者从 globalSettings 中获取
    }
    
    // 尝试从 localStorage 获取语言设置
    const savedLang = localStorage.getItem('lang');
    if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
        return savedLang;
    }
    
    // 如果没有存储的语言设置，返回默认语言
    return 'zh';
}

export function setLanguage(lang: string) {
    if (typeof window !== 'undefined' && (lang === 'zh' || lang === 'en')) {
        localStorage.setItem('lang', lang);
        
        // 触发语言变化事件
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }
}

// 获取翻译文本的工具函数
export function getTranslation(key: string, lang?: string): string {
    if (typeof window !== 'undefined' && window.translationManager) {
        return window.translationManager.getTranslation(key, lang);
    }
    return key; // 后备返回
}

// 类型定义
declare global {
    interface Window {
        translationManager: any;
        currentTranslations: any;
        currentLanguage: string;
    }
}
