import type { GlobalSettingsProps } from "@src-types/types.ts";

const globalSettings: GlobalSettingsProps = {
    site_name: "Elysian",
    site_meta_title: "Elysian",
    site_meta_description: "Elysian is a modern blog theme featuring captivating page transitions, a unique custom cursor, and a sleek scrollbar, all enhanced with smooth scrolling.",
    site_meta_image_source: "/images/kusa-projects-logo.jpg",
    twitter_username: "@Your_Username",
    language: "en", // Default language and static texts file (en.json)
    background_color: "rgb(0, 0, 0)", // Background color in rgb format
    text_color: "rgb(255, 255, 255)", // Text color in rgb format
    primary_font: "Roboto", // Google Fonts name (use the exact name as listed on Google Fonts embed link). Example: "Roboto Mono" should be "Roboto+Mono"
    secondary_font: "Roboto+Mono", // Google Fonts name (use the exact name as listed on Google Fonts embed link). Example: "Roboto Mono" should be "Roboto+Mono"
    logo_scale: 1, // Default logo scale (use a number for scaling)
    heading_one_scale: 1, // Default scale for H1 elements (use a number for scaling)
    pagination_posts_number: 6,
    use_page_load_animations: true,
    scrolling_type: "Moderate", // None, Subtle, Intense | Using Lenis library: https://lenis.darkroom.engineering/
    use_custom_scrollbar: true, // Doesn't apply to Safari browsers
    cursor_type: "Custom and Normal", // Normal, Custom, Custom and Normal
    navigation_bar_type: "Animated", // Animated, Sticky, Normal
    post_header_type: "Wide", // Wide, Narrow, Vertical
    use_reading_progress_bar: false, // Use reading progress bar on post page
    use_image_zoom: true // Use image zoom on post page
}

export default globalSettings;
