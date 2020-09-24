import React from "react";
import {Divider, Header, Icon, Segment} from "semantic-ui-react";
import PostModel, {TriggerType} from "./PostModal";
import UserFeed from "./UserFeed";
import LoadingSegment from "../common/LoadingSegment";
import {Post} from "@daml-js/openwork-feed-0.0.1/lib/Post";

type Props = {
  allPosts: Post[];
  isLoading: boolean;
}

/**
 * UI Component for displaying the users feed of posts
 *
 * @param allPosts  The Active Contract Set of posts visible to the current logged in user
 * @param isLoading State of the ACS stream of posts
 */
const UserFeedView: React.FC<Props> = ({allPosts, isLoading}) => {

  return (
    <Segment>
      <Header as='h2'>
        <PostModel isReply={false} triggerType={TriggerType.NewPost}/>
        <Icon color='blue' name='sticky note'/>
        <Header.Content>
          Posts
          <Header.Subheader>My Feed</Header.Subheader>
        </Header.Content>
      </Header>
      <Divider/>
      {isLoading
        ? <LoadingSegment repeating={4}/>
        : <UserFeed allPosts={allPosts}/>
      }
    </Segment>
  )
};

export default UserFeedView;