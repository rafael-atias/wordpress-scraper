// to configure dotenv
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

// this is a dependency of the transpiled file
import 'regenerator-runtime/runtime.js'

import { Credentials, Username } from "./typeDefinitions/types.js";
import { getContentFromWPBlog } from "./getContentFromWPBlog.js";


const credentials: Credentials = {
  username: process.env["BLOG_USERNAME"] ?? "",
  password: process.env["BLOG_PASSWORD"] ?? "",
  url: new URL(process.env["BLOG_URL_LOGIN"] ?? "/"),
};

const username: Username =
  (process.env["BLOG_AUTHOR_USERNAME"] || process.env["BLOG_USERNAME"]) ?? "";

getContentFromWPBlog(credentials, username)
  .then(console.log)
  .catch(console.error);
