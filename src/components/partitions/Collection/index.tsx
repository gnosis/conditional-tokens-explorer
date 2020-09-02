import React, { useState } from 'react'
import styled from 'styled-components'

import { OutcomeProps } from '../../../util/types'
import { ButtonControl, ButtonControlType } from '../../buttons/ButtonControl'
import { ConfirmOverlayHorizontal } from '../../common/ConfirmOverlay'
import { OutcomesContainer } from '../../pureStyledComponents/OutcomesContainer'
import { StripedListItemLessPadding } from '../../pureStyledComponents/StripedList'
import { DraggableOutcome } from '../Outcome'

const Wrapper = styled(StripedListItemLessPadding)`
  flex-wrap: nowrap;
  position: relative;

  &.dragOver {
    background-color: rgba(0, 156, 180, 0.15);
  }
`

const OutcomesInner = styled(OutcomesContainer)`
  flex-grow: 1;
  height: 100%;
  margin: 0 15px 0 0;
`

interface Props {
  collectionIndex: number
  onDragEnd: (e: any) => void
  onDragLeave: (e: any) => void
  onDragOver: (e: any, collectionIndex: number) => void
  onDragStart: (
    e: any,
    collectionFromIndex: number,
    outcome: OutcomeProps,
    outcomeIndex: number
  ) => void
  onDrop: (e: any, collectionIndex: number) => void
  outcomesList: any
  outcomesByRow: string
  removeCollection: (collectionIndex: number) => void
  removeOutcomeFromCollection: (collectionIndex: number, outcomeIndex: number) => void
}

export const Collection: React.FC<Props> = (props) => {
  const {
    collectionIndex,
    onDragEnd,
    onDragLeave,
    onDragOver,
    onDragStart,
    onDrop,
    outcomesByRow,
    outcomesList,
    removeCollection,
    removeOutcomeFromCollection,
    ...restProps
  } = props

  const [confirmDeleteCollection, setConfirmDeleteCollection] = useState(false)

  return (
    <Wrapper
      onDragLeave={onDragLeave}
      onDragOver={(e) => onDragOver(e, collectionIndex)}
      onDrop={(e) => onDrop(e, collectionIndex)}
      {...restProps}
    >
      <OutcomesInner columnGap="0" columns={outcomesByRow}>
        {outcomesList.map((outcome: OutcomeProps, outcomeIndex: number) => (
          <DraggableOutcome
            key={outcomeIndex}
            lastInRow={outcomesByRow}
            makeDraggable
            onClick={() => {
              removeOutcomeFromCollection(collectionIndex, outcomeIndex)
            }}
            onDragEnd={onDragEnd}
            onDragStart={(e: any) => {
              onDragStart(e, collectionIndex, outcome, outcomeIndex)
            }}
            outcome={outcome.value}
          />
        ))}
      </OutcomesInner>
      <ButtonControl
        buttonType={ButtonControlType.delete}
        onClick={() => setConfirmDeleteCollection(true)}
      />
      {confirmDeleteCollection && (
        <ConfirmOverlayHorizontal
          confirm={() => {
            removeCollection(collectionIndex)
            setConfirmDeleteCollection(false)
          }}
          deny={() => {
            setConfirmDeleteCollection(false)
          }}
          text="Remove collection?"
        />
      )}
    </Wrapper>
  )
}
