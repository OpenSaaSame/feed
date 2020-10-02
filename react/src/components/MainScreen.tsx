import React, {useEffect, useState} from 'react'
import {Grid, Header, Image, Menu} from 'semantic-ui-react'
import MainView from './MainView';
import {useLedger, useParty} from '@daml/react';
import EditProfileView from "./profile/EditProfileView";
import {User} from "@daml-js/openwork-feed-0.0.1/lib/Post/module";

type Props = {
  onLogout: () => void;
  onLoad: (isLoading: boolean) => void;
}

/**
 * React component for the main screen of the `App`.
 *
 * @param onLogout  Function to execute when the user presses the 'Log Out' button
 * @param onLoad    Function to execute after attempting to load the logged in user contract
 */
const MainScreen: React.FC<Props> = ({onLogout, onLoad}) => {
  const username = useParty();
  const ledger = useLedger();
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    const fetchUser = async () => {
      const result = await ledger.fetchByKey(User, username).finally(() => onLoad(false));
      result ? setUser(result.payload) : setUser(null);
    };

    fetchUser();
  }, [ledger, username, onLoad]);

  return (
    <>
      {user &&
      <>
        <Menu icon borderless>
          <Menu.Item>
            <Image
              as='a'
              href='https://www.daml.com/'
              target='_blank'
              src='/daml.svg'
              alt='DAML Logo'
              size='mini'/>
          </Menu.Item>
          <Menu.Menu position='right'>
            <Menu.Item position='right'>
              Welcome {user.displayName}
            </Menu.Item>
            <Menu.Item
              position='right'
              active={false}
              onClick={onLogout} icon='log out'/>
          </Menu.Menu>
        </Menu>
        <MainView/>
      </>
      }
      {user === null &&
      <Grid textAlign='center' style={{height: '100vh'}} verticalAlign='middle'>
        <Grid.Column style={{maxWidth: 500}}>
          <Header as='h1' textAlign='center' size='huge' style={{color: '#223668'}}>
            <Header.Content>Create your Profile</Header.Content>
          </Header>
          <EditProfileView afterLedgerSubmit={setUser}/>
        </Grid.Column>
      </Grid>
      }
    </>
  );

};

export default MainScreen;
