import type { MembershipCardProps } from "@src-types/types.ts";

/**
 * Array of membership cards for Membership page.
 */

const membershipSettings: MembershipCardProps[] = [
    {
        name: "Support",
        description: "Early Access to Public Works",
        yearly_price: "$12",
        monthly_price: "$1",
        benefits: "Access to public posts, Receive weekly email newsletter"
    },
    {
        name: "Premium",
        description: "Full Access to Premium Content",
        yearly_price: "$100",
        monthly_price: "$10",
        benefits: "Full access to Premium Plus posts, Receive weekly email newsletter, Support indie publishing, Simple secure card payment"
    },
    {
        name: "Creator",
        description: "Full Access to Everything",
        yearly_price: "$89",
        monthly_price: "$9",
        benefits: "Full access to Premium Plus posts, Receive weekly email newsletter, Support indie publishing, Simple secure card payment, Access to exclusive deals"
    }
]

export default membershipSettings;