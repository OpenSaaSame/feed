import React, {useMemo} from 'react';
import {Button, Card, Image, Segment} from 'semantic-ui-react';
import {ContractId} from "@daml/types";
import {QueryResult, useLedger, useParty} from "@daml/react";
import AvatarModal from "../common/AvatarModal";
import {
  UserFollowerProposal,
  UserFollowerProposal_ACCEPT,
  UserFollowerProposal_REJECT
} from "@daml-js/openwork-feeds-0.0.1/lib/Post";

type Props = {
  followProposals: QueryResult<UserFollowerProposal, any, any>
}

/**
 * Displays the list of requests for following the currently logged in user
 *
 * @param followProposals Stream of follow proposals
 */
const ProposalList: React.FC<Props> = ({followProposals}) => {
  const username = useParty();
  const ledger = useLedger();

  // Sorted list of follow proposals for the current user
  const myProposals = useMemo(() =>
      followProposals
        .contracts
        .filter(p => p.payload.followee === username)
        .sort((x, y) => x.payload.newFollower.displayName.localeCompare(y.payload.newFollower.displayName))
    , [followProposals, username]);

  const onExerciseProposal = async (proposalCid: ContractId<UserFollowerProposal>, choice: UserFollowerProposal_ACCEPT | UserFollowerProposal_REJECT): Promise<boolean> => {
    try {
      switch (choice) {
        case UserFollowerProposal_ACCEPT: {
          await ledger.exercise(UserFollowerProposal.UserFollowerProposal_ACCEPT, proposalCid, UserFollowerProposal_ACCEPT);
          break;
        }
        case UserFollowerProposal_REJECT: {
          await ledger.exercise(UserFollowerProposal.UserFollowerProposal_REJECT, proposalCid, UserFollowerProposal_REJECT);
          break;
        }
      }
      return true;
    } catch (error) {
      alert("Unknown error:\n" + JSON.stringify(error));
      return false;
    }
  };

  return (
    <Segment basic loading={followProposals.loading}>
      <Card.Group>
        {[...myProposals]
          .map(proposal =>
            <Card raised fluid>
              <Card.Content>
                <AvatarModal
                  {...proposal.payload.newFollower}
                  trigger={
                    <Image
                      floated='right'
                      size='mini'
                      src={proposal.payload.newFollower.avatarUrl}
                      style={{cursor: "pointer"}}/>
                  }/>
                <Card.Header>{proposal.payload.newFollower.displayName}</Card.Header>
                <Card.Meta>{proposal.payload.newFollower.email}</Card.Meta>
                <Card.Description>{proposal.payload.newFollower.description}</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Button
                  basic
                  circular
                  content=' Approve'
                  color='blue'
                  icon='user plus'
                  onClick={() => onExerciseProposal(proposal.contractId, UserFollowerProposal_ACCEPT)}/>
                <Button
                  basic
                  floated='right'
                  circular
                  content=' Reject'
                  color='blue'
                  icon='user times'
                  onClick={() => onExerciseProposal(proposal.contractId, UserFollowerProposal_REJECT)}/>
              </Card.Content>
            </Card>
          )
        }
      </Card.Group>
    </Segment>
  )
};

export default ProposalList;