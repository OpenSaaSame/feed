import React from "react";
import {Image, Modal} from "semantic-ui-react";

type Props = {
  avatarUrl: string
  trigger: React.ReactNode
}

/**
 * Displays a target Avatar inside a Modal
 *
 * @param avatarUrl Avatar to render
 * @param trigger   Component to render which initiates the modal
 */
const AvatarModal: React.FC<Props> = ({avatarUrl, trigger}) => {

  return (
    <Modal
      basic
      closeIcon
      dimmer='blurring'
      trigger={trigger}>
      <Modal.Content image>
        <Image centered src={avatarUrl}/>
      </Modal.Content>
    </Modal>);

};

export default AvatarModal;