import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { OutcomeProps } from '../../../util/types'
import { Button } from '../../buttons/Button'
import { ButtonAdd } from '../../buttons/ButtonAdd'
import { ButtonControl, ButtonControlType } from '../../buttons/ButtonControl'
import { Modal, ModalProps } from '../../common/Modal'
import {
  AddableOutcome,
  DraggableOutcome,
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

interface DraggedOutcomeProps extends OutcomeProps {
  collectionFromIndex: number
  outcomeIndex: number
}

interface EditPartitionModalProps extends ModalProps {
  outcomes: Array<any>
}

export const EditPartitionModal: React.FC<EditPartitionModalProps> = (props) => {
  const { onRequestClose, outcomes, ...restProps } = props
  const dragOverClass = 'dragOver'
  const draggingClass = 'isDragging'
  const placeholderOutcomeId = 'placeholderOutcome'

  const [allCollections, setAllCollections] = useState<any>(outcomes)
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
    e.currentTarget.className = resetClassName(e, dragOverClass)
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
  const orphanedOutcomes = availableOutcomes.length > 0 || newCollection.length > 0
  const disableButton = notEnoughCollections || orphanedOutcomes

  return (
    <Modal onRequestClose={onRequestClose} title="Edit Partition" {...restProps}>
      <TitleValue
        title="New Collection"
        value={
          <>
            <CardSubtitle>Available Outcomes</CardSubtitle>
            {availableOutcomes.length ? (
              <>
                <CardText>Click on an outcome to add it to the new collection.</CardText>
                <EditableOutcomesWrapper>
                  <EditableOutcomes>
                    {availableOutcomes.map((outcome: OutcomeProps, outcomeIndex: number) => {
                      return (
                        <AddableOutcome
                          key={outcomeIndex}
                          onClick={() => {
                            addOutcomeToNewCollection(outcomeIndex)
                          }}
                          outcome={outcome.value}
                        />
                      )
                    })}
                  </EditableOutcomes>
                  <div />
                </EditableOutcomesWrapper>
              </>
            ) : (
              <CardText>Outcomes removed from collections will be placed here.</CardText>
            )}
            <CardSubtitle>New Collection</CardSubtitle>
            <EditableOutcomesWrapper>
              <EditableOutcomes>
                {newCollection.map((outcome: OutcomeProps, outcomeIndex: number) => {
                  return (
                    <RemovableOutcome
                      key={outcomeIndex}
                      onClick={() => {
                        removeOutcomeFromNewCollection(outcomeIndex)
                      }}
                      outcome={outcome.value}
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
          </>
        }
      />

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
              You can drag outcomes across collections. Click on an outcome to remove it.
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
        <Button disabled={disableButton} onClick={onRequestClose}>
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
