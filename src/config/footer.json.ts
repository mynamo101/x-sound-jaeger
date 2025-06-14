
import type { Footer } from "@src-types/types.ts";

/**
 * Array of navigation links and dropdowns.
 * Add links or dropdowns here to display in the footer.
 * Only one level of dropdown links is supported.
 */

const footerSettings: Footer[] = [
    {
        text: "About",
        dropdown: [
            // {
            //     text: "Archive",
            //     link: "/archive/",
            // },
            // {
            //     text: "Tags",
            //     link: "/tags/",
            // },
            // {
            //     text: "Authors",
            //     link: "/authors/",
            // },
            {
                text: "Donate Me",
                link: "/membership/",
            },
            {
                text: "FAQ",
                link: "/faq/",
            }
        ],
    },
    {
        text: "Features",
        dropdown: [
            // {
            //     text: "Features",
            //     link: "/features/",
            // },
            // {
            //     text: "Style Guide",
            //     link: "/style-guide/",
            // },
            // {
            //     text: "Documentation",
            //     link: "https://www.kusa-projects.com/astro-documentation",
            //     new_tab: true
            // },
            {
                text: "Changelog",
                link: "/changelog/",
            },
            {
                text: "404",
                link: "/404/",
            }
        ],
    },
    // {
    //     text: "Account",
    //     dropdown: [
            // {
            //     text: "Account",
            //     link: "/account/",
            // },
            // {
            //     text: "Sign in",
            //     link: "/signin/",
            // },
            // {
            //     text: "Sign up",
            //     link: "/signup/",
            // },
            // {
            //     text: "Subscribe",
            //     link: "/subscribe/"            
            // }
    //     ],
    // },
]

export default footerSettings;