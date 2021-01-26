import React, { createRef, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ButtonAdd } from 'components/buttons/ButtonAdd'
import { ButtonControl, ButtonControlType } from 'components/buttons/ButtonControl'
import { ErrorContainer, Error as ErrorMessage } from 'components/pureStyledComponents/Error'
import { Row } from 'components/pureStyledComponents/Row'
import { SmallNote } from 'components/pureStyledComponents/SmallNote'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { TitleValue } from 'components/text/TitleValue'
import { MAX_OUTCOMES_ALLOWED, MIN_OUTCOMES_ALLOWED } from 'config/constants'

const NewOutcomeWrapper = styled.div`
  column-gap: 12px;
  display: grid;
  grid-template-columns: 1fr 36px;
`

const Controls = styled.div<{ isEditing: boolean }>`
  column-gap: 15px;
  display: grid;
  grid-template-columns: ${(props) => (props.isEditing ? '20px 20px 20px' : '20px 20px')};
  margin-left: 30px;
`

Controls.defaultProps = {
  isEditing: false,
}

const OutcomeWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  height: 100%;
  justify-content: space-between;
`

const Outcome = styled.input<{ error?: boolean }>`
  background: transparent;
  border-bottom: 1px solid
    ${(props) => (props.error ? props.theme.colors.error : props.theme.colors.primary)};
  border-left: none;
  border-right: none;
  border-top: none;
  color: ${(props) => (props.error ? props.theme.colors.error : props.theme.colors.darkerGrey)};
  cursor: text;
  display: block;
  flex-grow: 1;
  font-size: 15px;
  font-weight: 400;
  outline: none;
  overflow: hidden;
  padding-bottom: 5px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[readOnly] {
    border-bottom-color: transparent;
    cursor: default;
    pointer-events: none;
  }
