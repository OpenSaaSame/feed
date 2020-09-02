import React from 'react';
import {Button, Comment, Form, Label, Modal} from "semantic-ui-react";
import {v4 as uuid} from "uuid";
import moment from "moment";
import {generatePost} from "../../utils/LedgerUtils";
import {Post} from "@daml-js/openwork-feeds-0.0.1/lib/Post";
import {useLedger, useParty} from "@daml/react";
import {User} from "@daml-js/openwork-feeds-0.0.1/lib/Post/module";

export enum TriggerType {
  NewPost,
  PostReply,
  CommentReply
}

type Props = {
  isReply: boolean;
  replyPost?: Post;
  triggerType: TriggerType;
}

/**
 * Modal for interacting with posts. Users can create a new post or post replies to existing posts
 *
 * @param isReply       Indicator if this is in reply to an existing post
 * @param replyPost     Post the user is replying to
 * @param triggerType   Trigger to open this Modal
 */
const PostModal: React.FC<Props> = ({isReply, replyPost, triggerType}) => {
  const username = useParty();
  const ledger = useLedger();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [postBody, setPostBody] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // TODO: Refactor - there must be a better way of doing this ... (difficult to push into higher components due to sharing of components, shared state, etc.)
  const getTrigger = (): React.ReactNode => {
    switch (triggerType) {
      case TriggerType.NewPost:
        return <Button primary floated='right' onClick={() => setModalOpen(true)}>Post</Button>;
      case TriggerType.PostReply:
        return <Label color='blue' as='a' corner='right' onClick={() => setModalOpen(true)} icon='reply'/>;
      case TriggerType.CommentReply:
        return <div onClick={() => setModalOpen(true)}>Reply</div>;
    }
  };

  const displayReplyPost = (): React.ReactNode =>
    <Comment.Group threaded>
      <Comment>
        <Comment.Avatar src={replyPost?.author.avatarUrl}/>
        <Comment.Content>
          <Comment.Author>
            {replyPost?.author.displayName}
            <Comment.Metadata style={{fontWeight: 'normal'}}>
              {moment().utc().to(replyPost?.createdAt)}
            </Comment.Metadata>
          </Comment.Author>
          <Comment.Text style={{whiteSpace: "pre-line"}}>
            {replyPost?.body}
          </Comment.Text>
        </Comment.Content>
      </Comment>
    </Comment.Group>;

  const getPlaceHolder = (): string => {
    if (isReply && replyPost)
      return "Reply to " + replyPost.author.displayName;
    else
      return "What's happening?"
  };

  const getParentPost = () => {
    if (isReply && replyPost)
      return {_1: replyPost.author.username, _2: replyPost.id};
    else
      return null;
  };

  const createPost = async (event?: React.FormEvent) => {
    setIsSubmitting(true);
    const newPost = generatePost(uuid(), postBody, false, getParentPost());

    try {
      await ledger.exerciseByKey(User.Post_CREATE, username, newPost);
    } catch (error) {
      alert(`Unknown error:\n${JSON.stringify(error)}`);
    } finally {
      setModalOpen(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      closeIcon
      trigger={getTrigger()}
      size='small'
      centered={false}
      dimmer='blurring'
      open={modalOpen}
      onClose={() => setModalOpen(false)}>
      <Modal.Content>
        {isReply && displayReplyPost()}
        <Form
          size='large'
          onSubmit={createPost}
          loading={isSubmitting}>
          <Form.TextArea
            autoFocus
            placeholder={getPlaceHolder()}
            onChange={(event) => setPostBody(event.currentTarget.value)}
            rows={5}/>
          <Button.Group>
            <Button
              primary
              positive
              content='Create Post'
              labelPosition='left'
              icon='edit'
              type='submit'
              disabled={postBody.length === 0}/>
            <Button.Or/>
            <Button
              negative
              content='Cancel'
              onClick={() => setModalOpen(false)}/>
          </Button.Group>
        </Form>
      </Modal.Content>
    </Modal>
  );

};

export default PostModal;