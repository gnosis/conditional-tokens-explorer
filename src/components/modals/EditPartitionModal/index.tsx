import React, { useCallback, useEffect, useState } from 'react'
import styled, { withTheme } from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonAdd } from 'components/buttons/ButtonAdd'
import {
  ButtonBulkMove,
  ButtonBulkMoveActions,
  ButtonBulkMoveDirection,
} from 'components/buttons/ButtonBulkMove'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { ConfirmOverlay } from 'components/common/ConfirmOverlay'
import { Modal, ModalProps } from 'components/common/Modal'
import { Collection } from 'components/partitions/Collection'
import { EditableOutcome, PlaceholderOutcome } from 'components/partitions/Outcome'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { CardSubtitle } from 'components/pureStyledComponents/CardSubtitle'
import { CardText } from 'components/pureStyledComponents/CardText'
import { OutcomesContainer } from 'components/pureStyledComponents/OutcomesContainer'
import { SmallNote } from 'components/pureStyledComponents/SmallNote'
import { StripedList, StripedListEmpty } from 'components/pureStyledComponents/StripedList'
import { TitleControlButton } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { OutcomeProps } from 'util/types'

const Collections = styled(StripedList)`
  position: relative;
`

const EditableOutcomesWrapper = styled.div`
  align-items: center;
  display: grid;
  grid-column-gap: 12px;
  grid-template-columns: 1fr 38px;
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`

const EditableOutcomes = styled.div<{
  borderBottomColor?: string
  fullBorderColor?: string
}>`
  align-items: center;
  background-color: #fff;
  border-bottom-color: ${(props) => props.borderBottomColor};
  border-left-color: transparent;
  border-right-color: transparent;
  border-style: solid;
  border-top-color: transparent;
  border-width: 2px;
  display: flex;
  flex-grow: 1;
  min-height: 45px;
  padding: 6px 8px;
  transition: all 0.15s ease-out;

  ${(props) => props.fullBorderColor && `border-radius: 8px;`}

  ${(props) => props.fullBorderColor && `border-color: ${props.fullBorderColor};`}
`

EditableOutcomes.defaultProps = {
  borderBottomColor: '#b2b5b2',
}

const OutcomesInner = styled(OutcomesContainer)`
  flex-grow: 1;
  height: 100%;
  margin: 0 15px 0 0;
`

const TitleValueExtraMargin = styled(TitleValue)`
  margin-bottom: 40px;
`

const CardTextPlaceholder = styled(CardText)`
  flex-grow: 1;
  margin: 0 15px 0 0;
  opacity: 0.7;
`

const ButtonBulk = styled(ButtonBulkMove)<{ flipVertical?: boolean }>`
  margin-top: auto;

  ${(props) =>
    props.flipVertical &&
    `
      border-color: ${props.theme.colors.primary};
      transform: rotateZ(180deg);

      path {
        fill: ${props.theme.colors.primary};
      }
  `}
`

const ButtonAddNewCollectionContainer = styled.div`
  align-items: flex-end;
  display: flex;
  height: 100%;
  padding-bottom: 4px;
`

const ButtonReset = styled(Button)`
  margin-right: auto;
`

interface DraggedOutcomeProps extends OutcomeProps {
  collectionFromIndex: number
  outcomeIndex: number
}

interface EditPartitionModalProps extends ModalProps {
  outcomes: Array<any>
  theme?: any
}

