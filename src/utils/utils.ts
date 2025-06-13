import { getCollection, type CollectionEntry } from "astro:content";

export async function getSortedPosts({
  limit,
  featured = false
}: { limit?: number; featured?: boolean } = {}) {
  const posts = await getCollection("blog", ({ data }) => {
    return !data.draft && (!featured || data.featured);
  });

  posts.sort((a, b) => new Date(b.data.pub_date).getTime() - new Date(a.data.pub_date).getTime());

  const total_posts = posts.length;

  return {
    posts: limit ? posts.slice(0, limit) : posts,
    total_posts
  };
}
  
export function getPostWithSiblings(posts: CollectionEntry<"blog">[], index: number) {
    const previous_post = posts[index + 1] || null;
    const next_post = posts[index - 1] || null;
  
    return { previous_post, next_post };
}

export async function getTags() {
  const { posts } = await getSortedPosts();

  const tags = posts.flatMap(post => post.data.tags ?? []).filter(tag => tag !== undefined && tag !== null);

  const tagData = [
    ...new Set(
      tags.map(tag => ({
        original: tag,
        slug: slugify(tag),
      }))
    ),
  ];

  return tagData;
}

export function getUniqueTagsWithCount(tags) {
  const tagMap = new Map();

  tags.forEach(({ original, slug }) => {
    if (tagMap.has(slug)) {
      tagMap.get(slug).count += 1;
    } else {
      tagMap.set(slug, { original, slug, count: 1 });
    }
  });

  return Array.from(tagMap.values()).sort((a, b) => a.original.localeCompare(b.original));
}

export async function getPostsByTag({
  tag,
  limit,
}: { tag?: string; limit?: number } = {}) {
  const posts = await getCollection("blog", ({ data }) => {
    const normalizedTag = tag ? tag.toLowerCase() : null;

    return !data.draft && (
      !normalizedTag || (data.tags && data.tags.some(postTag => postTag.toLowerCase() === normalizedTag))
    );
  });

  posts.sort((a, b) => new Date(b.data.pub_date).getTime() - new Date(a.data.pub_date).getTime());

  const total_posts = posts.length;

  return {
    posts: limit ? posts.slice(0, limit) : posts,
    total_posts,
  };
}

export async function getAuthors() {
  const { posts } = await getSortedPosts();

  const authors = posts.flatMap(post => post.data.authors ?? []).filter(author => author !== undefined && author !== null);

  const tagData = [
    ...new Set(
      authors.map(author => ({
        original: author,
        slug: slugify(author),
      }))
    ),
  ];

  return tagData;
}

export async function getPostsByAuthor({
  author,
  limit,
}: { author?: string; limit?: number } = {}) {
  const posts = await getCollection("blog", ({ data }) => {
    const normalizedAuthor = author ? author.toLowerCase() : null;

    return !data.draft && (
      !normalizedAuthor || (data.authors && data.authors.some(postAuthor => postAuthor.toLowerCase() === normalizedAuthor))
    );
  });

  posts.sort((a, b) => new Date(b.data.pub_date).getTime() - new Date(a.data.pub_date).getTime());

  const total_posts = posts.length;

  return {
    posts: limit ? posts.slice(0, limit) : posts,
    total_posts,
  };
}

export function getUniqueAuthorsWithCount(authors) {
  const authorMap = new Map();

  authors.forEach(({ original, slug }) => {
    if (authorMap.has(slug)) {
      authorMap.get(slug).count += 1;
    } else {
      authorMap.set(slug, { original, slug, count: 1 });
    }
  });

  return Array.from(authorMap.values());
}

export function slugify(text: string): string {
  return text
    .toString()                      // Ensure it's a string
    .normalize('NFD')                 // Normalize characters (e.g., é becomes e)
    .replace(/[\u0300-\u036f]/g, '')  // Remove diacritics
    .toLowerCase()                   // Convert to lowercase
    .trim()                           // Remove leading/trailing spaces
    .replace(/[^a-z0-9 -]/g, '')      // Remove non-alphanumeric characters
    .replace(/\s+/g, '-')             // Replace spaces with hyphens
    .replace(/-+/g, '-');             // Replace multiple hyphens with one
}

export function getImage({ folder_name, image_name, glob } : { image_name: string; folder_name: string, glob: Record<string, {default: string;}>}) {
  const imagePath = glob[`/src/assets/images/${folder_name}/${image_name}.jpg`] || 
                    glob[`/src/assets/images/${folder_name}/${image_name}.jpeg`] ||
                    glob[`/src/assets/images/${folder_name}/${image_name}.png`] ||
                    glob[`/src/assets/images/${folder_name}/${image_name}.webp`] ||
                    glob[`/src/assets/images/${folder_name}/${image_name}.gif`] ||
                    glob[`/src/assets/images/${folder_name}/${image_name}.svg`];

  return imagePath ? imagePath.default : null;
}

