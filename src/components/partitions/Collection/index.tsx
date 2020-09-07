import React, { useState } from 'react'
import styled from 'styled-components'

import { ButtonControl, ButtonControlType } from 'components/buttons/ButtonControl'
import { ConfirmOverlayHorizontal } from 'components/common/ConfirmOverlay'
import { DraggableOutcome } from 'components/partitions/Outcome'
import { OutcomesContainer } from 'components/pureStyledComponents/OutcomesContainer'
import { StripedListItemLessPadding } from 'components/pureStyledComponents/StripedList'
import { OutcomeProps } from 'util/types'

const Wrapper = styled(StripedListItemLessPadding)<{
  isAboutToDelete?: boolean
  isDraggingOver?: boolean
}>`
  flex-wrap: nowrap;
  position: relative;

  &:nth-child(even),
  &:nth-child(odd) {
    ${(props) => props.isDraggingOver && 'background-color: rgba(0, 156, 180, 0.15);'}
  }

  &:nth-child(even),
  &:nth-child(odd) {
    ${(props) => props.isAboutToDelete && 'background-color: rgba(219, 58, 61, 0.05);'}
  }
`

Wrapper.defaultProps = {
  isAboutToDelete: false,
  isDraggingOver: false,
}

const OutcomesInner = styled(OutcomesContainer)`
  flex-grow: 1;
  height: 100%;
  margin: 0 15px 0 0;
`

interface Props {
  collectionIndex: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDragEnd: (e: any) => void
  onDragStart: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    e: any,
    collectionFromIndex: number,
    outcome: OutcomeProps,
    outcomeIndex: number
  ) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDrop: (e: any, collectionIndex: number) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outcomesList: any
  outcomesByRow: string
  removeCollection: (collectionIndex: number) => void
  removeOutcomeFromCollection: (collectionIndex: number, outcomeIndex: number) => void
}

export const Collection: React.FC<Props> = (props) => {
  const {
    collectionIndex,
    onDragEnd,
    onDragStart,
    onDrop,
    outcomesByRow,
    outcomesList,
    removeCollection,
    removeOutcomeFromCollection,
    ...restProps
  } = props

  const [confirmDeleteCollection, setConfirmDeleteCollection] = useState(false)
  const [isDraggingOutcome, setIsDraggingOutcome] = useState(false)
  const [isAboutToDelete, setIsAboutToDelete] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  return (
    <Wrapper
      isAboutToDelete={isAboutToDelete}
      isDraggingOver={isDraggingOver}
      onDragLeave={() => setIsDraggingOver(false)}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDraggingOver(true)
      }}
      onDrop={(e) => {
        onDrop(e, collectionIndex)
        setIsDraggingOutcome(false)
        setIsDraggingOver(false)
      }}
      {...restProps}
    >
      <OutcomesInner columnGap="0" columns={outcomesByRow}>
        {outcomesList.map((outcome: OutcomeProps, outcomeIndex: number) => (
          <DraggableOutcome
            disableTooltip={isDraggingOutcome}
            key={outcomeIndex}
            lastInRow={outcomesByRow}
            makeDraggable
            onClick={() => {
              removeOutcomeFromCollection(collectionIndex, outcomeIndex)
            }}
            onDragEnd={(e) => {
              onDragEnd(e)
              setIsDraggingOutcome(false)
            }}
            onDragStart={(e) => {
              onDragStart(e, collectionIndex, outcome, outcomeIndex)
              setIsDraggingOutcome(true)
            }}
            outcome={outcome}
          />
        ))}
      </OutcomesInner>
      <ButtonControl
        buttonType={ButtonControlType.delete}
        onClick={() => setConfirmDeleteCollection(true)}
        onMouseEnter={() => setIsAboutToDelete(true)}
        onMouseLeave={() => setIsAboutToDelete(false)}
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
