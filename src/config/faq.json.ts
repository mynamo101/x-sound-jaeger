import type { ToggleCard } from "@src-types/types.ts";

/**
 * Array of toggle cards for FAQ page.
 */

const faqSettings: ToggleCard[] = [
    { title: 'About', type: 'section' },
    {
        title: 'Who are you?',
        text: "Hi, I'm Ethan! I used to be an sound designer and audio editor for games and animations, and I have over 10 years of experience in audio production."
    },
    {
        title: 'What do you do?',
        text: 'I specialize in the production of adult animation, sound design, and audio editing, dedicated to delivering high-quality adult animation content.'
    },
    {
        title: 'Should I pay for your works?',
        text: 'No! All my works are free to watch! However, if you like my works and want to support me, you can do so through Patreon, BuyMeACoffee, or Ko-Fi. Your support will help me continue creating more high-quality audio content!'
    },
    {
        title: 'How can I contact you?',
        text: 'You can contact me via X(@x_soundjaeger) or tg(@x_soundjaeger).'
    },
    { title: 'Commissions', type: 'section' },
    {
        title: 'Would you accept commissions?',
        text: 'For sure! I am open to accepting custom commissions. If you have any specific requirements, please let me know.'
    },
    {
        title: 'What types of projects can you accept?',
        text: 'I accept all kinds of custom adult animation sound projects. There are no restrictions on themes, as long as it is within my capabilities.'
    },
    {
        title: 'What specific content you will not accept?',
        text: 'I am happy to produce various types of adult audio works, but I will not accept any projects involving minors or illegal content.'
    },
    { title: 'Collaboration', type: 'section' },
    {
        title: 'Would you accept collaborations?',
        text: 'Absolutely! I love collaborating with other creators, services exchange is also welcome.'
    },
        {
        title: 'How long does delivery usually take?',
        text: 'Audio under 30 seconds: 1 day; 30 seconds to 1 minute: 2 days; 1-2 minutes: 6 days; over 5 minutes: 7 days. The exact time may vary depending on project complexity.'
    },
    {
        title: 'What is your workflow?',
        text: 'I will first confirm the project requirements with you. If you have prepared commission visuals, I will provide sound production direction and suggestions based on your visuals, and confirm with you within one business day.'
    },
    {
        title: 'Can I use my own audio materials?',
        text: 'Of course! If you have your own audio materials, I can help you edit and process them to ensure the final result meets your needs.'
    },
    {
        title: 'Can you provide voice actors if needed?',
        text: 'Generally, to control costs, I use a library of voice actor audio materials, which saves time and money. If you need a specific voice actor, I can also help find a suitable candidate.'
    },
    {
        title: 'What if my budget is limited?',
        text: 'I am happy to collaborate with all kinds of creators. If your budget is limited, you can discuss with me, and I can handle it flexibly through mutual cooperation, such as tagging my social media accounts or mentioning my services in your work.'
    },
    { title: 'Membership and Payment', type: 'section' },
    {
        title: 'What is about the membership?',
        text: 'I offer a membership program that provides exclusive benefits, such as early access to new content.'
    },
    {
        title: 'How do I pay?',
        text: 'I currently support PayPal, Ko-Fi, BuyMeACoffee, and other payment methods. I can also discuss other options according to your needs.'
    },
    { title: 'Sharing', type: 'section' },
    {
        title: 'Will you repost my work?',
        text: 'For mutual collaborations, I will share your work on social media after the project is completed and tag your account. If you do not want me to share, please let me know in advance. For paid projects, I will respect your wishes regarding reposting or sharing.'
    }
];


export default faqSettings;