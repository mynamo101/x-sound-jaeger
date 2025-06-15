import type { GlobalSettingsProps } from "@src-types/types.ts";

// 获取当前语言设置的函数
function getCurrentLanguage() {
    // 在服务端渲染时，我们无法访问 localStorage
    // 默认返回中文，客户端脚本会处理语言切换
    return "zh";
}

const globalSettings: GlobalSettingsProps = {
    site_name: "X-Sound Jaeger",
    site_meta_title: "X-Sound Jaeger - A Lewd Audio Lab",
    site_meta_description: "X-Sound Jaeger is a lewd audio lab where you can find a variety of erotic audio content, including ASMR, roleplay, and more.",
    site_meta_image_source: "/images/kusa-projects-logo.jpg",
    twitter_username: "@x_soundjaeger",
    language: "en",
    background_color: "rgb(0, 0, 0)", // Background color in rgb format
    text_color: "rgb(255, 255, 255)", // Text color in rgb format
    primary_font: "Raleway", // Google Fonts name (use the exact name as listed on Google Fonts embed link). Example: "Roboto Mono" should be "Roboto+Mono"
    secondary_font: "Noto Sans", // Google Fonts name (use the exact name as listed on Google Fonts embed link). Example: "Roboto Mono" should be "Roboto+Mono"
    logo_scale: 1, // Default logo scale (use a number for scaling)
    heading_one_scale: 1, // Default scale for H1 elements (use a number for scaling)
    pagination_posts_number: 6,
    use_page_load_animations: true,
    scrolling_type: "Moderate", // None, Subtle, Intense | Using Lenis library: https://lenis.darkroom.engineering/
    use_custom_scrollbar: true, // Doesn't apply to Safari browsers
    cursor_type: "Custom and Normal", // Normal, Custom, Custom and Normal
    navigation_bar_type: "Sticky", // Animated, Sticky, Normal
    post_header_type: "Narrow", // Wide, Narrow, Vertical
    use_reading_progress_bar: true, // Use reading progress bar on post page
    use_image_zoom: true // Use image zoom on post page
}

export default globalSettings;
