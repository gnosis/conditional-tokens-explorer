import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { ButtonControl, ButtonControlType } from 'components/buttons/ButtonControl'
import { IconPlus } from 'components/icons/IconPlus'
import { Row } from 'components/pureStyledComponents/Row'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { TitleValue } from 'components/text/TitleValue'

const ButtonAdd = styled.button`
  align-items: center;
  background-color: ${(props) => props.theme.buttonPrimary.backgroundColor};
  border-radius: 50%;
  border: 1px solid ${(props) => props.theme.buttonPrimary.borderColor};
  cursor: pointer;
  display: flex;
  height: 36px;
  justify-content: center;
  outline: none;
  padding: 0;
  transition: all 0.15s ease-out;
  width: 36px;

  &:hover {
    border-color: ${(props) => props.theme.buttonPrimary.borderColorHover};
    background-color: ${(props) => props.theme.buttonPrimary.backgroundColorHover};
  }

  &[disabled] {
    background-color: ${(props) => props.theme.buttonPrimary.borderColor};
    border-color: ${(props) => props.theme.buttonPrimary.borderColor};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

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

const Outcome = styled.input`
  background: transparent;
  border-bottom: 1px solid ${(props) => props.theme.colors.primary};
  border-left: none;
  border-right: none;
  border-top: none;
  color: ${(props) => props.theme.colors.darkerGray};
  cursor: text;
  flex-grow: 1;
  font-size: 15px;
  font-weight: 400;
  outline: none;
  padding-bottom: 5px;
  text-align: left;

  &[readOnly] {
    border-bottom-color: transparent;
    cursor: default;
  }
`

const EditableOutcome: React.FC<{ item: string | undefined; removeOutcome: () => void }> = (
  props
) => {
  const { item, removeOutcome, ...restProps } = props
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState<string | undefined>(item)

  useEffect(() => {
    setValue(item)
  }, [item])

  return (
    <OutcomeWrapper {...restProps}>
      <Outcome
        onBlur={() => setIsEditing(false)}
        onChange={(e) => setValue(e.currentTarget.value)}
        readOnly={!isEditing}
        type="text"
        value={value}
      />
      <Controls>
        {!isEditing && (
          <ButtonControl buttonType={ButtonControlType.edit} onClick={() => setIsEditing(true)} />
        )}
        {isEditing && (
          <ButtonControl buttonType={ButtonControlType.ok} onClick={() => setIsEditing(false)} />
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
  const newOutcomeDisabled = outcomes.length === 256
  const buttonAddDisabled = !outcome || newOutcomeDisabled
  const outcomeNameRef = React.createRef<HTMLInputElement>()

  const onPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !buttonAddDisabled) {
      addOutcome()

      if (outcomeNameRef && outcomeNameRef.current) {
        outcomeNameRef.current.focus()
      }
    }
  }

  return (
    <Row cols="1fr" {...restProps}>
      <TitleValue
        title="Add Outcome"
        value={
          <NewOutcomeWrapper>
            <Textfield
              disabled={newOutcomeDisabled}
              onChange={onChange}
              onKeyUp={(e) => {
                onPressEnter(e)
              }}
              placeholder="New outcome title..."
              ref={outcomeNameRef}
              type="text"
              value={outcome}
            />
            <ButtonAdd disabled={buttonAddDisabled} onClick={addOutcome}>
              <IconPlus />
            </ButtonAdd>
          </NewOutcomeWrapper>
        }
      />
      <TitleValue
        title="Outcomes"
        value={
          <StripedList>
            {outcomes.length ? (
              outcomes.map((item, index) => (
                <StripedListItem key={index}>
                  <EditableOutcome item={item} removeOutcome={() => removeOutcome(index)} />
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
