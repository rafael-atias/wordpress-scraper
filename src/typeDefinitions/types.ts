export type Credentials = {
  username: Username;
  password: string;
  url: URL;
};

type ValidUsername = string;
type NullUsername = "";

export type Username = ValidUsername | NullUsername;



export type PostStatus = "publish" | "future";

export type Post = { 
  title: string,
  url: URL,
  date: Date,
  status: PostStatus,
}

export type User = {
  name: string,
  id: number,
}

type PostTitle = {
  rendered: string,
}

export type WordpressPost = {
  date: string,
  date_gmt?: string,
  guid?: object,
  id: number,
  link: string,
  modified?: string,
  modified_gmt?: string,
  slug?: string,
  status: string,
  type?: string,
  password?: string,
  permalink_template?: string,
  generated_slug?: string,
  title: PostTitle,
  content?: object,
  author: number,
  excerpt?: object,
  featured_media?: number,
  comment_status?: string,
  ping_status?: string,
  format?: string,
  meta?: object,
  sticky?: boolean,
  template?: string,
  categories?: string[],
  tags?: string[]
}

export type WordpressUser = {
  id: number,
  username: string, 
  name: string,
  first_name: string,
  last_name: string,
  email: string,
  url: string,
  description: string,
  link: string, 
  locale: string,
  nickname: string,
  slug: string,
  registered_date: string,
  roles?: any[],
  password: string,
  capabilities: object,
  extra_capabilities: object,
  avatar_urls: object,
  meta: object,
}
