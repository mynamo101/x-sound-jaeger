import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/utils.js";
import globalSettings from '@config/config.json.ts';

import "@styles/tag-card.css";

export async function GET(context) {
    const { posts } = await getSortedPosts();

    return rss({
        title: globalSettings.site_meta_title,
        description: globalSettings.site_meta_description,
        site: context.site,
        xmlns: {
            media: "http://search.yahoo.com/mrss/",
            atom: "http://www.w3.org/2005/Atom",
        },
        customData: `<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml" />`,
        items: posts.map((post) => {
            const image = post.data.feature_image;
            const mediaContent = image
                ? `<media:content
                    type="image/${image.format === "jpg" ? "jpeg" : "png"}"
                    width="${image.width}"
                    height="${image.height}"
                    medium="image"
                    url="${context.site.origin}${image.src}" />`
                : "";

            return {
                title: post.data.title,
                description: post.data.excerpt,
                pubDate: post.data.pub_date,
                link: `/blog/${post.id}/`,
                customData: mediaContent,
            };
        }),
    });
}
