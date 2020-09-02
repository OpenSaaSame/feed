import React from "react";
import {Placeholder, Segment} from "semantic-ui-react";

type Props = {
  repeating?: number
}

/**
 * Displays a Loading Segment while data is waiting to load from the ledger
 *
 * @param repeating Number of times to repeat the loading segment
 */
const LoadingSegment: React.FC<Props> = ({repeating= 1}) => {

  return (
    <>
      {
        [...Array(repeating)].map((_, index) =>
          <Segment raised key={index}>
            <Placeholder>
              <Placeholder.Header image>
                <Placeholder.Line/>
                <Placeholder.Line/>
              </Placeholder.Header>
              <Placeholder.Paragraph>
                <Placeholder.Line length='full'/>
                <Placeholder.Line length='medium'/>
                <Placeholder.Line length='short'/>
              </Placeholder.Paragraph>
            </Placeholder>
          </Segment>
        )
      }
    </>
  )
}

export default LoadingSegment;