import React from "react";
import {Divider, Header, Icon, Segment} from "semantic-ui-react";
import ProposalList from "./ProposalList";
import {QueryResult} from "@daml/react";
import {UserFollowerProposal} from "@daml-js/openwork-feed-0.0.1/lib/Post";

type Props = {
  followProposals: QueryResult<UserFollowerProposal, any, any>
}

/**
 * UI component which displays the list of follow requests
 *
 * @param followProposals   Stream of Follow proposals
 */
const RequestsView: React.FC<Props> = ({followProposals}) => {

  return (
    <Segment>
      <Header as='h2'>
        <Icon color='blue' name='plus'/>
        <Header.Content>
          Follow Requests
          <Header.Subheader>Requests to follow me</Header.Subheader>
        </Header.Content>
      </Header>
      <Divider/>
      <ProposalList followProposals={followProposals}/>
    </Segment>
  );

};

export default RequestsView;