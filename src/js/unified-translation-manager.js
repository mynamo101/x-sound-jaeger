// 统一的翻译管理器
// 使用 JSON 文件作为唯一的翻译数据源

class UnifiedTranslationManager {
    constructor() {
        this.translations = {};
        this.currentLanguage = 'zh';
        this.initialized = false;
    }

    // 获取当前语言
    getCurrentLanguage() {
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('lang');
            return savedLang && (savedLang === 'zh' || savedLang === 'en') ? savedLang : 'zh';
        }
        return 'zh';
    }

    // 设置语言
    setLanguage(lang) {
        if (typeof window !== 'undefined' && (lang === 'zh' || lang === 'en')) {
            localStorage.setItem('lang', lang);
            this.currentLanguage = lang;
            
            // 触发语言变化事件
            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: lang } 
            }));
        }
    }

    // 动态加载翻译文件
    async loadTranslationFiles() {
        try {
            const [zhResponse, enResponse] = await Promise.all([
                fetch('/src/locales/zh.json'),
                fetch('/src/locales/en.json')
            ]);
            
            if (!zhResponse.ok || !enResponse.ok) {
                throw new Error('Failed to fetch translation files');
            }

            this.translations.zh = await zhResponse.json();
            this.translations.en = await enResponse.json();
            
            return this.translations;
        } catch (error) {
            console.error('Failed to load translation files:', error);
            // 提供后备翻译数据
            this.translations = {
                zh: { global: { navbar: { sign_in: "登入" } } },
                en: { global: { navbar: { sign_in: "Sign in" } } }
            };
            return this.translations;
        }
    }

    // 获取翻译文本
    getTranslation(key, lang = null) {
        const currentLang = lang || this.getCurrentLanguage();
        const translations = this.translations[currentLang];
        
        if (!translations) return key;
        
        // 支持点号分隔的键路径，如 "global.navbar.sign_in"
        const keys = key.split('.');
        let result = translations;
        
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return key; // 返回原始键名作为后备
            }
        }
        
        return result || key;
    }

    // 更新页面内容
    updatePageContent() {
        const currentLang = this.getCurrentLanguage();
        const t = this.translations[currentLang];

        if (!t) return;

        // 更新导航栏登入按钮
        const signInButton = document.querySelector('.acc-button span');
        if (signInButton && t.global?.navbar?.sign_in) {
            signInButton.textContent = t.global.navbar.sign_in;
        }

        // 更新页脚内容
        const footerText = document.querySelector('.footer-paragraph-wrapper p');
        if (footerText && t.global?.footer?.footer_text) {
            footerText.textContent = t.global.footer.footer_text;
        }

        const footerInput = document.querySelector('.subscribe-input');
        if (footerInput && t.global?.footer?.form_placeholder) {
            footerInput.placeholder = t.global.footer.form_placeholder;
        }

        // 更新标签滑块标题
        const tagsSliderTitle = document.querySelector('.tags-slider .section-header h2');
        if (tagsSliderTitle && t.global?.tags_slider?.title) {
            tagsSliderTitle.textContent = t.global.tags_slider.title;
        }

        // 更新所有 tag 名稱（TagCard）
        document.querySelectorAll('.tag-name[data-tag-slug]').forEach(el => {
            const slug = el.getAttribute('data-tag-slug');
            if (t.tags && t.tags[slug]) {
                el.textContent = t.tags[slug];
            } else {
                el.textContent = slug;
            }
        });

        // 更新语言选择器显示
        this.updateLanguageSelector(currentLang);

        // 根据页面类型更新内容
        this.updatePageSpecificContent(t);
    }

    // 更新首页内容
    updateHomepageContent(t) {
        if (!t.homepage) return;

        // 更新英雄区域标题
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle && t.homepage.title_hero) {
            heroTitle.textContent = t.homepage.title_hero;
        }

        // 更新英雄区域描述
        const heroDescription = document.querySelector('.hero .hero-paragraph-inner p');
        if (heroDescription && t.homepage.description_hero) {
            heroDescription.textContent = t.homepage.description_hero;
        }

        // 更新特色文章标题
        const featuredTitle = document.querySelector('.featured-posts-section .desktop-section-header');
        if (featuredTitle && t.homepage.title_featured_posts_desktop) {
            featuredTitle.textContent = t.homepage.title_featured_posts_desktop;
        }

        const featuredTitleMobile = document.querySelector('.featured-posts-section .mobile-section-header');
        if (featuredTitleMobile && t.homepage.title_featured_posts_mobile) {
            featuredTitleMobile.textContent = t.homepage.title_featured_posts_mobile;
        }

        // 更新最新文章标题
        const latestTitle = document.querySelector('.latest-posts-section .desktop-section-header');
        if (latestTitle && t.homepage.title_latest_posts_desktop) {
            latestTitle.textContent = t.homepage.title_latest_posts_desktop;
        }

        const latestTitleMobile = document.querySelector('.latest-posts-section .mobile-section-header');
        if (latestTitleMobile && t.homepage.title_latest_posts_mobile) {
            latestTitleMobile.textContent = t.homepage.title_latest_posts_mobile;
        }
    }

    // 根据页面类型更新特定内容
    updatePageSpecificContent(t) {
        const path = window.location.pathname;

        // 如果是首页，更新首页内容
        if (path === '/') {
            this.updateHomepageContent(t);
        }

        // 博客页面
        if (path.startsWith('/blog') && t.blog_page) {
            const blogTitle = document.querySelector('.hero h1');
            if (blogTitle && t.blog_page.title_hero) {
                blogTitle.textContent = t.blog_page.title_hero;
            }
            
            const blogDescription = document.querySelector('.hero .post-excerpt-wrapper p');
            if (blogDescription && t.blog_page.description_hero) {
                blogDescription.textContent = t.blog_page.description_hero;
            }
        }

        // 标签页面
        if (path.startsWith('/tags') && t.tags_page) {
            const tagsTitle = document.querySelector('.hero h1');
            if (tagsTitle && t.tags_page.title_hero) {
                tagsTitle.textContent = t.tags_page.title_hero;
            }
            
            const tagsDescription = document.querySelector('.hero .hero-paragraph-inner p');
            if (tagsDescription && t.tags_page.description_hero) {
                tagsDescription.textContent = t.tags_page.description_hero;
            }
        }

        // 作者页面
        if (path.startsWith('/authors') && t.authors_page) {
            const authorsTitle = document.querySelector('.hero h1');
            if (authorsTitle && t.authors_page.title_hero) {
                authorsTitle.textContent = t.authors_page.title_hero;
            }
            
            const authorsDescription = document.querySelector('.hero .hero-paragraph-inner p');
            if (authorsDescription && t.authors_page.description_hero) {
                authorsDescription.textContent = t.authors_page.description_hero;
            }
        }

        // 存档页面
        if (path.startsWith('/archive') && t.archive_page) {
            const archiveTitle = document.querySelector('.hero h1');
            if (archiveTitle && t.archive_page.title_hero) {
                archiveTitle.textContent = t.archive_page.title_hero;
            }
            
            const allTagsButton = document.querySelector('label[for="all-tags"]');
            if (allTagsButton && t.archive_page.all_tags) {
                allTagsButton.textContent = t.archive_page.all_tags;
            }
        }

        // 会员页面
        if (path.includes('/membership') && t.membership_page) {
            const membershipTitle = document.querySelector('.hero h1');
            if (membershipTitle && t.membership_page.title_hero) {
                membershipTitle.textContent = t.membership_page.title_hero;
            }
            
            const yearlyLabel = document.querySelector('label[for="yearly"]');
            if (yearlyLabel && t.membership_page.yearly) {
                yearlyLabel.textContent = t.membership_page.yearly;
            }
            
            const monthlyLabel = document.querySelector('label[for="monthly"]');
            if (monthlyLabel && t.membership_page.monthly) {
                monthlyLabel.textContent = t.membership_page.monthly;
            }
        }

        // FAQ页面
        if (path.includes('/faq') && t.faq_page) {
            const faqTitle = document.querySelector('.hero h1');
            if (faqTitle && t.faq_page.title_hero) {
                faqTitle.textContent = t.faq_page.title_hero;
            }
            
            const faqDescription = document.querySelector('.hero .hero-paragraph-inner p');
            if (faqDescription && t.faq_page.description_hero) {
                faqDescription.textContent = t.faq_page.description_hero;
            }
        }

        // 登入页面
        if (path.includes('/signin') && t.signin_page) {
            const signinTitle = document.querySelector('.hero h1');
            if (signinTitle && t.signin_page.title_hero) {
                signinTitle.textContent = t.signin_page.title_hero;
            }
            
            const signinDescription = document.querySelector('.form-page-excerpt-container p');
            if (signinDescription && t.signin_page.description_hero) {
                signinDescription.textContent = t.signin_page.description_hero;
            }
        }

        // 註冊页面
        if (path.includes('/signup') && t.signup_page) {
            const signupTitle = document.querySelector('.hero h1');
            if (signupTitle && t.signup_page.title_hero) {
                signupTitle.textContent = t.signup_page.title_hero;
            }
            
            const signupDescription = document.querySelector('.form-page-excerpt-container p');
            if (signupDescription && t.signup_page.description_hero) {
                signupDescription.textContent = t.signup_page.description_hero;
            }
        }

        // 订阅页面
        if (path.includes('/subscribe') && t.subscribe_page) {
            const subscribeTitle = document.querySelector('.hero h1');
            if (subscribeTitle && t.subscribe_page.title_hero) {
                subscribeTitle.textContent = t.subscribe_page.title_hero;
            }
            
            const subscribeDescription = document.querySelector('.form-page-excerpt-container p');
            if (subscribeDescription && t.subscribe_page.description_hero) {
                subscribeDescription.textContent = t.subscribe_page.description_hero;
            }
        }

        // 联系页面
        if (path.includes('/contact') && t.contact_page) {
            const contactTitle = document.querySelector('.hero h1');
            if (contactTitle && t.contact_page.title_hero) {
                contactTitle.textContent = t.contact_page.title_hero;
            }
            
            const contactDescription = document.querySelector('.form-page-excerpt-container p');
            if (contactDescription && t.contact_page.description_hero) {
                contactDescription.textContent = t.contact_page.description_hero;
            }
        }

        // 404页面
        if (path.includes('/404') && t.error_404_page) {
            const errorTitle = document.querySelector('.hero h1');
            if (errorTitle && t.error_404_page.title_hero) {
                errorTitle.textContent = t.error_404_page.title_hero;
            }
            
            const errorDescription = document.querySelector('.hero .hero-paragraph-inner p');
            if (errorDescription && t.error_404_page.description_hero) {
                errorDescription.textContent = t.error_404_page.description_hero;
            }
        }

        // 账户页面
        if (path.includes('/account') && t.account_page) {
            const accountTitle = document.querySelector('.hero h1');
            if (accountTitle && t.account_page.title_hero) {
                accountTitle.textContent = t.account_page.title_hero;
            }
        }
    }

    // 更新语言选择器显示
    updateLanguageSelector(currentLang) {
        const currentLanguageElement = document.getElementById('current-language');
        if (currentLanguageElement) {
            currentLanguageElement.textContent = currentLang === 'zh' ? '中文' : 'English';
        }
    }

    // 更新页面标题
    updatePageTitle() {
        const path = window.location.pathname;
        const t = this.translations[this.getCurrentLanguage()];
        
        if (!t) return;
        
        // 更新文档标题
        if (path === '/') {
            document.title = `${t.homepage?.title_hero || 'X-Sound Jaeger'} - X-Sound Jaeger`;
        } else if (path.includes('/blog')) {
            document.title = `${t.blog_page?.title_hero || 'Blog'} - X-Sound Jaeger`;
        } else if (path.includes('/tags') && !path.includes('/tags/')) {
            document.title = `${t.tags_page?.title_hero || 'Tags'} - X-Sound Jaeger`;
        } else if (path.includes('/authors') && !path.includes('/authors/')) {
            document.title = `${t.authors_page?.title_hero || 'Authors'} - X-Sound Jaeger`;
        }
    }

    // 初始化翻译管理器
    async init() {
        if (this.initialized) return;

        try {
            // 加载翻译文件
            await this.loadTranslationFiles();
            // 设置当前语言
            this.currentLanguage = this.getCurrentLanguage();

            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.updatePageContent();
                    this.addLanguageSwitcherEvents();
                });
            } else {
                this.updatePageContent();
                this.addLanguageSwitcherEvents();
            }

            // 监听语言变化事件
            window.addEventListener('languageChanged', () => {
                this.updatePageContent();
            });

            // 监听存储变化事件（多标签页同步）
            window.addEventListener('storage', (e) => {
                if (e.key === 'lang') {
                    this.currentLanguage = this.getCurrentLanguage();
                    this.updatePageContent();
                }
            });

            // 将实例添加到全局作用域
            window.translationManager = this;
            window.currentTranslations = this.translations[this.currentLanguage];
            window.currentLanguage = this.currentLanguage;

            this.initialized = true;

            console.log('Unified Translation Manager initialized');
        } catch (error) {
            console.error('Failed to initialize translation manager:', error);
        }
    }

    // 新增：自動為所有語言切換連結添加事件
    addLanguageSwitcherEvents() {
        document.querySelectorAll('a[data-lang]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = link.getAttribute('data-lang');
                if (lang) {
                    this.setLanguage(lang);
                    location.reload();
                }
            });
        });
    }
}

// 创建全局实例并自动初始化
const translationManager = new UnifiedTranslationManager();
translationManager.init();

export default translationManager;
