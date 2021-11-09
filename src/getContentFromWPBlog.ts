import type { Credentials, Username, Post } from "./typeDefinitions/types.js";
import UnknownUserError from "./typeDefinitions/UnknownUserError.js";
import { scrapeWPBlog } from "./webScraper/scrapeWPBlog.js";
import {
  isWPRestAPIActive,
  fetchLatestsPosts,
} from "./restApi/requestThroughRestApi.js";

export const getContentFromWPBlog = async (
  credentials: Credentials,
  authorUsername: Username
): Promise<Post[]> => {
  const { url } = credentials;

  if (await isWPRestAPIActive(url)) {
    try {
      return await fetchLatestsPosts(url, authorUsername);
    } catch (error) {
      if (error instanceof UnknownUserError) {
        throw error;
      } 
      console.error("We could not retrieve content through the Wordpress REST API.\nI'll try to do it using the browser");
    }
  }

  return await scrapeWPBlog(credentials, authorUsername);
};
