import type { MembershipCardProps } from "@src-types/types.ts";

/**
 * Array of membership cards for Membership page.
 */

const membershipSettings: MembershipCardProps[] = [
    {
        name: "Starter",
        description: "Early Access to Public Works",
        yearly_price: "$12",
        monthly_price: "$3",
        benefits: [
            "Access to public free posts",
            "Acess to public posts before they are published",
            "Thanks for supporting me!",
        ]
    },
    {
        name: "Explorer",
        description: "Full Access to Premium Content",
        yearly_price: "$100",
        monthly_price: "$8",
        benefits: [
            "Everything from Starter",
            "Full access to Premium posts",
            "Access to bonus content",
            "Get monthly free audio toolkit",
            "Special mention in the credits",
        ]
    },
    {
        name: "Creator",
        description: "Full Access to Everything",
        yearly_price: "$89",
        monthly_price: "$15",
        benefits: [
            "Everything from Explorer",
            "Customized content requests",
            "Shoutout on our site",
        ]
    }
]

export default membershipSettings;