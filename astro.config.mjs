// @ts-check
import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
// https://github.com/delucis/astro-auto-import
import AutoImport from "astro-auto-import";
import { remarkReadingTime } from './src/utils/remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
    site: "https://x.soundjaeger.com",
    integrations: [
        AutoImport({
			imports: [
				"@components/Button.astro",
                "@components/ImageGallery.astro",
                "@components/Callout.astro",
                "@components/ToggleCards.astro",
                "@components/MediaEmbed.astro",
                "@components/VideoPlayer.astro"
			],
		}),
        mdx(),
        sitemap()
    ],
    markdown: {
        remarkPlugins: [remarkReadingTime],
    }
});
