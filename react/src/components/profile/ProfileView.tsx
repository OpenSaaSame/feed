import React, {useEffect, useMemo, useState} from "react";
import {Button, Divider, Header, Icon, Image, List, Menu, Message, Modal, Segment} from "semantic-ui-react";
import UserFollowerList from "./UserFollowerList";
import {Party} from "@daml/types";
import moment from "moment";
import {QueryResult, useParty} from "@daml/react";
import {useParams} from "react-router-dom";
import UserFeed from "../posts/UserFeed";
import EditProfileView from "./EditProfileView";
import AvatarModal from "../common/AvatarModal";
import {Follower, Post, User} from "@daml-js/openwork-feed-0.0.1/lib/Post";

type Props = {
  allUsers: QueryResult<User, string, any>;
  publicUser: string;
  allPosts: Post[];
  onAddParty: (party: Party, isLoading: (loading: boolean) => void) => Promise<boolean>;
  onProfileMatches: () => void;
  onProfileMisMatch: () => void;
}

/**
 * Displays a user profile
 *
 * @param allPosts          The Active Contract Set (ACS) available to the current logged in user
 * @param publicUser        Public user of the ledger
 * @param onAddParty        Function to execute when making a request to follow a user
 * @param onProfileMatches  Function to execute when the current logged in user matches the profile to display
 * @param onProfileMisMatch Function to execute when the profile to display isn't the logged in user
 */
const ProfileView: React.FC<Props> = ({allUsers, publicUser, allPosts, onAddParty, onProfileMatches, onProfileMisMatch}) => {
  const username = useParty();
  const {profileUsername} = useParams();
  const [activeMenuItem, setActiveMenuItem] = useState('posts');
  const [editProfile, setEditProfile] = useState(false);

  // Handle when the logged in user matches the target user
  useEffect(() => (profileUsername === username) ? onProfileMatches() : onProfileMisMatch());

  const profileUser = useMemo(() => {
    return allUsers
      .contracts
      .map(u => u.payload)
      .find(u => u.username === profileUsername);
  }, [allUsers, profileUsername]);

  // Exclude the ledger's public user from the list of followers
  const profileUserFollowers = () => {
    let followers: Follower[] = [];
    if (profileUser)
      followers = profileUser.followers.filter(f => f.username !== publicUser);
    return followers;
  };

  const UserPosts = (): React.ReactElement =>
    <UserFeed
      allPosts={allPosts}
      filter={(p) => p.author.username === profileUsername}/>;

  const EditModel = (profile: User): React.ReactElement =>
    <Modal
      closeIcon
      trigger={<Button primary floated='right' onClick={() => setEditProfile(true)}>Edit</Button>}
      size='tiny'
      centered={false}
      dimmer='blurring'
      open={editProfile}
      onClose={() => setEditProfile(false)}>
      <Modal.Header>
        Edit Profile
      </Modal.Header>
      <Modal.Content>
        <EditProfileView existingUser={profile} afterLedgerSubmit={() => setEditProfile(false)}/>
      </Modal.Content>
    </Modal>;

  return (
    <Segment loading={allUsers.loading}>
      {profileUser &&
      <>
        <Header as='h2' size='huge'>
          {profileUsername === username && <EditModel {...profileUser}/>}
            <AvatarModal {...profileUser} trigger={<Image avatar src={profileUser.avatarUrl} style={{cursor: "pointer"}}/>}/>
            <Header.Content content={profileUser.displayName}/>
        </Header>
          <Divider/>
          <List relaxed>
            <List.Item>
              <List.Icon link color='blue' name='user'/>
              <List.Content>{profileUser.username}</List.Content>
            </List.Item>
            <List.Item>
              <List.Icon color='blue' name='at'/>
              <List.Content>{profileUser.email}</List.Content>
              </List.Item>
            <List.Item>
              <List.Icon color='blue' name='eye'/>
              <List.Content>{profileUser.description}</List.Content>
            </List.Item>
            <List.Item>
              <List.Icon color='blue' name='calendar alternate outline'/>
              <List.Content>Joined {moment(profileUser.createdAt).format('MMMM YYYY')}</List.Content>
            </List.Item>
            <List.Item>
                <List.Icon color='blue' name='angle double right'/>
                <List.Content>{profileUserFollowers().length} Following</List.Content>
            </List.Item>
          </List>
          <Menu pointing secondary>
            <Menu.Item
              name='posts'
              active={activeMenuItem === 'posts'}
              onClick={() => setActiveMenuItem('posts')}/>
            <Menu.Item
              name='followers'
              active={activeMenuItem === 'followers'}
              onClick={() => setActiveMenuItem('followers')}/>
          </Menu>
        {activeMenuItem === 'posts' && <UserPosts/>}
        {activeMenuItem === 'followers' && <UserFollowerList followers={profileUserFollowers()}/>}
      </>
      }
      {!allUsers.loading && !profileUser &&
      <Message icon={true} floating>
        <Icon name='user'/>
          <Message.Content>
            <Message.Header>User not found</Message.Header>
              Ensure you are following the user and that they have accepted your request!
          </Message.Content>
      </Message>}
    </Segment>
  )
};

export default ProfileView;