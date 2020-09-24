import React, {useMemo, useState} from "react";
import {Party} from "@daml/types";
import {useStreamQuery} from "@daml/react";
import {Button, Card, Icon, Image, Segment} from "semantic-ui-react";
import {CreateEvent} from "@daml/ledger";
import {User, UserFollowerProposal} from "@daml-js/openwork-feed-0.0.1/lib/Post";

type Props = {
  currentUser: User | undefined;
  addFollower: (party: Party, isLoading: (loading: boolean) => void) => Promise<boolean>;
  followProposals: readonly CreateEvent<UserFollowerProposal, any, any>[]
}

/**
 * Retreives and displays the list of all users in the system.
 *
 * Note - This component needs to be enclosed inside a DamlLedger tag with public credentials so the
 * Daml React hooks use the public user and token to connect and stream readonly data from the ledger.
 *
 * @param currentUser     Current logged in user's profile contract
 * @param addFollower     Function to execute when a user wishes to follow another user in the system.
 * @param followProposals List of existing follow proposals
 */
const PublicUserList: React.FC<Props> = ({currentUser, addFollower, followProposals}) => {

  const allUsersStream = useStreamQuery(User);
  const allUsers = useMemo(() =>
      allUsersStream
        .contracts
        .map(u => u.payload)
        .filter(u => currentUser ? u.username !== currentUser.username : true)
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
    , [allUsersStream, currentUser]);

  const isAlreadyFollowing = (user: User, currentUser: User) => user.followers.filter(f => f.username === currentUser.username).length > 0;
  const hasProposal = (user: User, currentUser: User) => followProposals.find(p => p.payload.newFollower.username === currentUser.username && p.payload.followee === user.username) ? true : false;
  const isDisabled = (user: User): boolean => {
    let isDisabled = false;
    if (currentUser) {
      if (isAlreadyFollowing(user, currentUser) || hasProposal(user, currentUser))
        isDisabled = true;
    }
    return isDisabled;
  };

  const FollowButton = (user: User): React.ReactElement => {
    const [isLoading, setIsLoading] = useState(false);
    return (
      <Button
        basic
        circular
        color='blue'
        loading={isLoading}
        onClick={() => addFollower(user.username, setIsLoading)}
        disabled={isDisabled(user)}>
        <Icon link name='add user'/>
        &nbsp;Follow
      </Button>
    )
  };

  return (
    <Segment basic loading={allUsersStream.loading}>
      <Card.Group>
        {[...allUsers]
          .map(user =>
            <Card raised fluid key={user.username}>
              <Image wrapped src={user.avatarUrl}/>
              <Card.Content>
                <Card.Header>{user.displayName}</Card.Header>
                <Card.Meta>{user.followers.length} Following</Card.Meta>
                <Card.Description>{user.description}</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <FollowButton {...user} />
              </Card.Content>
            </Card>
          )
        }
      </Card.Group>
    </Segment>
  );

};

export default PublicUserList;