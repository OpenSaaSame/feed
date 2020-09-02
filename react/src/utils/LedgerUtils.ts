import {Post_CREATE} from "@daml-js/openwork-feeds-0.0.1/lib/Post";

export const generatePost = (id: string, body: string, isRepost: boolean, parentPost: { _1: string, _2: string } | null): Post_CREATE => {
  return {
    id,
    body,
    isRepost,
    parentPost,
    postCreatedAt: new Date().toISOString()
  };
};