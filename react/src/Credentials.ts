import {decode, encode, TAlgorithm} from 'jwt-simple';
import {ledgerId} from './config';

export const APPLICATION_ID: string = 'openwork-feeds';

export const SECRET_KEY: string = 'secret';

export type Credentials = {
  party: string;
  token: string;
  ledgerId: string;
}

function computeToken(party: string): string {
  const payload = {
    "https://daml.com/ledger-api": {
      "ledgerId": ledgerId,
      "applicationId": APPLICATION_ID,
      "actAs": [party]
    }
  };

  return encode(payload, SECRET_KEY, 'HS256');
}

export const computeCredentials = (party: string): Credentials => {
  const token = computeToken(party);
  return {party, token, ledgerId};
};

//TODO: Get the certificate from https://login.projectdabl.com/auth/jwks and verify certificate once enabled
export const decodeToken = (token: string, algorithm: TAlgorithm) => {
  return decode(token, SECRET_KEY, true, algorithm);
};


export default Credentials;

