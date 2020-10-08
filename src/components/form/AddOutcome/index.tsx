import React, { createRef, useCallback, useState } from 'react'
import styled from 'styled-components'

import { ButtonAdd } from 'components/buttons/ButtonAdd'
import { ButtonControl, ButtonControlType } from 'components/buttons/ButtonControl'
import { Row } from 'components/pureStyledComponents/Row'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { TitleValue } from 'components/text/TitleValue'

const NewOutcomeWrapper = styled.div`
  column-gap: 12px;
  display: grid;
  grid-template-columns: 1fr 36px;
`

const Controls = styled.div`
  display: grid;
  grid-template-columns: 20px 20px;
  column-gap: 15px;
  margin-left: 30px;
`

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
}> = (props) => {
  const { outcomeIndex, outcomeText, outcomes, removeOutcome, ...restProps } = props
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState<string | undefined>(outcomeText)
  const outcomeField = createRef<HTMLInputElement>()

  const isOutcomeDuplicated = React.useCallback((): boolean => {
    return outcomes
      .filter((item, index) => index !== outcomeIndex)
      .includes(sanitizedOutcome(value))
  }, [value, outcomes, outcomeIndex])

  const isOutcomeValueOK = isOutcomeTextValid(value) && !isOutcomeDuplicated()

  const saveSanitizedValue = useCallback(
    (value: string | undefined) => {
      setValue(sanitizedOutcome(value))
    },
    [setValue]
  )

  const resetValue = useCallback(() => {
    saveSanitizedValue(outcomeText)
  }, [saveSanitizedValue, outcomeText])

  const onPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isOutcomeValueOK) {
      saveSanitizedValue(value)
      setIsEditing(false)
    }
    if (e.key === 'Escape') {
      resetValue()
      setIsEditing(false)
    }
  }

  const onBlur = () => {
    // if (!isOutcomeValueOK) {
    //   resetValue()
    // } else {
    //   saveSanitizedValue(value)
    // }
    // setIsEditing(false)
  }

  return (
    <OutcomeWrapper {...restProps}>
      <Outcome
        error={!isOutcomeValueOK}
        onBlur={onBlur}
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
      <Controls>
        {!isEditing && (
          <ButtonControl
            buttonType={ButtonControlType.edit}
            onClick={() => {
              setIsEditing(true)
              outcomeField.current?.focus()
            }}
          />
        )}
        {isEditing && (
          <ButtonControl
            buttonType={ButtonControlType.ok}
            disabled={!isOutcomeValueOK}
            onClick={() => {
              if (isOutcomeValueOK) {
                setIsEditing(false)
              }
            }}
          />
        )}
        <ButtonControl buttonType={ButtonControlType.delete} onClick={removeOutcome} />
      </Controls>
    </OutcomeWrapper>
  )
}

interface Props {
  addOutcome: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  outcome: string | undefined
  outcomes: Array<string | undefined>
  removeOutcome: (index: number) => void
}

export const AddOutcome: React.FC<Props> = (props) => {
  const { addOutcome, onChange, outcome = '', outcomes, removeOutcome, ...restProps } = props
  const maxOutcomesReached = outcomes.length === 256
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
    <Row cols="1fr" {...restProps}>
      <TitleValue
        title="Add Outcome"
        value={
          <NewOutcomeWrapper>
            <Textfield
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
          <StripedList maxHeight="300px" minHeight="200px">
            {outcomes.length ? (
              outcomes.map((item, index) => (
                <StripedListItem key={index}>
                  <EditableOutcome
                    outcomeIndex={index}
                    outcomeText={item}
                    outcomes={outcomes}
                    removeOutcome={() => removeOutcome(index)}
                  />
                </StripedListItem>
              ))
            ) : (
              <StripedListEmpty>No outcomes.</StripedListEmpty>
            )}
          </StripedList>
        }
      />
    </Row>
  )
}
