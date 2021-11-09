import { Username, Post, PostStatus, Page } from "../typeDefinitions/types.js";

/**
 * predicate that checks if the browser is on the posts list page
 *
 * @param {Page} page a Puppeteer's Page object
 * @returns {boolean}
 */
const areWeOnPostsList = async (page: Page): Promise<boolean> => {
  try {
    await Promise.all([
      page.url().includes("edit.php"),
      page.waitForSelector("a.page-title-action[href*='post-new.php']"), // Add new post linkbutton
    ]);

    return true;
  } catch {
    return false;
  }
};

/**
 * finds the posts list link on the Wordpres menu
 * and navigates to it
 *
 * @param {Page} page a Puppeteer's Page object
 * @returns {void}
 */
const navigateToPostsList = async (page: Page) => {
  const menuId = "#menu-posts";
  const postsListPageLink = "a[href*='edit.php']";

  await Promise.all([
    page.waitForSelector(menuId),
    page.waitForSelector(postsListPageLink),
  ]);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "load" }),
    page.click(postsListPageLink),
  ]);

  if (!areWeOnPostsList(page)) {
    throw new Error("We cannot reach the posts list page");
  }
};

/**
 * filters out any post that was not written by the
 * writer keeping the blog up to date
 *
 * @param {Page} page a Puppeteer's Page object
 * @param {String} authorUsername a string representing
 *                                the maintainer's username
 * @returns {void} void
 */
const showOnlyMaintainerPosts = async (
  page: Page,
  authorUsername: Username
) => {
  const postsFilterSelector = ".author.column-author > a";

  await page.waitForSelector(postsFilterSelector);

  const absoluteLink = await page.evaluate(
    (selector, author) => {
      const links = Array.from(document.querySelectorAll(selector));

      return links.find((link) => link.textContent.includes(author)).href;
    },
    postsFilterSelector,
    authorUsername
  );

  const index = absoluteLink.search(/edit.php/);

  const relativeLink = absoluteLink.slice(index);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "load" }),
    page.click(`a[href$='${relativeLink}']`),
  ]);
};

/**
 * filters the posts list and returns an array of posts
 *
 * @param {Page} page a Puppeteer's Page object
 * @returns {[Post]} an array of posts
 */
const getOnlyRelevantPosts = async (
  page: Page,
  authorUsername: Username
): Promise<Post[]> => {
  const numberOfPostsToGet: number = 20;

  // we have to filter out first the irrelevant posts
  // and then wait for the selector "#the-list".
  // Thus, we can be sure the posts list was effectively filtered
  await Promise.all([
    showOnlyMaintainerPosts(page, authorUsername), 
    page.waitForSelector("#the-list")
  ]);

  return await page.evaluate((limit) => {
    // Wordpress shows the status and publishing date in a string of the form
    // StatusDate at Time
    // for instance: Published10/27/2021 at 9:00
    // There is **no** whitespace between the status and the date
    const parseDateString = (
      post: Element
    ): { publishingDate: string; status: string } => {
      try {
        const text =
          post.querySelector(".date.column-date")?.textContent?.trim() || "";
        const index = text.search(/\d/);

        return {
          publishingDate: text.slice(index, text?.search(/\s/)),
          status: text.slice(0, index),
        };
      } catch (err) {
        throw new Error(
          "Could not find the column Date in the posts list page"
        );
      }
    };
    
    const posts: Element[] = Array.from(document.querySelectorAll(".type-post.status-publish"));

    return posts
      .map((post) => {
        const parsedDateString = parseDateString(post);

        const link: string =
          (post.querySelector(".view a") as HTMLAnchorElement)?.href?.trim() ||
          "";

        return {
          title: post.querySelector(".row-title")?.textContent?.trim() || "",
          url: new URL(link),
          status: parsedDateString?.status as PostStatus,
          date: new Date(parsedDateString?.publishingDate) || new Date(),
        };
      })
      .filter((_post, index) => index < limit);
  }, numberOfPostsToGet);
};

/**
 * retrieves the latests posts by the given author
 *
 * @param {Page} page a Puppeteer's Page object
 * @param {string} authorUsername the author's username whose posts
 *                                we are interested in
 * @returns {[Post]} a list of posts
 */
export const getLatestPostsFromWPBlog = async (
  page: Page,
  authorUsername: Username
): Promise<Post[]> => {
  await navigateToPostsList(page);
  await page.waitForTimeout(1000);
  return await getOnlyRelevantPosts(page, authorUsername);
};
