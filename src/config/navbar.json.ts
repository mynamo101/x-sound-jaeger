import type { Navbar } from "@src-types/types.ts";

/**
 * Array of navigation links and dropdowns.
 * Add links or dropdowns here to display in the navigation bar.
 * Only one level of dropdown links is supported.
 */

const navbarSettings: Navbar[] = [
    {
		text: "Home",
		link: "/",
	},
	{
		text: "Works",
		link: "/archive/",
	},
	{
		text: "Contact",
		link: "/contact/",
	},
	{
		text: "Language",
		dropdown: [
			{
				text: "English",
				link: "#",
				lang: "en"
			},
			{
				text: "中文",
				link: "#",
				lang: "zh"
			}
		]
	},
	// {
	// 	text: "Features",
	// 	dropdown: [
	// 		// {
	// 		// 	text: "Features",
	// 		// 	link: "/features/",
	// 		// },
	// 		{
	// 			text: "Archive",
	// 			link: "/archive/",
	// 		},
	// 		{
	// 			text: "Tags",
	// 			link: "/tags/",
	// 		},
	// 		{
	// 			text: "Authors",
	// 			link: "/authors/",
	// 		},
	// 		{
	// 			text: "Account",
	// 			link: "/account/",
	// 		},
	// 		{
	// 			text: "Subscribe",
	// 			link: "/subscribe/",
	// 		},
	// 		{
	// 			text: "Membership",
	// 			link: "/membership/",
	// 		},
	// 		// {
	// 		// 	text: "Contact",
	// 		// 	link: "/contact/",
	// 		// },
	// 		{
	// 			text: "FAQ",
	// 			link: "/faq/",
	// 		},
	// 		// {
	// 		// 	text: "404",
	// 		// 	link: "/404/",
	// 		// },
	// 		// {
	// 		// 	text: "RSS Feed",
	// 		// 	link: "/rss.xml/",
	// 		// },
	// 		{
	// 			text: "Get Theme",
	// 			link: "https://kusa-projects.lemonsqueezy.com/buy/fcfbe185-536a-46c6-a0dd-7f4621a64314",
	// 			new_tab: true
	// 		},
	// 		{
	// 			text: "KUSA Projects",
	// 			link: "https://www.kusa-projects.com/",
	// 			new_tab: true
	// 		},
	// 	],
	// },
]

export default navbarSettings;