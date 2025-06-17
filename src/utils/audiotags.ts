import { getSortedaudiopackss } from "@utils/utils.js";
import audiotagsSettings from "@config/audiotags.json.ts";
import { slugify } from "@utils/utils";

export async function getAudioTagsWithCount() {
  const { audiopackss } = await getSortedaudiopackss();
  const allTags = audiopackss.flatMap(pack => pack.data.tags ?? []).filter(Boolean);
  const uniqueTags = Array.from(new Set(allTags));
  return uniqueTags.map(tag => {
    const found = audiotagsSettings.find(t => slugify(t.slug) === slugify(tag));
    return {
      original: tag,
      slug: slugify(tag),
      description: found?.description,
      zh: found?.zh,
      count: allTags.filter(t => slugify(t) === slugify(tag)).length
    };
  }).sort((a, b) => a.original.localeCompare(b.original));
}
