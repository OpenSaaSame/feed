import React, {createRef, useEffect, useMemo, useState} from 'react';
import {Container, Grid, Label, Menu, Ref, Sticky} from 'semantic-ui-react';
import {Party} from '@daml/types';
import {useLedger, useParty, useStreamQuery} from '@daml/react';
import {Link, Route, Switch, useLocation} from 'react-router-dom';
import RequestsView from "./proposals/RequestsView";
import ProfileView from "./profile/ProfileView";
import UserDirectoryView from "./userDirectory/UserDirectoryView";
import UserFeedView from "./posts/UserFeedView";
import CommentView from "./posts/CommentView";
import {useFetchPublicCredentials} from "../utils/Hooks";
import {ledgerId} from "../config";
import {Post, User, UserFollowerProposal} from "@daml-js/openwork-feeds-0.0.1/lib/Post/module";

/**
 * The Main Application containing the menu and the sub-components
 */
const MainView: React.FC = () => {
  const username = useParty();
  const ledger = useLedger();
  const contextRef = createRef();
  const location = useLocation();

  // Menu Bar initialisation - required when hitting a direct url link to set the corresponding menu bar
  const [activeMenuBar, setActiveMenuBar] = useState(() => {
      switch (location.pathname) {
        case '/requests' :
          return 'My Requests';
        case '/directory' :
          return 'User Directory';
        default:
          return 'Home';
      }
    }
  );

  // Get all visible posts from the ledger
  const allPostsStream = useStreamQuery(Post);
  const allPosts = useMemo(() =>
      allPostsStream.contracts
        .map(p => p.payload)
        .sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()),
    [allPostsStream]
  );

  // Streams all the user contracts
  const allUsers = useStreamQuery(User);
  const currentUser: User = useMemo(() =>
    allUsers
      .contracts
      .map(c => c.payload)
      .filter(u => u.username === username)[0]
  , [allUsers, username]);

  // Stream of all proposals
  const allProposalsStream = useStreamQuery(UserFollowerProposal);
  const myProposalsCount = useMemo(() =>
      allProposalsStream
        .contracts
        .filter(p => p.payload.followee === username)
        .length
    , [allProposalsStream, username]);

  // Acquire the public credentials
  const publicCredentials = useFetchPublicCredentials(ledgerId);

  // Creates a user follower proposal
  const addFollower = async (followee: Party, isLoading: (loading: boolean) => void): Promise<boolean> => {
    try {
      isLoading(true);
      const users = {newFollower: currentUser, followee};

      await ledger
        .create(UserFollowerProposal, users)
        .finally(() => isLoading(false));
      return true;
    } catch (error) {
      alert(`Unknown error:\n${JSON.stringify(error)}`);
      return false;
    }
  };

  useEffect(() => {
    console.log('MainView.tsx mounted...')
    return () => console.log('MainView.tsx unmounted...')
  })

  return (
    <Container>
      <Grid columns={3}>
        <Grid.Row stretched>
          <Grid.Column width={4}>
            <Ref innerRef={contextRef}>
              <Sticky context={contextRef}>
                <Menu fluid vertical tabular>
                  <Link to='/'>
                    <Menu.Item
                      as='div'
                      name='Home'
                      active={activeMenuBar === 'Home'}
                      onClick={(_, data) => setActiveMenuBar(data.name!)}/>
                  </Link>
                  <Link to={`/user/${username}`}>
                    <Menu.Item
                      as='div'
                      name='My Profile'
                      active={activeMenuBar === 'My Profile'}
                      onClick={(_, data) => setActiveMenuBar(data.name!)}>
                    </Menu.Item>
                  </Link>
                  <Link to='/requests'>
                    <Menu.Item
                      as='div'
                      name='My Requests'
                      active={activeMenuBar === 'My Requests'}
                      onClick={(_, data) => setActiveMenuBar(data.name!)}>
                      <Label>{myProposalsCount}</Label>
                      My Requests
                    </Menu.Item>
                  </Link>
                  <Link to='/directory'>
                    <Menu.Item
                      as='div'
                      name='User Directory'
                      active={activeMenuBar === 'User Directory'}
                      onClick={(_, data) => setActiveMenuBar(data.name!)}/>
                  </Link>
                </Menu>
              </Sticky>
            </Ref>
          </Grid.Column>
          <Grid.Column width={8}>
            <Switch>
              <Route exact path='/'>
                <UserFeedView allPosts={allPosts} isLoading={allPostsStream.loading}/>
              </Route>
              <Route path='/requests'>
                <RequestsView followProposals={allProposalsStream}/>
              </Route>
              <Route path='/directory'>
                <UserDirectoryView
                  publicCredentials={publicCredentials}
                  currentUser={currentUser}
                  addFollower={addFollower}
                  followProposals={allProposalsStream.contracts}/>
              </Route>
              <Route path='/user/:authorUsername/post/:postId'>
                <CommentView allPosts={allPosts} isLoading={allPostsStream.loading}/>
              </Route>
              <Route path='/user/:profileUsername'>
                <ProfileView
                  allUsers={allUsers}
                  publicUser={publicCredentials.party}
                  allPosts={allPosts}
                  onAddParty={addFollower}
                  onProfileMatches={() => setActiveMenuBar('My Profile')}
                  onProfileMisMatch={() => setActiveMenuBar('')}/>
              </Route>
            </Switch>
          </Grid.Column>
          <Grid.Column width={4}/>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default MainView;