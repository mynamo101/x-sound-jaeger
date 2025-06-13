// 语言工具函数
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

export function setLanguage(lang) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('lang', lang);
    }
}

// 动态加载翻译文件
export async function loadTranslations(language = 'zh') {
    try {
        const translations = await import(`../locales/${language}.json`);
        return translations.default || translations;
    } catch (error) {
        console.warn(`Failed to load translations for ${language}, falling back to Chinese`);
        try {
            const fallbackTranslations = await import('../locales/zh.json');
            return fallbackTranslations.default || fallbackTranslations;
        } catch (fallbackError) {
            console.error('Failed to load fallback translations:', fallbackError);
            return {};
        }
    }
}
