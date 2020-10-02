import React from 'react'
import {List} from 'semantic-ui-react';
import {Follower} from "@daml-js/openwork-feed-0.0.1/lib/Post";

type Props = {
  followers: Follower[];
}

/**
 * Displays a list of followers of a user by their display name
 *
 * @param followers   List of followers of an individual user
 */
const UserFollowerList: React.FC<Props> = ({followers}) => {

  return (
    <List relaxed>
      {[...followers]
        .sort((x, y) => x.displayName.localeCompare(y.displayName))
        .map((party) =>
          <List.Item key={party.username}>
            <List.Icon color='blue' name='user outline'/>
            <List.Content>
              <List.Header>{party.displayName}</List.Header>
            </List.Content>
          </List.Item>
        )}
    </List>
  );
};

export default UserFollowerList;
