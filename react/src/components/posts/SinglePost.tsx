import React from "react";
import {Card, Grid, Icon, Image} from "semantic-ui-react";
import PostModal, {TriggerType} from "./PostModal";
import moment from "moment";
import {useLedger, useParty} from "@daml/react";
import {Link} from "react-router-dom";
import RepostModal from "./RepostModal";
import {Post} from "@daml-js/openwork-feeds-0.0.1/lib/Post";

type Props = {
  post: Post;
  allPosts: Post[];
}

/**
 * React Component representing an individual post
 *
 * @param post      An individual post to display
 * @param allPosts  Active Contract Set of posts for the logged in user
 */
const SinglePost: React.FC<Props> = ({post, allPosts}) => {
  const username = useParty();
  const ledger = useLedger();
  const [isLiking, setIsLiking] = React.useState(false);

  // Gets the reply count
  const getReplyCount = (post: Post): number => {
    return allPosts
      .filter(p => p.parentPost !== null)
      .filter(p => p.parentPost!._1 === post.author.username && p.parentPost!._2 === post.id)
      .length;
  };

  // Liking/un-licking posts
  const isLikeDisabled = (post: Post): boolean => post.author.username === username;

  const onExerciseLike = async (post: Post): Promise<boolean> => {
    setIsLiking(true);
    const hasAlreadyLikedPost = post.likes.find(party => party === username);
    const key = {_1: post.author.username, _2: post.id};
    try {
      if (!hasAlreadyLikedPost) {
        await ledger.exerciseByKey(Post.Post_like_ADD, key, {liker: username});
      } else {
        await ledger.exerciseByKey(Post.Post_like_REMOVE, key, {liker: username});
      }
      return true;
    } catch (error) {
      alert("Unknown error:\n" + JSON.stringify(error));
      return false;
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card fluid raised>
      <Card.Content>
        <PostModal isReply={true}
                   replyPost={post}
                   triggerType={TriggerType.PostReply}/>
        <Link to={`/user/${post.author.username}`}>
          <Image avatar floated='left' size='big' src={post.author.avatarUrl}/>
        </Link>
        <Card.Header>
          <Link to={`/user/${post.author.username}`} style={{color: '#000000'}}>
            {post.author.displayName}
          </Link>
        </Card.Header>
        <Card.Meta>
          {post.isRepost
            ? <Icon color='blue' name='retweet'/>
            : <Icon color='blue' name='calendar alternate outline'/>
          }
          &nbsp;{moment().utc().to(post.createdAt)}
        </Card.Meta>
      </Card.Content>
      <Card.Content>
        <Card.Description>
          <div style={{whiteSpace: "pre-line"}}>{post.body}</div>
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <Grid columns={3}>
          <Grid.Row>
            <Grid.Column>
              <Icon
                link
                color='red'
                loading={isLiking}
                name='like'
                disabled={isLikeDisabled(post)}
                onClick={() => onExerciseLike(post)}/>
              {post.likes.length}
            </Grid.Column>
            <Grid.Column textAlign='center'>
              <RepostModal post={post}/>
            </Grid.Column>
            <Grid.Column textAlign='right'>
              <Link to={`/user/${post.author.username}/post/${post.id}`}>
                <Icon
                  link
                  color='blue'
                  name='comment'/>
              </Link>
              {getReplyCount(post)}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Card.Content>
    </Card>
  );

};

export default SinglePost;