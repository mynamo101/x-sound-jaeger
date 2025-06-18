
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
            {
                text: "X-SoundJaeger",
                link: "/about/",
            },
            {
                text: "Membership",
                link: "/membership/",
            },
            {
                text: "Account",
                link: "/account/",
            },
            {
                text: "Sign In",
                link: "/signin/",
            }

            // {
            //     text: "Style Guide",
            //     link: "/style-guide/",
            // },
        ],
    },
    {
        text: "Works",
        dropdown: [
            {
                text: "Works",
                link: "/works/",
            },
            {
                text: "Audio Packs",
                link: "/audiopacks/",
            },
        ],
    },
    {
        text: "Policy",
        dropdown: [
            {
                text: "FAQ",
                link: "/faq/",
            },
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