export interface V1Post {
  id?: string;
  title?: string;
  slug?: string;
  date?: string;
  datetime?: string;
  snippet?: string;
  author: string;
  body?: string;
  guestBlog?: boolean;
  categories?: string[];
  image?: any;
  thumnail?: any;
  metadata?: any;
  [key: string]: any;
}

export interface V2Post {
  id?: string;
  title?: string;
  slug?: string;
  category?: any;
  ordering_date?: string;
  author: string[];
  product?: any;
  tags?: string[];
  main_image?: any;
  summary?: string;
  content?: any;
  blog_seo_meta_tags?: any;
  [key: string]: any;
}

export type Category = {
  id?: string;
  title?: string;
  slug?: string;
  meta?: any;
  itemType?: string;
  creator?: any;
  [key: string]: any;
};

export interface Tag {
  id?: string;
  slug?: string;
  title?: string;
}

export interface Person {
  id: string;
  name: string;
  job_title?: string;
  photo?: any;
  bio?: any;
  social_profiles?: any;
  company?: any;
}
