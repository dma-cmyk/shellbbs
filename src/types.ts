export interface Thread {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  postCount?: number;
}

export interface Post {
  id: string;
  threadId: string;
  author: string;
  content: string;
  timestamp: string;
}
