import React from "react";
import {Party} from "@daml/types";
import {Divider, Header, Icon, Segment} from "semantic-ui-react";
import Credentials from "../../Credentials";
import {httpBaseUrl, wsBaseUrl} from "../../config";
import DamlLedger from "@daml/react";
import PublicUserList from "./PublicUserList";
import {CreateEvent} from "@daml/ledger";
import {User, UserFollowerProposal} from "@daml-js/openwork-feeds-0.0.1/lib/Post";

type Props = {
  publicCredentials: Credentials;
  currentUser: User | undefined;
  addFollower: (party: Party, isLoading: (loading: boolean) => void) => Promise<boolean>;
  followProposals: readonly CreateEvent<UserFollowerProposal, any, any>[]
}

/**
 * A public directory of the users of the system. Requires public credentials to connect to the ledger which will
 * wrap a component so the DamlLedgerContext becomes the public context.
 * Any commands to be executed as the logged in user thus need to be defined outside of the public context
 *
 * @param publicCredentials Public user and token
 * @param currentUser       Current logged in user
 * @param addFollower       Command to execute when requesting to follow another user
 * @param allProposals      Stream of current proposals in the system
 */
const UserDirectoryView: React.FC<Props> = ({publicCredentials, currentUser, addFollower, followProposals}) => {

  return (
    <Segment>
      <Header as='h2'>
        <Icon color='blue' name='users'/>
        <Header.Content>
          Users
          <Header.Subheader>Global directory listing</Header.Subheader>
        </Header.Content>
      </Header>
      <Divider/>
      <DamlLedger {...publicCredentials}
                  httpBaseUrl={httpBaseUrl}
                  wsBaseUrl={wsBaseUrl}>
        <PublicUserList currentUser={currentUser} addFollower={addFollower} followProposals={followProposals}/>
      </DamlLedger>
    </Segment>
  )
};

export default UserDirectoryView;