const PartitionModal: React.FC<EditPartitionModalProps> = (props) => {
  const { onRequestClose, outcomes, theme, ...restProps } = props
  const dragOverClass = 'dragOver'
  const draggingClass = 'isDragging'
  const placeholderOutcomeId = 'placeholderOutcome'
  const outcomesByRow = '13'

  const [allCollections, setAllCollections] = useState<any>([])
  const [newCollection, setNewCollection] = useState<any>([])
  const [availableOutcomes, setAvailableOutcomes] = useState<any>([])
  const [draggedOutcome, setDraggedOutcome] = useState<DraggedOutcomeProps | null>(null)
  const [availableOutcomesColor, setAvailableOutcomesColor] = useState<string | undefined>()
  const [newCollectionOutcomesColor, setNewCollectionOutcomesColor] = useState<string | undefined>()
  const [confirmDeleteAllCollections, setConfirmDeleteAllCollections] = useState(false)

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

  const addAllAvailableOutcomesToNewCollection = useCallback(() => {
    setNewCollection([...newCollection, ...availableOutcomes])
    availableOutcomes.length = 0
  }, [availableOutcomes, newCollection])

  const clearOutcomesFromNewCollection = useCallback(() => {
    setAvailableOutcomes([...availableOutcomes, ...newCollection])
    newCollection.length = 0
  }, [availableOutcomes, newCollection])

  const removeAllCollections = useCallback(() => {
    const newAvailableOutcomes: Array<any> = []

    allCollections.forEach((item: Array<OutcomeProps>) => {
      item.forEach((subitem: OutcomeProps) => {
        newAvailableOutcomes.push(subitem)
      })
    })

    setAvailableOutcomes([...availableOutcomes, ...newAvailableOutcomes])
    allCollections.length = 0
  }, [allCollections, availableOutcomes])

  const removeCollection = useCallback(
    (collectionIndex: number) => {
      setAvailableOutcomes([...availableOutcomes, ...allCollections[collectionIndex]])
      allCollections[collectionIndex].length = 0
      setAllCollections([
        ...allCollections.filter((collection: Array<OutcomeProps>) => collection.length > 0),
      ])
    },
    [availableOutcomes, allCollections]
  )

  const onSave = onRequestClose

  const onReset = useCallback(() => {
    setAllCollections([...outcomes])
    setAvailableOutcomes([])
    setNewCollection([])
  }, [outcomes])

  useEffect(() => {
    setAllCollections([...outcomes])
  }, [outcomes])

  const notEnoughCollections = allCollections.length < 2
  const orphanedOutcomes = availableOutcomes.length > 0 || newCollection.length > 0
  const disableButton = notEnoughCollections || orphanedOutcomes
  const addNewCollectionButtonHover = newCollectionOutcomesColor === theme.colors.primary

  return (
    <Modal
      onRequestClose={onRequestClose}
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
      title="Edit Partition"
      {...restProps}
    >
      <TitleValueExtraMargin
        title="New Collection"
        value={
          <>
            <CardSubtitle>Outcomes</CardSubtitle>
            <EditableOutcomesWrapper>
              <EditableOutcomes
                borderBottomColor={theme.colors.mediumGrey}
                fullBorderColor={availableOutcomesColor}
              >
                {availableOutcomes.length ? (
                  <OutcomesInner columnGap="8px" columns="12" rowGap="8px">
                    {availableOutcomes.map((outcome: OutcomeProps, outcomeIndex: number) => {
                      return (
                        <EditableOutcome
                          activeColor={availableOutcomesColor}
                          hoverColor={theme.colors.primary}
                          key={outcomeIndex}
                          onClick={() => {
                            addOutcomeToNewCollection(outcomeIndex)
                          }}
                          outcome={outcome}
                        />
                      )
                    })}
                  </OutcomesInner>
                ) : (
                  <CardTextPlaceholder>
                    Outcomes removed from collections will be available here.
                  </CardTextPlaceholder>
                )}
                <ButtonBulk
                  action={ButtonBulkMoveActions.add}
                  direction={ButtonBulkMoveDirection.down}
                  disabled={availableOutcomes.length === 0}
                  onClick={() => {
                    addAllAvailableOutcomesToNewCollection()
                    setAvailableOutcomesColor(undefined)
                  }}
                  onMouseEnter={() => setAvailableOutcomesColor(theme.colors.primary)}
                  onMouseLeave={() => setAvailableOutcomesColor(undefined)}
                />
              </EditableOutcomes>
            </EditableOutcomesWrapper>
            <CardSubtitle>New Collection Preview</CardSubtitle>
            <EditableOutcomesWrapper>
              <EditableOutcomes
                borderBottomColor={theme.colors.mediumGrey}
                fullBorderColor={newCollectionOutcomesColor}
              >
                {newCollection.length ? (
                  <OutcomesInner columnGap="8px" columns="12" rowGap="8px">
                    {newCollection.map((outcome: OutcomeProps, outcomeIndex: number) => {
                      return (
                        <EditableOutcome
                          activeColor={newCollectionOutcomesColor}
                          hoverColor={theme.colors.error}
                          key={outcomeIndex}
                          onClick={() => {
                            removeOutcomeFromNewCollection(outcomeIndex)
                          }}
                          outcome={outcome}
                        />
                      )
                    })}
                  </OutcomesInner>
                ) : (
                  <CardTextPlaceholder>
                    Add at least one outcome to create a new collection.
                  </CardTextPlaceholder>
                )}
                <ButtonBulk
                  action={ButtonBulkMoveActions.remove}
                  direction={ButtonBulkMoveDirection.up}
                  disabled={newCollection.length === 0}
                  flipVertical={addNewCollectionButtonHover}
                  onClick={() => {
                    clearOutcomesFromNewCollection()
                    setNewCollectionOutcomesColor(undefined)
                  }}
                  onMouseEnter={() => setNewCollectionOutcomesColor(theme.colors.error)}
                  onMouseLeave={() => setNewCollectionOutcomesColor(undefined)}
                />
              </EditableOutcomes>
              <ButtonAddNewCollectionContainer>
                <ButtonAdd
                  disabled={newCollection.length === 0}
                  onClick={() => {
                    addNewCollection()
                    setNewCollectionOutcomesColor(undefined)
                  }}
                  onMouseEnter={() => setNewCollectionOutcomesColor(theme.colors.primary)}
                  onMouseLeave={() => setNewCollectionOutcomesColor(undefined)}
                />
              </ButtonAddNewCollectionContainer>
            </EditableOutcomesWrapper>
          </>
        }
      />
      <TitleValue
        title="Collections"
        titleControl={
          <TitleControlButton
            disabled={allCollections.length === 0}
            onClick={() => {
              setConfirmDeleteAllCollections(true)
            }}
          >
            Delete All
          </TitleControlButton>
        }
        value={
          <>
            <CardText>
              You can drag outcomes across collections. Click on an outcome to remove it.
            </CardText>
            <Collections minHeight="200px">
              <>
                {allCollections.length > 0 ? (
                  allCollections.map(
                    (outcomesList: Array<OutcomeProps>, collectionIndex: number) => {
                      return (
                        <Collection
                          collectionIndex={collectionIndex}
                          key={collectionIndex}
                          onDragEnd={onDragEnd}
                          onDragStart={onDragStart}
                          onDrop={onDrop}
                          outcomesByRow={outcomesByRow}
                          outcomesList={outcomesList}
                          removeCollection={removeCollection}
                          removeOutcomeFromCollection={removeOutcomeFromCollection}
                        />
                      )
                    }
                  )
                ) : (
                  <StripedListEmpty>
                    <strong>No collections.</strong>
                  </StripedListEmpty>
                )}
                {confirmDeleteAllCollections && (
                  <ConfirmOverlay
                    confirm={() => {
                      removeAllCollections()
                      setConfirmDeleteAllCollections(false)
                    }}
                    deny={() => {
                      setConfirmDeleteAllCollections(false)
                    }}
                    text="Remove all collections?"
                  />
                )}
              </>
            </Collections>
            <SmallNote>
              A valid partition needs at least two collections. No outcomes can be orphaned.
            </SmallNote>
          </>
        }
      />
      <ButtonContainer>
        <ButtonReset buttonType={ButtonType.danger} onClick={onReset}>
          Reset
        </ButtonReset>
        <Button disabled={disableButton} onClick={onSave}>
          Save
        </Button>
      </ButtonContainer>
      <PlaceholderOutcome
        disableTooltip
        id={placeholderOutcomeId}
        outcome={draggedOutcome || { id: '', value: 150 }}
      />
    </Modal>
  )
}

export const EditPartitionModal = withTheme(PartitionModal)
