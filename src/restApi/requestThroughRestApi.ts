import fetch from "node-fetch";
import { Username, Post, WordpressPost, WordpressUser, PostStatus } from "../typeDefinitions/types.js";
import UnknownUserError from "../typeDefinitions/UnknownUserError.js";

/**
 * fetches the author's id from the Wordpress REST API
 *
 * @param {URL} url
 * @param {string} author The author's username
 * @returns {number} an integer that represents the author's id
 */
const getAuthorId = async (url: URL, author: Username): Promise<number> => {
  /**
   * Gets a list of users
   *
   * If there is no session, the REST API will show only
   * the users with published content
   */
  const endpoint = `${url.origin}/wp-json/wp/v2/users`;

  const response = await fetch(endpoint);

  if (response.ok) {
    const users:WordpressUser[] = await response.json() as WordpressUser[];
    
    const user = users.find((user) => user.name.includes(author));

    if (user == undefined) {
      throw new UnknownUserError("Unknown username");
    } else {
      return user.id;
    }
  } else {
    throw new Error("We could not retrieve the author id");
  }
};

/**
 * checks if the Wordpress REST API is active.
 *
 * @param {URL} url
 * @returns {boolean} true if it is active;
 *                    otherwise, it returns false
 */
export const isWPRestAPIActive = async (url: URL): Promise<boolean> => {
  const response = await fetch(`${url.origin}/wp-json/`);

  return response.ok;
};

/**
 * fetches from the Wordpress REST API the latests posts
 * written by the given author
 *
 * @param {URL} url
 * @param {string} authorUsername
 * @returns {[Post]} the latests posts written by the given author
 */
export const fetchLatestsPosts = async (
  url: URL,
  authorUsername: Username
): Promise<Post[]> => {
  const authorId = await getAuthorId(url, authorUsername);

  /**
   * Gets a list of posts by the given author
   *
   * The endpoint receives some parameters:
   * - per_page: limits the number of posts the API will return.
   *             There is a hard limit of 100 posts
   * - author: to filter the posts belonging to that author
   * - fields: to filter the data regarding the posts
   *
   * @see https://developer.wordpress.org/rest-api/reference/posts/#schema
   *
   * **If we are not authenticated, we'll get only access
   * to the author's published posts, not the scheduled ones or drafts**
   */
  const endpoint: string = `${url.origin}/wp-json/wp/v2/posts?per_page=50&author=${authorId}&_fields=title,link,status,date`;

  const response = await fetch(endpoint);

  if (response.ok) {
    const posts: WordpressPost[] = await response.json() as WordpressPost[];

    return posts.map(
      (post) => {
        const { title: { rendered }, link, date, status } = post;

        return {
          title: rendered,
          url: new URL(link),
          date: new Date(date),
          status: status as PostStatus,
        };
      }
    );
  } else {
    throw new Error("We could not retrieve the posts data");
  }
};
