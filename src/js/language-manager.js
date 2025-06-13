// 客户端语言管理
import { zh, en } from './translations.js';

document.addEventListener('DOMContentLoaded', function() {
    // 翻译数据
    const translations = { zh, en };

    // 获取当前语言
    function getCurrentLanguage() {
        return localStorage.getItem('lang') || 'zh';
    }

    // 更新页面内容
    function updatePageContent() {
        const currentLang = getCurrentLanguage();
        const t = translations[currentLang];

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

        // 如果是首页，更新首页内容
        if (window.location.pathname === '/') {
            updateHomepageContent(t);
        }

        // 更新标签滑块标题
        const tagsSliderTitle = document.querySelector('.tags-slider-section .desktop-section-header');
        if (tagsSliderTitle && t.global?.tags_slider?.title) {
            tagsSliderTitle.textContent = t.global.tags_slider.title;
        }
        
        const tagsSliderTitleMobile = document.querySelector('.tags-slider-section .mobile-section-header');
        if (tagsSliderTitleMobile && t.global?.tags_slider?.title) {
            tagsSliderTitleMobile.textContent = t.global.tags_slider.title;
        }

        // 更新语言选择器显示
        updateLanguageSelector(currentLang);

        // 根据页面类型更新内容
        updatePageSpecificContent(t);
    }

    // 更新首页内容
    function updateHomepageContent(t) {
        if (!t.homepage) return;

        // 更新英雄区域标题
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle && t.homepage.title_hero) {
            heroTitle.textContent = t.homepage.title_hero;
        }

        // 更新英雄区域描述
        const heroDescription = document.querySelector('.hero .post-excerpt-wrapper p');
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
    function updatePageSpecificContent(t) {
        const path = window.location.pathname;

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
            
            const tagsDescription = document.querySelector('.hero .post-excerpt-wrapper p');
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
            
            const authorsDescription = document.querySelector('.hero .post-excerpt-wrapper p');
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
            
            const faqDescription = document.querySelector('.hero .post-excerpt-wrapper p');
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
            
            const errorDescription = document.querySelector('.form-page-excerpt-container p');
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
    function updateLanguageSelector(currentLang) {
        const currentLanguageElement = document.getElementById('current-language');
        if (currentLanguageElement) {
            currentLanguageElement.textContent = currentLang === 'zh' ? '中文' : 'English';
        }
    }

    // 初始加载时更新页面内容
    updatePageContent();

    // 监听语言切换事件
    window.addEventListener('languageChanged', function() {
        updatePageContent();
    });
});
