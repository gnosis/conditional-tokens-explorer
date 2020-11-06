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
import { MergeablePosition } from 'util/types'

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
  index: number
  item: MergeablePosition
  onClick: (item: MergeablePosition, index: number) => void
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
      <MergeableStripedListItemText>{item.positionPreview}</MergeableStripedListItemText>
    </MergeableStripedListItem>
  )
}

interface Props {
  isLoading?: boolean
  mergeablePositions: Array<MergeablePosition> | undefined
  onClick: (item: MergeablePosition, index: number) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errorFetching: any
}

export const MergeWith: React.FC<Props> = (props) => {
  const { errorFetching, isLoading, mergeablePositions, onClick, ...restProps } = props

  console.log(mergeablePositions)
  return (
    <Wrapper {...restProps}>
      <TitleValue
        title="Merge With"
        value={
          <StripedList minHeight="158px">
            {mergeablePositions && mergeablePositions.length && !errorFetching ? (
              mergeablePositions.map((item, index) => (
                <MergeableItem index={index} item={item} key={index} onClick={onClick} />
              ))
            ) : (
              <StripedListEmpty>
                {isLoading && !errorFetching && <InlineLoading size={SpinnerSize.small} />}
                {!isLoading &&
                  errorFetching &&
                  'There was an error fetching the positions. Try again.'}
                {!isLoading && !errorFetching && 'No mergeable positions.'}
              </StripedListEmpty>
            )}
          </StripedList>
        }
      />
    </Wrapper>
  )
}
