import React from 'react'
import styled from 'styled-components'

import { Outcome } from '../Outcome'
import { ListItem } from '../pureStyledComponents/ListItem'
import { Wrapper } from '../pureStyledComponents/Wrapper'

const Title = styled.h3`
  color: ${(props) => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  text-align: left;
  margin: 0 0 6px;
`

interface Props {
  collections: Array<unknown>
}

export const Partition: React.FC<Props> = (props) => {
  const { collections, ...restProps } = props

  return (
    <>
      <Title>Collections</Title>
      <Wrapper {...restProps}>
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
    </>
  )
}
