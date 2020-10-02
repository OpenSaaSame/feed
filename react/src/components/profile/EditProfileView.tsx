import React, {useEffect, useState} from "react";
import {Form, Label, Segment} from "semantic-ui-react";
import {useLedger, useParty} from "@daml/react";
import {validate} from "email-validator"
import {defaultPublicLedgerParty, deploymentMode, DeploymentMode, ledgerId} from "../../config";
import {fetchDablPublicParty} from "../../utils/Hooks";
import {User} from "@daml-js/openwork-feed-0.0.1/lib/Post";

type Props = {
  existingUser?: User;
  afterLedgerSubmit: (user: User) => void;
}

/**
 * UI for either creating or modifying an existing user
 *
 * @param existingUser      Existing user
 * @param afterLedgerSubmit Function to execute after successfully creating/updating the user profile
 */
const EditProfileView: React.FC<Props> = ({existingUser, afterLedgerSubmit}) => {
  const username = useParty();
  const ledger = useLedger();
  const [isLoading, setIsLoading] = useState(false);

  const [displayName, setDisplayName] = useState(() => existingUser?.displayName || '');
  const [email, setEmail] = useState(() => existingUser?.email || '');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [description, setDescription] = useState(() => existingUser?.description || '');
  const [avatarUrl, setAvatarUrl] = useState(() => existingUser?.avatarUrl || `https://api.adorable.io/avatars/285/${username}`);
  const [publicLedgerParty, setPublicLedgerParty] = useState(() => defaultPublicLedgerParty);

  useEffect(() => {
    if (deploymentMode === DeploymentMode.PROD_DABL) {
      const fetchResult = async () => await fetchDablPublicParty(ledgerId)
        .then(response => setPublicLedgerParty(response.publicParty))
        .catch(error => alert("Unknown error:\n" + JSON.stringify(error.message)));

      fetchResult();
    }
  }, []);

  const generateUser = (username: string, displayName: string, description: string, email: string, avatarUrl: string): User => {
    return {
      username,
      displayName,
      description,
      email,
      followers: [],
      createdAt: new Date().toISOString(),
      avatarUrl,
      userDirectory: publicLedgerParty
    };
  };

  const isButtonDisabled = () => {
    if (!displayName || !email || !description)
      return true;
  };

  const handleUserSubmit = async (event: React.FormEvent, execute: (user: User) => Promise<any>) => {
    event.preventDefault();

    try {
      const validInput = validate(email);
      if (validInput === true) {
        setIsLoading(true);

        const user = generateUser(username, displayName, description, email, avatarUrl);
        await execute(user).finally(() => {
            afterLedgerSubmit(user)
            setIsLoading(false);
          });
      } else {
        setIsValidEmail(false);
      }
    } catch (error) {
      alert(`Unknown error:\n${JSON.stringify(error)}`);
    }
  };

  return (
    <Form size='large' loading={isLoading}>
      <Segment raised textAlign='left'>
        {deploymentMode === DeploymentMode.PROD_DABL &&
        <Label color='blue' ribbon='right'>DABL assigned Username</Label>}
        <Form.Input
          required
          label='Username'
          value={username}
          icon='user'
          iconPosition='left'
          disabled={true}
        />
        <Form.Input
          focus
          required
          label='Display Name'
          placeholder='Display Name'
          defaultValue={existingUser?.displayName}
          icon='user circle'
          iconPosition='left'
          onChange={e => setDisplayName(e.currentTarget.value)}
        />
        <Form.Input
          focus
          required
          label='Email Address'
          placeholder='Email'
          defaultValue={existingUser?.email}
          icon='at'
          iconPosition='left'
          error={!isValidEmail}
          onChange={e => setEmail(e.currentTarget.value)}
        />
        <Form.Input
          focus
          label='Avatar Url'
          placeholder='Leave bank for a random Avatar!!'
          defaultValue={existingUser?.avatarUrl}
          icon='picture'
          iconPosition='left'
          onChange={e => setAvatarUrl(e.currentTarget.value)}
        />
        <Form.TextArea
          required
          label='Bio'
          placeholder='Tell everyone something about yourself...'
          defaultValue={existingUser?.description}
          icon='eye'
          onChange={e => setDescription(e.currentTarget.value)}
        />
        {existingUser
          ?
          <Form.Button
            primary
            fluid
            content='Update Profile'
            onClick={(e) => handleUserSubmit(e, u => ledger.exerciseByKey(User.User_UPDATE, username, {newUser: u}))}
            disabled={isButtonDisabled()}/>
          :
          <Form.Button
            primary
            fluid
            content='Create Profile'
            onClick={(e) => handleUserSubmit(e, u => ledger.create(User, u))}
            disabled={isButtonDisabled()}/>
        }
      </Segment>
    </Form>
  );

};

export default EditProfileView;