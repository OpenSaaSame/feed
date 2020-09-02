import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {defaultPublicLedgerParty, DeploymentMode, deploymentMode} from "../config";
import Credentials, {computeCredentials} from "../Credentials";

type DablPublicTokenResponse = {
  access_token: string
}

type DablPublicPartyResponse = {
  publicParty: string
}

export const fetchDablPublicToken = (ledgerId: string): Promise<DablPublicTokenResponse> =>
  fetch(`https://api.projectdabl.com/api/ledger/${ledgerId}/public/token`, {
    method: 'POST',
    headers: {accept: 'application/json'}
  }).then(response => response.json());

export const fetchDablPublicParty = (ledgerId: string): Promise<DablPublicPartyResponse> =>
  fetch(`https://${ledgerId}.projectdabl.com/.well-known/dabl.json`, {
    method: 'GET',
    headers: {accept: 'application/json'},
  }).then(response => response.json());

/**
 * Fetches the Public token and party when on DABL via HTTP calls.
 * Else, computes the credentials based on the default configured ledger party
 *
 * @param ledgerId
 */
export const useFetchPublicCredentials = (ledgerId: string) => {
  const [result, setResult] = useState<Credentials>(() => computeCredentials(defaultPublicLedgerParty));

  useEffect(() => {
    const fetchAll = async () => await Promise.all<DablPublicTokenResponse, DablPublicPartyResponse>([
      fetchDablPublicToken(ledgerId),
      fetchDablPublicParty(ledgerId)
    ]).then(([tokenResponse, partyResponse]) => {
      setResult({party: partyResponse.publicParty, token: tokenResponse.access_token, ledgerId: ledgerId});
    }).catch(error => alert("Unknown error:\n" + JSON.stringify(error.message)));

    if (deploymentMode === DeploymentMode.PROD_DABL)
      fetchAll();
  }, [ledgerId]);

  return result;
};

/**
 * Stores key/values pairs as "Sticky" using localstorage
 *
 * @param key                   An identifier for looking up a value in localstorage/memory
 * @param validateInitialState  A function to validate the non-null value loaded from the localstorage.
 *                              Returns the input value if valid, otherwise returns null.
 */
export const useStickyState = <T>(key: string, validateInitialState?: (stickyValue: T) => T | null): [T | null, Dispatch<SetStateAction<T | null>>] => {
  const [value, setValue] = useState<T | null>(() => {
    const stickyValue = window.localStorage.getItem(key);

    return stickyValue
      ? validateInitialState
        ? validateInitialState(JSON.parse(stickyValue))
        : JSON.parse(stickyValue)
      : null;
  });

  useEffect(() => {
    value
      ? window.localStorage.setItem(key, JSON.stringify(value))
      : window.localStorage.removeItem(key);
  }, [key, value]);

  return [value, setValue];
};