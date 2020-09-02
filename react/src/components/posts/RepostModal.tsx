import React from "react";
import {Button, Header, Icon, Modal} from "semantic-ui-react";
import {useLedger, useParty} from "@daml/react";
import {generatePost} from "../../utils/LedgerUtils";
import {v4 as uuid} from "uuid";
import {Post} from "@daml-js/openwork-feeds-0.0.1/lib/Post";
import {User} from "@daml-js/openwork-feeds-0.0.1/lib/Post/module";

type Props = {
  post: Post
}

/**
 * UI Modal when the user attempts to re-post an existing post
 *
 * @param post Target post to repost
 */
const RepostModal: React.FC<Props> = ({post}) => {
  const username = useParty();
  const ledger = useLedger();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [isReposting, setIsReposting] = React.useState(false);

  // RePosting
  const onCreateRePost = async (post: Post) => {
    setModalOpen(false);
    setIsReposting(true);
    const newPost = generatePost(uuid(), post.body, true, null);

    try {
      await ledger.exerciseByKey(User.Post_CREATE, username, newPost);
    } catch (error) {
      alert(`Unknown error:\n${JSON.stringify(error)}`);
    } finally {
      setIsReposting(false);
    }
  };

  return (
    <Modal
      basic
      closeIcon
      size='small'
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      trigger={<Icon
        link
        loading={isReposting}
        color='blue'
        name='retweet'
        disabled={post.author.username === username}
        onClick={() => setModalOpen(true)}
      />}>
      <Header icon='retweet' size='large' content={`Re-post ${post.author.displayName}'s post?`}/>
      <Modal.Content>
        {post.body}
      </Modal.Content>
      <Modal.Actions>
        <Button inverted color='green' onClick={() => onCreateRePost(post)}>
          <Icon name='checkmark'/> Yes
        </Button>
        <Button basic inverted color='red' onClick={() => setModalOpen(false)}>
          <Icon name='remove'/> No
        </Button>
      </Modal.Actions>

    </Modal>
  );
}

export default RepostModal;