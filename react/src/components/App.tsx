import React from 'react';
import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import DamlLedger from '@daml/react';
import Credentials, {decodeToken} from '../Credentials';
import {HashRouter, Route, Switch} from 'react-router-dom';
import {httpBaseUrl, wsBaseUrl} from "../config";
import {Dimmer, Loader} from "semantic-ui-react";
import {useStickyState} from "../utils/Hooks";
import moment from "moment";

type loadingProps = {
  isLoading: boolean;
}

/**
 * React component for the entry point into the application.
 *
 * @constructor
 */
const App: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [credentials, setCredentials] = useStickyState<Credentials>('credentials', stickyValue => {
    const token = decodeToken(stickyValue.token, 'RS256');
    // If the token has an expiration time set, validate this time hasn't already passed
    if (token.exp && moment.unix(token.exp).utc().unix() < moment().utc().unix()) {
      return null;
    }
    return stickyValue;
  });

  return (
    <div>
      <HashRouter>
        <Switch>
          <Route path='/'>
            {credentials
              ?
              <DamlLedger{...credentials} wsBaseUrl={wsBaseUrl} httpBaseUrl={httpBaseUrl}>
                <MainScreen onLogout={() => setCredentials(null)} onLoad={setIsLoading}/>
              </DamlLedger>
              :
              <LoginScreen onLogin={setCredentials} onLoad={setIsLoading}/>
            }
            <Dimmer active={isLoading} inverted>
              <Loader inverted/>
            </Dimmer>
          </Route>
        </Switch>
      </HashRouter>
    </div>
  );
};

export default App;