`

Outcome.defaultProps = {
  error: false,
}

const sanitizedOutcome = (outcome: string | undefined): string | undefined => {
  return outcome?.trim()
}

const isOutcomeTextValid = (outcome: string | undefined): boolean => {
  if (sanitizedOutcome(outcome)?.length === 0) return false

  return true
}

const EditableOutcome: React.FC<{
  outcomeIndex: number
  outcomeText: string | undefined
  outcomes: Array<string | undefined>
  removeOutcome: () => void
  updateOutcome: (value: string, index: number) => void
  onEditOutcome: (value: boolean, index: number) => void
}> = (props) => {
  const {
    onEditOutcome,
    outcomeIndex,
    outcomeText,
    outcomes,
    removeOutcome,
    updateOutcome,
    ...restProps
  } = props
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState<string | undefined>(outcomeText)
  const outcomeField = createRef<HTMLInputElement>()

  const isOutcomeDuplicated = useCallback((): boolean => {
    return outcomes
      .filter((item, index) => index !== outcomeIndex)
      .includes(sanitizedOutcome(value))
  }, [value, outcomes, outcomeIndex])

  const isOutcomeValueOK = useMemo(() => isOutcomeTextValid(value) && !isOutcomeDuplicated(), [
    isOutcomeDuplicated,
    value,
  ])

  const saveSanitizedValue = useCallback(
    (value: string | undefined) => {
      setValue(sanitizedOutcome(value))
    },
    [setValue]
  )

  const resetValue = useCallback(() => {
    saveSanitizedValue(outcomeText)
  }, [saveSanitizedValue, outcomeText])

  const onSave = useCallback(() => {
    if (value) {
      saveSanitizedValue(value)
      setIsEditing(false)
      onEditOutcome(false, outcomeIndex)
      updateOutcome(value, outcomeIndex)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateOutcome, setIsEditing, saveSanitizedValue, value, outcomeIndex])

  const onPressEnter = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && isOutcomeValueOK) {
        onSave()
      }
      if (e.key === 'Escape') {
        resetValue()
        setIsEditing(false)
        onEditOutcome(false, outcomeIndex)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOutcomeValueOK, onSave, resetValue, outcomeIndex]
  )

  return (
    <OutcomeWrapper title={value} {...restProps}>
      <Outcome
        autoComplete="off"
        error={!isOutcomeValueOK}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value)}
        onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
          onPressEnter(e)
        }}
        readOnly={!isEditing}
        ref={outcomeField}
        title={value}
        type="text"
        value={value}
      />
      <Controls isEditing={isEditing}>
        {!isEditing && (
          <ButtonControl
            buttonType={ButtonControlType.edit}
            onClick={() => {
              setIsEditing(true)
              onEditOutcome(true, outcomeIndex)
              outcomeField.current?.focus()
            }}
            title="Edit"
          />
        )}
        {isEditing && (
          <ButtonControl
            buttonType={ButtonControlType.ok}
            disabled={!isOutcomeValueOK}
            onClick={() => {
              if (isOutcomeValueOK) {
                onSave()
              }
            }}
            title="Save"
          />
        )}
        {isEditing && (
          <ButtonControl
            buttonType={ButtonControlType.cancel}
            onClick={() => {
              resetValue()
              setIsEditing(false)
              onEditOutcome(false, outcomeIndex)
            }}
            title="Cancel"
          />
        )}
        <ButtonControl
          buttonType={ButtonControlType.delete}
          disabled={isEditing}
          onClick={() => {
            removeOutcome()
            setIsEditing(false)
            onEditOutcome(false, outcomeIndex)
          }}
          title="Remove"
        />
      </Controls>
    </OutcomeWrapper>
  )
}

interface Props {
  addOutcome: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  outcome: string | undefined
  outcomes: Array<string>
  removeOutcome: (index: number) => void
  updateOutcome: (value: string, index: number) => void
  toggleEditOutcome: (value: boolean, index: number) => void
  areOutcomesBeingEdited: boolean
}

export const AddOutcome: React.FC<Props> = (props) => {
  const {
    addOutcome,
    areOutcomesBeingEdited,
    onChange,
    outcome = '',
    outcomes,
    removeOutcome,
    toggleEditOutcome,
    updateOutcome,
    ...restProps
  } = props
  const maxOutcomesReached = outcomes.length === MAX_OUTCOMES_ALLOWED
  const buttonAddDisabled =
    maxOutcomesReached || !isOutcomeTextValid(outcome) || outcomes.includes(outcome)
  const outcomeNameRef = React.createRef<HTMLInputElement>()

  const onPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !buttonAddDisabled) {
      addOutcome()
      outcomeNameRef.current?.focus()
    }
  }

  return (
    <Row {...restProps}>
      <TitleValue
        title="Add Outcome"
        value={
          <NewOutcomeWrapper>
            <Textfield
              autoComplete="off"
              disabled={maxOutcomesReached}
              onChange={onChange}
              onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
                onPressEnter(e)
              }}
              placeholder="New outcome title..."
              ref={outcomeNameRef}
              type="text"
              value={outcome}
            />
            <ButtonAdd disabled={buttonAddDisabled} onClick={addOutcome} />
          </NewOutcomeWrapper>
        }
      />
      <TitleValue
        title="Outcomes"
        value={
          <>
            <StripedList>
              {outcomes.length ? (
                outcomes.map((item, index) => (
                  <StripedListItem key={`${index}_${item}`}>
                    <EditableOutcome
                      onEditOutcome={(value, index) => toggleEditOutcome(value, index)}
                      outcomeIndex={index}
                      outcomeText={item}
                      outcomes={outcomes}
                      removeOutcome={() => removeOutcome(index)}
                      updateOutcome={(value, index) => updateOutcome(value, index)}
                    />
                  </StripedListItem>
                ))
              ) : (
                <StripedListEmpty>No outcomes.</StripedListEmpty>
              )}
            </StripedList>
            {areOutcomesBeingEdited && true && (
              <ErrorContainer>
                <ErrorMessage>Unsaved changes</ErrorMessage>
              </ErrorContainer>
            )}
            <SmallNote>
              <strong>Note:</strong> Omen supports min. {MIN_OUTCOMES_ALLOWED} and max.{' '}
              {MAX_OUTCOMES_ALLOWED} outcomes.
            </SmallNote>
          </>
        }
      />
    </Row>
  )
}
