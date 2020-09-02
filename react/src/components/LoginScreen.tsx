import React, {useCallback, useEffect} from 'react'
import {Button, Form, Grid, Header, Image, Segment} from 'semantic-ui-react'
import Credentials, {computeCredentials} from '../Credentials';
import {deploymentMode, DeploymentMode, ledgerId} from "../config";

type Props = {
  onLogin: (credentials: Credentials) => void;
  onLoad: (isLoading: boolean) => void;
}

/**
 * React component for the login screen of the `App`.
 */
const LoginScreen: React.FC<Props> = ({onLogin, onLoad}) => {
  const [username, setUsername] = React.useState('');

  const login = useCallback((credentials: Credentials) => {
    onLogin(credentials);
  }, [onLogin]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    onLoad(true);
    const credentials = computeCredentials(username);
    await login(credentials);
  };

  const handleDablLogin = () => {
    window.location.assign(`https://login.projectdabl.com/auth/login?ledgerId=${ledgerId}`);
    onLoad(true);
  };

  // Called when handleDablLogin() returns with the token and DABL ledger party
  useEffect(() => {
    const url = new URL(window.location.toString());
    const token = url.searchParams.get('token');
    if (token === null) {
      return;
    }
    const party = url.searchParams.get('party');
    if (party === null) {
      throw Error("When 'token' is passed via URL, 'party' must be passed too.");
    }
    url.search = '';
    window.history.replaceState(window.history.state, '', url.toString());
    login({token, party, ledgerId});
  }, [login]);

  return (
    <>
      <Grid textAlign='center' style={{height: '100vh'}} verticalAlign='middle'>
        <Grid.Column style={{maxWidth: 450}}>
          <Header as='h1' textAlign='center' size='huge' style={{color: '#223668'}}>
            <Header.Content>
              <Image
                as='a'
                href='https://www.daml.com/'
                target='_blank'
                src='/daml.svg'
                alt='DAML Logo'
                spaced
                size='small'
                verticalAlign='middle'
              />
              <p>
                OpenWork Feeds
              </p>
            </Header.Content>
          </Header>
          <Form size='large'>
            <Segment>
              {
                deploymentMode !== DeploymentMode.PROD_DABL
                  ? <>
                    <Form.Input
                      required
                      fluid
                      icon='user'
                      iconPosition='left'
                      placeholder='Username'
                      value={username}
                      onChange={e => setUsername(e.currentTarget.value)}
                    />
                    <Button
                      primary
                      fluid
                      onClick={handleLogin}>
                      Log in
                    </Button>
                  </>
                  : <Button primary fluid onClick={handleDablLogin}>
                    Log in with DABL
                  </Button>
              }
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    </>
  );
};

export default LoginScreen;
