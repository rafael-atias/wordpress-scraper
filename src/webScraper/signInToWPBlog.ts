import type { Credentials } from "../typeDefinitions/types.js";
import SignInError from "../typeDefinitions/SignInError.js";
import { Page } from "puppeteer";
import "regenerator-runtime/runtime.js";

/**
 * predicate to determine if an Error object is 
 * an instance of the TimeoutError class
 * 
 * @param {unknown} err a posible error object
 * @returns {boolean}   true if it is a TimeoutError; 
 *                      false othewrise
 */
const isTimeoutError = (err: unknown): err is Error => {
  type TimeoutError = import("puppeteer").TimeoutError;

  return (err as TimeoutError).name !== undefined
};

/**
 * predicate that signals if the browser has arrived
 * to the Wordpress dashboard after a sign in attempt
 *
 * @param {Page} page a Puppeteer's Page object
 * @returns {boolean} true if the browser has logged in;
 *                     otherwise, false
 */
const areWeInWPDashboard = async (page: Page): Promise<boolean> => {
  try {
    await Promise.all([
      page.waitForSelector("body.wp-admin"),
      page.waitForSelector("#adminmenumain"),
    ]);

    return true;
  } catch {
    return false;
  }
};

/**
 * a function that makes the browser to sign in to a
 * Wordpress blog given the right credentials
 *
 * @param {Page} page a Puppeteer's Page object
 * @param {String|URL} url the url to the login page
 * @param {String} username
 * @param {String} password
 * @returns {void} void
 */
export const signInToWPBlog = async (
  page: Page,
  credentials: Credentials
): Promise<void> => {
  const { url, username, password } = credentials;
  // let's try to sign in twice, just in case there is a login error.
  // Wordpress can throw a login error if the browser has not logged in
  // successsfully before or if Wordpress thinks the browser does not
  // accept cookies from any website
  for (let i = 0; i < 2; i++) {
    try {
      await page.goto(url.href);

      await Promise.all([
        page.waitForSelector("#user_login"),
        page.waitForSelector("#user_pass"),
        page.waitForSelector("#wp-submit"),
      ]);

      await Promise.all([
        page.type("#user_login", username),
        page.type("#user_pass", password)
      ]);

      await page.waitForTimeout(1000);

      await Promise.all([
        page.waitForNavigation({ waitUntil: "load" }), // The promise resolves after navigation has finished
        page.click("#wp-submit"), // Clicking the button will cause a navigation
      ]);

      if (await areWeInWPDashboard(page)) {
        return;
      }
    } catch (err) {
      // if the navigation times out, we try again
      if (isTimeoutError(err)) {
        console.log("We timed out; let's see if we can try to log in again");
      }
      continue;
    }
  }

  // if the control arrived here, then we could not sign in
  throw new SignInError("We could not sign in");
};
