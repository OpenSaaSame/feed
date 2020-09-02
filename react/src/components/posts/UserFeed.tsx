import React from 'react';
import {Card, Container} from "semantic-ui-react";
import SinglePost from "./SinglePost";
import {Post} from "@daml-js/openwork-feeds-0.0.1/lib/Post";

type Props = {
  allPosts: Post[];
  filter?: (value: Post, index?: number, Array?: Post[]) => boolean;
}

/**
 * Displays a feed of posts to a user
 *
 * @param allPosts  The Active Contract Set (ACS) available to the current logged in user (required for calculating stats, ie. comment count)
 * @param filter    Filter to display only a subset of posts (ie, a user profile)
 */
const UserFeed: React.FC<Props> = ({allPosts, filter}) => {

  const posts = () => {
    return (filter) ? allPosts.filter(filter) : allPosts;
  };

  return (
    <Container>
      <Card.Group>
        {[...posts()]
          .map(post => <SinglePost post={post} allPosts={allPosts} key={post.id}/>)
        }
      </Card.Group>
    </Container>
  )
};

export default UserFeed;