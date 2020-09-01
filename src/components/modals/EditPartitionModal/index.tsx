import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { Button } from '../../buttons/Button'
import { ButtonAdd } from '../../buttons/ButtonAdd'
import { ButtonControl, ButtonControlType } from '../../buttons/ButtonControl'
import { Modal, ModalProps } from '../../common/Modal'
import {
  AddableOutcome,
  Outcome,
  PlaceholderOutcome,
  RemovableOutcome,
} from '../../partitions/Outcome'
import { ButtonContainer } from '../../pureStyledComponents/ButtonContainer'
import { CardSubtitle } from '../../pureStyledComponents/CardSubtitle'
import { CardText } from '../../pureStyledComponents/CardText'
import {
  StripedList,
  StripedListEmpty,
  StripedListItemLessPadding,
} from '../../pureStyledComponents/StripedList'
import { TitleControlButton } from '../../pureStyledComponents/TitleControl'
import { InfoCard } from '../../statusInfo/InfoCard'
import { InlineLoading } from '../../statusInfo/InlineLoading'
import { TitleValue } from '../../text/TitleValue'

const DraggableCollection = styled(StripedListItemLessPadding)`
  &.dragOver {
    background-color: rgba(0, 156, 180, 0.15);
  }
`

const DraggableCollectionInner = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  padding-right: 15px;
`

const DraggableOutcome = styled(Outcome)`
  cursor: pointer;

  .outcomeCircle {
    &:hover {
      background-color: ${(props) => props.theme.colors.error};
      border-color: ${(props) => props.theme.colors.error};
      color: #fff;
    }

    &.isDragging {
      background-color: #fff;
      border-color: ${(props) => props.theme.colors.darkerGray};
      cursor: move;
    }
  }
`

const EditableOutcomesWrapper = styled.div`
  display: grid;
  grid-column-gap: 12px;
  grid-template-columns: 1fr 36px;
  margin-bottom: 24px;
`

const EditableOutcomes = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
`

interface OutcomeProps {
  id: string
  value: number
}

interface DraggedOutcomeProps extends OutcomeProps {
  collectionFromIndex: number
  outcomeIndex: number
}

