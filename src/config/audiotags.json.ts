import type { TagProps } from "@src-types/types.ts";

/**
 * Array of tag descriptions for audiopacks page.
 */

const audiotagsSettings: TagProps[] = [
    {
        slug: "water",
        description: "this is the tag for the Water audiopack.",
        zh: "這是水的音色包的標籤。"
    },
    {
        slug: "fire",
        description: "this is the tag for the Fire audiopack.",
        zh: "這是火的音色包的標籤。"
    },
    {
        slug: "audiopacks",
        description: "所有音色包相關內容。",
        zh: "所有音色包相關內容。"
    }
    // 可根據需要繼續新增 audiopacks 專用的 tag
];

export default audiotagsSettings;