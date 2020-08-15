import React, { useState } from 'react'
import styled from 'styled-components'

import { Row } from '../../pureStyledComponents/Row'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from '../../pureStyledComponents/StripedList'
import { Textfield } from '../../pureStyledComponents/Textfield'
import { TitleValue } from '../../text/TitleValue'

import { IconDelete } from './img/IconDelete'
import { IconEdit } from './img/IconEdit'
import { IconOk } from './img/IconOk'
import { IconPlus } from './img/IconPlus'

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

const ButtonControl = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  height: 20px;
  outline: none;
  padding: 0;
  width: 20px;

  &:hover {
    .iconEdit {
      path {
        fill: ${(props) => props.theme.colors.primary};
      }
    }

    .iconDelete {
      path {
        fill: ${(props) => props.theme.colors.delete};
      }
    }
  }

  &:active {
    opacity: 0.6;
  }

  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;

    .iconEdit,
    .iconDelete {
      path {
        fill: ${(props) => props.theme.colors.darkGrey};
      }
    }
  }
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

const EditableOutcome: React.FC<{ item: OutcomeProps }> = (props) => {
  const { item, ...restProps } = props
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState<OutcomeProps>(item)

  return (
    <OutcomeWrapper {...restProps}>
      <Outcome
        onBlur={() => setIsEditing(false)}
        onChange={(e) => setValue({ text: e.currentTarget.value })}
        readOnly={!isEditing}
        type="text"
        value={value.text}
      />
      <Controls>
        {!isEditing && (
          <ButtonControl onClick={() => setIsEditing(true)}>
            <IconEdit />
          </ButtonControl>
        )}
        {isEditing && (
          <ButtonControl onClick={() => setIsEditing(false)}>
            <IconOk />
          </ButtonControl>
        )}
        <ButtonControl>
          <IconDelete />
        </ButtonControl>
      </Controls>
    </OutcomeWrapper>
  )
}

export interface OutcomeProps {
  text: string | undefined
}

interface Props {
  addOutcome: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  outcome: OutcomeProps
  outcomes: Array<OutcomeProps>
}

export const AddOutcome: React.FC<Props> = (props) => {
  const { addOutcome, onChange, outcome, outcomes, ...restProps } = props

  return (
    <Row cols="1fr" {...restProps}>
      <TitleValue
        title="Add Outcome"
        value={
          <NewOutcomeWrapper>
            <Textfield
              onChange={onChange}
              placeholder="New outcome title..."
              type="text"
              value={outcome.text}
            />
            <ButtonAdd disabled={!outcome.text} onClick={addOutcome}>
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
                  <EditableOutcome item={item} />
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
