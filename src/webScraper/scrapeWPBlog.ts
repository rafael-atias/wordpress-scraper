import type { Browser, Page } from "puppeteer";
import puppeteer from 'puppeteer-extra';
import { signInToWPBlog } from "./signInToWPBlog.js";
import { getLatestPostsFromWPBlog } from "./scrapePosts.js";
import { Credentials, Username, Post } from "../typeDefinitions/types.js";
import 'regenerator-runtime/runtime.js'

/**
 * gets the latests posts by the current user from the
 * given blog
 *
 * @param {Credentials} credentials an object representing
 *                                  the sign in credentials
 * @param {Username} authorUsername the writer's username whose
 *                                  posts we want to retrieve
 * @returns {Post[]} The list of retrieved posts
 */
export const scrapeWPBlog = async (
  credentials: Credentials,
  authorUsername: Username,
): Promise<Post[]> => {
  let browser:Browser | null = null;

  let page:Page | null = null;

  let posts: Post[] = []
  try {
    // starts a Chrome instance
    browser = await puppeteer.launch({
      headless: false,
      //headless: true,
      // ignoreDefaultArgs: ['--disable-extensions'],
      // args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    // abre una página
    page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 768 });

    page.setDefaultTimeout(10000);

    await signInToWPBlog(page, credentials);

    posts = await getLatestPostsFromWPBlog(page, authorUsername);
  } catch (err) {
    console.error(err);
  } finally {
    await page?.close();
    await browser?.close();
  }

  return posts
};
