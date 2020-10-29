import React, { useState } from 'react'
import styled from 'styled-components'

import { Checkbox } from 'components/pureStyledComponents/Checkbox'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { SpinnerSize } from 'components/statusInfo/common'
import { TitleValue } from 'components/text/TitleValue'

const Wrapper = styled.div``

const MergeableStripedListItem = styled(StripedListItem)`
  cursor: pointer;
  justify-content: flex-start;
  padding-left: 15px;
  padding-right: 15px;

  &:hover {
    background-color: ${(props) => props.theme.colors.whitesmoke2};
    filter: brightness(94%);
  }
`

const MergeableStripedListItemText = styled.span`
  margin-left: 8px;
`

const MergeableItem: React.FC<{
  onClick: (item: any, index: number) => void
  item: any
  index: number
}> = (props) => {
  const { index, item, onClick, ...restProps } = props
  const [selected, setSelected] = useState(false)

  const itemOnClick = () => {
    setSelected(!selected)
    onClick(item, index)
  }

  return (
    <MergeableStripedListItem onClick={itemOnClick} {...restProps}>
      <Checkbox checked={selected} />
      <MergeableStripedListItemText>{item.position}</MergeableStripedListItemText>
    </MergeableStripedListItem>
  )
}

interface Props {
  isLoading?: boolean
  mergeablePositions: Array<any>
  onClick: (item: any, index: number) => void
}

export const MergeWith: React.FC<Props> = (props) => {
  const { isLoading, mergeablePositions, onClick, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <TitleValue
        title="Merge With"
        value={
          <StripedList minHeight="158px">
            {mergeablePositions.length ? (
              mergeablePositions.map((item, index) => (
                <MergeableItem index={index} item={item} key={index} onClick={onClick} />
              ))
            ) : (
              <StripedListEmpty>
                {isLoading ? <InlineLoading size={SpinnerSize.small} /> : 'No mergeable positions.'}
              </StripedListEmpty>
            )}
          </StripedList>
        }
      />
    </Wrapper>
  )
}