export const EditPartitionModal: React.FC<ModalProps> = (props) => {
  const { onRequestClose, ...restProps } = props
  const dragOverClass = 'dragOver'
  const draggingClass = 'isDragging'
  const placeholderOutcomeId = 'placeholderOutcome'

  // const isLoading = !conditionIdToSearch && loading
  // const isSearching = conditionIdToSearch && loading
  const mockedNumberedOutcomes = [
    [
      { value: 1, id: '0x1234567' },
      { value: 4, id: '0x2345678' },
      { value: 3, id: '0x3456789' },
    ],
    [
      { value: 2, id: '0x4567890' },
      { value: 5, id: '0x5678901' },
    ],
    [
      { value: 10, id: '0x6789012' },
      { value: 11, id: '0x7890123' },
    ],
    [
      { value: 6, id: '0x8901234' },
      { value: 8, id: '0x9012345' },
      { value: 9, id: '0x0123456' },
    ],
    [{ value: 7, id: '0x6543210' }],
  ]
  const [allCollections, setAllCollections] = useState<any>(mockedNumberedOutcomes)
  const [newCollection, setNewCollection] = useState<any>([])
  const [availableOutcomes, setAvailableOutcomes] = useState<any>([])
  const [removeCollectionsQueue, setRemoveCollectionsQueue] = useState([])
  const [draggedOutcome, setDraggedOutcome] = useState<DraggedOutcomeProps | null>(null)

  const resetClassName = (e: any, className: string) =>
    e.currentTarget.className.replace(className, '')

  const removeOutcomeFromCollection = useCallback(
    (collectionIndex: number, outcomeIndex: number) => {
      setAvailableOutcomes([...availableOutcomes, allCollections[collectionIndex][outcomeIndex]])

      allCollections[collectionIndex].splice(outcomeIndex, 1)

      setAllCollections([
        ...allCollections.filter((item: any) => {
          return item.length > 0
        }),
      ])
    },
    [availableOutcomes, allCollections]
  )

  const onDragStart = useCallback(
    (e: any, collectionFromIndex: number, outcome: OutcomeProps, outcomeIndex: number) => {
      const placeholderOutcome = document.getElementById(placeholderOutcomeId)

      if (e.currentTarget.className.search(draggingClass) === -1) {
        e.currentTarget.className = `${e.currentTarget.className} ${draggingClass}`
      }

      setDraggedOutcome({
        collectionFromIndex: collectionFromIndex,
        id: outcome.id,
        outcomeIndex: outcomeIndex,
        value: outcome.value,
      })

      if (placeholderOutcome) {
        e.dataTransfer.setDragImage(document.getElementById(placeholderOutcomeId), 20, 20)
      }
    },
    []
  )

  const onDragEnd = useCallback((e: any) => {
    e.currentTarget.className = resetClassName(e, draggingClass)
  }, [])

  const onDragOver = useCallback(
    (e: any, collectionToIndex: number) => {
      e.preventDefault()

      if (draggedOutcome === null || collectionToIndex === draggedOutcome.collectionFromIndex)
        return

      if (e.currentTarget.className.search(dragOverClass) === -1) {
        e.currentTarget.className = `${e.currentTarget.className} ${dragOverClass}`
      }
    },
    [draggedOutcome]
  )

  const onDrop = useCallback(
    (e: any, collectionToIndex: number) => {
      e.currentTarget.className = resetClassName(e, dragOverClass)

      if (draggedOutcome === null || collectionToIndex === draggedOutcome.collectionFromIndex)
        return

      allCollections[draggedOutcome.collectionFromIndex].splice(draggedOutcome.outcomeIndex, 1)
      allCollections[collectionToIndex].push({ value: draggedOutcome.value, id: draggedOutcome.id })
      setAllCollections([...allCollections.filter((collection: any) => collection.length > 0)])
    },
    [allCollections, draggedOutcome]
  )

  const onDragLeave = useCallback((e: any) => {
    e.currentTarget.className = resetClassName(e, 'dragOver')
  }, [])

  const addOutcomeToNewCollection = useCallback(
    (outcomeIndex: number) => {
      setNewCollection([...newCollection, availableOutcomes[outcomeIndex]])
      availableOutcomes.splice(outcomeIndex, 1)
    },
    [newCollection, availableOutcomes]
  )

  const removeOutcomeFromNewCollection = useCallback(
    (outcomeIndex: number) => {
      setAvailableOutcomes([...availableOutcomes, newCollection[outcomeIndex]])
      newCollection.splice(outcomeIndex, 1)
    },
    [newCollection, availableOutcomes]
  )

  const addNewCollection = useCallback(() => {
    setAllCollections([[...newCollection], ...allCollections])
    newCollection.length = 0
  }, [newCollection, allCollections])

  const clearOutcomesFromNewCollection = useCallback(() => {
    setAvailableOutcomes([...availableOutcomes, ...newCollection])
    newCollection.length = 0
  }, [availableOutcomes, newCollection])

  const addAllAvailableOutcomesToNewCollection = useCallback(() => {
    setNewCollection([...newCollection, ...availableOutcomes])
    availableOutcomes.length = 0
  }, [availableOutcomes, newCollection])

  const notEnoughCollections = allCollections.length < 2

  return (
    <Modal onRequestClose={onRequestClose} title="Edit Partition" {...restProps}>
      <CardSubtitle>Add Outcomes To New Collection</CardSubtitle>
      {availableOutcomes.length ? (
        <>
          <CardText>Click on an outcome to add it to the collection.</CardText>
          <EditableOutcomesWrapper>
            <EditableOutcomes>
              {availableOutcomes.map((outcome: unknown | any, outcomeIndex: number) => {
                return (
                  <AddableOutcome
                    key={outcomeIndex}
                    onClick={() => {
                      addOutcomeToNewCollection(outcomeIndex)
                    }}
                    outcome={outcome}
                  />
                )
              })}
            </EditableOutcomes>
            <div />
          </EditableOutcomesWrapper>
        </>
      ) : (
        <CardText>
          No outcomes available. You can make them available by removing them from collections
          below.
        </CardText>
      )}
      <CardSubtitle>New Collection</CardSubtitle>
      <EditableOutcomesWrapper>
        <EditableOutcomes>
          {newCollection.map((outcome: unknown | any, outcomeIndex: number) => {
            return (
              <RemovableOutcome
                key={outcomeIndex}
                onClick={() => {
                  removeOutcomeFromNewCollection(outcomeIndex)
                }}
                outcome={outcome}
              />
            )
          })}
        </EditableOutcomes>
        <ButtonAdd
          disabled={newCollection.length === 0}
          onClick={() => {
            addNewCollection()
          }}
        />
      </EditableOutcomesWrapper>
      <TitleValue
        title="Collections"
        titleControl={
          <TitleControlButton
            onClick={() => {
              console.error('Delete all')
            }}
          >
            Edit Partition
          </TitleControlButton>
        }
        value={
          <>
            <CardText>
              Click on an outcome to remove it from a collection. You can also drag outcomes across
              collections.
            </CardText>
            <StripedList>
              {allCollections.length > 0 ? (
                allCollections.map((outcomeList: unknown | any, collectionIndex: number) => {
                  return (
                    <DraggableCollection
                      key={collectionIndex}
                      onDragLeave={onDragLeave}
                      onDragOver={(e) => onDragOver(e, collectionIndex)}
                      onDrop={(e) => onDrop(e, collectionIndex)}
                    >
                      <DraggableCollectionInner>
                        {outcomeList.map((outcome: OutcomeProps, outcomeIndex: number) => (
                          <DraggableOutcome
                            key={outcomeIndex}
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
                      </DraggableCollectionInner>
                      <ButtonControl buttonType={ButtonControlType.delete} />
                    </DraggableCollection>
                  )
                })
              ) : (
                <StripedListEmpty>No collections.</StripedListEmpty>
              )}
            </StripedList>
          </>
        }
      />
      <ButtonContainer>
        <Button disabled={notEnoughCollections} onClick={onRequestClose}>
          Save
        </Button>
      </ButtonContainer>
      <PlaceholderOutcome
        id={placeholderOutcomeId}
        outcome={(draggedOutcome && draggedOutcome.value.toString()) || ''}
      />
    </Modal>
  )
}
