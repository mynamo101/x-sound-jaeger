import type { CollectionEntry } from "astro:content";

export interface GlobalSettingsProps {
    site_name: string,
    site_meta_title: string,
    site_meta_description: string,
    site_meta_image_source: string,
    twitter_username: string,
    language: string,
    background_color: string,
    text_color: string,
    primary_font: string,
    secondary_font: string,
    logo_scale: number,
    heading_one_scale: number,
    pagination_posts_number: number,
    use_page_load_animations: boolean,
    scrolling_type: ScrollingType,
    use_custom_scrollbar: boolean,
    cursor_type: CursorType,
    navigation_bar_type: NavbarType,
    post_header_type: PostHeaderType,
    use_reading_progress_bar: boolean,
    use_image_zoom: boolean
}

export type NavbarType = "Normal" | "Sticky" | "Animated";

export type PostHeaderType = "Wide" | "Narrow" | "Vertical";

export type CursorType = "Normal" | "Custom" | "Custom and Normal"

export type ScrollingType = "None" | "Subtle" | "Moderate" |"Intense"

export interface NavbarLink {
	text: string,
	link: string,
	new_tab?: boolean // adds target="_blank" rel="noopener noreferrer" to link
}

export interface NavbarDropdown {
	text: string,
	dropdown: NavbarLink[]
}

export type Navbar = NavbarLink | NavbarDropdown;

export interface FooterLink {
	text: string,
	link: string,
	new_tab?: boolean // adds target="_blank" rel="noopener noreferrer" to link
}

export interface FooterDropdown {
	text: string,
	dropdown: FooterLink[]
}

export type Footer = FooterLink | FooterDropdown;

export interface SocialProps {
    is_share_social?: boolean,
    text: string,
    url: string,
    icon: string // svg string
}

export interface HeroProps {
	title: string,
    description?: string,
    is_homepage?: boolean,
    is_archivepage?: boolean,
    total_number?: number,
    tags?: any[]
}

export interface PaginationProps {
    posts_per_page: number,
    total_posts: number,
    url: string,
    is_archivepage?: boolean
}

export interface SliderProps {
    posts_limit: number
}

export interface PostCardProps {
    post: CollectionEntry<"blog">,
    index?: number,
    total_number?: number
}

export interface TagCardProps {
    name: string,
    url: string,
    post_count?: number,
    description?: string
}

export interface AgeVerificationProps {
    title?: string,
    description?: string,
    confirm_button?: string
}

export interface TagProps {
    slug: string,
    description?: string,
    zh?: string
}

export interface AuthorProps {
    slug: string,
    bio?: string,
    location?: string,
    website_url?: string,
    facebook_url?: string,
    x_url?: string
}

export interface AuthorCardProps {
    name: string,
    url: string,
    post_count?: number
}

export interface PostProps {
	post: CollectionEntry<"blog">,
    previous_post?: CollectionEntry<"blog">,
    next_post?: CollectionEntry<"blog">,
    minutes_read?: string
}

export interface ButtonProps {
    text: string,
    url?: string,
    new_tab?: boolean
}

export interface GalleryImage {
    src: string,
    alt: string
}

export interface ImageGalleryProps {
    images: GalleryImage[],
    images_per_row?: number
}

export interface CalloutProps {
    text: string,
    emoji?: string,
    text_color?: string,
    background_color?: string
}

export interface ToggleCard {
    title: string,
    text?: string,
    type?: 'section'
}

export interface ToggleCardsProps {
    toggle_cards: ToggleCard[]
}

export interface MediaEmbedProps {
    media_iframe_src: string,
    title?: string
}

export interface MembershipCardProps {
    name: string,
    description?: string,
    yearly_price: string,
    monthly_price: string,
    benefits?: string[]
}

export interface FormHeroProps {
    type: FormHeroType,
    has_link?: boolean,
    title: string,
    description?: string
}

export type FormHeroType = "Contact" | "Signin" | "Signup" | "Subscribe" | "About";

export interface SeoProps {
    type?: "image" | "no_image";
	title: string;
	description: string;
	image?: CollectionEntry<"blog">["data"]["feature_image"];
	noindex?: boolean;
}

export interface AudioPackCardProps {
    post: CollectionEntry<"audiopacks">,
    index?: number,
    total_number?: number
}