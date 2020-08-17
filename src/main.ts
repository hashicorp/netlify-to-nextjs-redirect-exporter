import ObjectsToCsv from "objects-to-csv";
import client, { buildModularBlock } from "./client";
import { collectPostCategories } from "./category";
import { Category, Person, V1Post, V2Post, Tag } from "./types";
import { hasInvalidAuthor } from "./authors";
import { CSV_FILENAME, MAX_SUMMARY_LENGTH } from "./constants";

run();

async function run() {
  try {
    const posts = await getAllBlogPosts();
    const v2Posts = await getAllV2BlogPosts();
    const categories = await getBlogPostCategories();
    const people = await getAllPeople();
    const allTags = await getAllTags();

    const blogPostMetaPromises = posts.map(async (post, idx) => {
      console.log(`Processing blog post ${idx + 1} of ${posts.length}...`);

      const qaNotes = [];

      const { products, category, tags } = collectPostCategories(
        post,
        categories
      );

      // Add note from categorization
      if (category.message) qaNotes.push(category.message);

      // Validate tags
      if (tags.some((tag) => tag.slug === "<empty>")) {
        qaNotes.push("Could not find category to create new tag.");
      }

      // Create tags and collect their ids in an array
      const tagIds = await createTags(tags, allTags);

      // Validate author
      if (hasInvalidAuthor(post.author, people)) {
        qaNotes.push(
          "Author has been flagged as invalid. Ensure that the author exists in the 'People' model and that it refers to a single individual"
        );
      }

      // Validate summary
      if (post.snippet) {
        if (post.snippet.length > MAX_SUMMARY_LENGTH) {
          qaNotes.push(
            `Summary is truncated as it exceeded the valid limit of ${MAX_SUMMARY_LENGTH} characters.`
          );
        }
      }

      // Create modular content
      const content = [
        buildModularBlock({
          itemType: "241843",
          content: post.body,
        }),
      ];

      const blogPost = {
        title: post.title,
        slug: post.slug,
        category: category.categoryId,
        orderingDate: post.datetime ? post.datetime : `${post.date}T10:00:00`,
        author: [post.author],
        product: products,
        tags: tagIds,
        mainImage: post.image,
        summary: post.snippet?.substring(0, MAX_SUMMARY_LENGTH - 1),
        content,
        blogSeoMetaTags: post.metadata,
      };

      // Create blog post
      const postId = await createBlogPost(blogPost, v2Posts);

      return {
        postTitle: post.title,
        v1DatoLink: `https://hashicorp.admin.datocms.com/editor/item_types/13060/items/${post.id}/edit`,
        v2DatoLink: `https://hashicorp.admin.datocms.com/editor/item_types/221320/items/${postId}/edit`,
        qaNotes: qaNotes.length ? qaNotes.join(", ") : "(No Q/A notes)",
        liveUrl: `https://www.hashicorp.com/blog/${post.slug}`,
      };
    });

    const postsMetadata = await Promise.all(blogPostMetaPromises);

    const csv = new ObjectsToCsv(postsMetadata);
    await csv.toDisk(`./${CSV_FILENAME}.csv`);
  } catch (error) {
    console.error("An error ocurred during script execution: ", error);
  }
}

async function getAllBlogPosts(): Promise<V1Post[]> {
  return await client.items.all(
    { "filter[type]": "blog_post", version: "latest" },
    { allPages: true }
  );
}

async function getAllV2BlogPosts(): Promise<V2Post[]> {
  return await client.items.all(
    { "filter[type]": "blog_post_v2", version: "latest" },
    { allPages: true }
  );
}

async function getBlogPostCategories(): Promise<Category[]> {
  return await client.items.all({ "filter[type]": "blog_post_category" });
}

async function getAllPeople(): Promise<Person[]> {
  return await client.items.all(
    { "filter[type]": "person", version: "latest" },
    { allPages: true }
  );
}

async function getAllTags(): Promise<Tag[]> {
  return await client.items.all(
    { "filter[type]": "blog_tags_v2" },
    { allPages: true }
  );
}

async function createTags(tags: Tag[], allTags: Tag[]): Promise<string[]> {
  try {
    if (!tags.length) return [];

    const tagRecordIdPromises: Promise<string>[] = tags.map(async (tag) => {
      // Find and return tag's id if it already exists
      // Otherwise, create it and return the newly created record id
      const found = allTags.find((datoTag) => datoTag.slug === tag.slug);
      if (found) {
        console.log(`A tag with the slug ${found.slug} already exists...`);
        return found.id;
      } else {
        console.log(`Creating new tag with slug: ${tag.slug}...`);
        const tagRecord = await client.items.create({
          itemType: "221334",
          title: tag.title,
          slug: tag.slug,
        });

        return tagRecord.id;
      }
    });

    return await Promise.all(tagRecordIdPromises);
  } catch (error) {
    console.error("Error creating tag: ", error);
    return [];
  }
}

async function createBlogPost(
  post: V2Post,
  existingPosts: V2Post[]
): Promise<string | undefined> {
  try {
    const found = existingPosts.find((v2Post) => v2Post.slug === post.slug);

    if (found) {
      console.log(`A post with the slug ${found.slug} already exists...`);
      return found.id;
    } else {
      console.log(`Creating new post with slug: ${post.slug}...`);
      const record = await client.items.create({
        itemType: "221320",
        ...post,
      });

      return record.id;
    }
  } catch (error) {
    console.error("Error creating blog post: ", error);
    return;
  }
}
