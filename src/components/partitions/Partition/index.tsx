import React from 'react'

import { Outcome } from '../Outcome'
import { ListItem } from '../pureStyledComponents/ListItem'
import { Wrapper } from '../pureStyledComponents/Wrapper'

interface Props {
  collections: Array<unknown>
}

export const Partition: React.FC<Props> = (props) => {
  const { collections } = props

  return (
    <Wrapper>
      {collections.map((outcomeList: unknown | any, outcomeListIndex: number) => {
        return (
          <ListItem key={outcomeListIndex}>
            {outcomeList.map((outcome: string, outcomeIndex: number) => (
              <Outcome key={outcomeIndex} outcome={outcome} />
            ))}
          </ListItem>
        )
      })}
    </Wrapper>
  )
}
