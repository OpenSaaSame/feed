import React from 'react';
import {Comment, Icon, Message, Segment} from "semantic-ui-react";
import moment from "moment";
import PostModal, {TriggerType} from "./PostModal";
import {Link, useParams} from 'react-router-dom';
import SinglePost from "./SinglePost";
import LoadingSegment from "../common/LoadingSegment";
import {Post} from "@daml-js/openwork-feeds-0.0.1/lib/Post";

type Props = {
  allPosts: Post[];
  isLoading: boolean;
}

/**
 * Displays a post with all its replies
 *
 * @param allPosts  The Active Contract Set of posts visible to the current logged in user
 * @param isLoading State of the ACS stream of posts
 */
const CommentView: React.FC<Props> = ({allPosts, isLoading}) => {
  const {authorUsername, postId} = useParams();

  // Get the post from the URL params
  const rootPost = allPosts.find(p => p.author.username === authorUsername && p.id === postId);

  // Finds all posts which are a child of the target post
  const getChildPosts = (targetPost: Post) => {
    return allPosts
      .filter(p => p.parentPost !== null)
      .filter(p => p.parentPost!._1 === targetPost.author.username && p.parentPost!._2 === targetPost.id);
  };

  // Recursively generates a graph of comments
  const getComments = (targetPost: Post) => {
    return getChildPosts(targetPost)
      .map(post => {
        const childPosts = getComments(post);

        return (
          <Comment>
            <Comment.Avatar src={post.author.avatarUrl}/>
            <Comment.Content>
              <Link to={`/user/${post.author.username}`}>
                <Comment.Author as='a'>
                  {post.author.displayName}
                </Comment.Author>
              </Link>
              <Comment.Metadata>{moment().utc().to(post.createdAt)}</Comment.Metadata>
              <Comment.Text>
                <div style={{whiteSpace: "pre-line"}}>{post.body}</div>
              </Comment.Text>
              <Comment.Actions>
                <Comment.Action>
                  <PostModal isReply={true}
                             replyPost={post}
                             triggerType={TriggerType.CommentReply}/>
                </Comment.Action>
              </Comment.Actions>
            </Comment.Content>
            {childPosts.length > 0 && <Comment.Group>{childPosts}</Comment.Group>}
          </Comment>
        )
      })
  };

  return (
    <>
      {isLoading
        ? <LoadingSegment repeating={4}/>
        : rootPost
          ? <>
            <SinglePost post={rootPost} allPosts={allPosts}/>
            <Comment.Group threaded>
              {getComments(rootPost)}
            </Comment.Group>
          </>
          : <Segment>
            <Message icon={true} floating>
              <Icon color='blue' name='sticky note'/>
              <Message.Content>
                <Message.Header>Post not found</Message.Header>
                Ensure you are following the user who created the post and that they have accepted your request!
              </Message.Content>
            </Message>
          </Segment>
      }
    </>
  );
};

export default CommentView;