import React, { useState } from 'react'
import styled from 'styled-components'

import { StripedList, StripedListItem } from '../../common/StripedList'
import { Row } from '../../pureStyledComponents/Row'
import { Textfield } from '../../pureStyledComponents/Textfield'
import { TitleValue } from '../../text/TitleValue'

import { IconDelete } from './img/IconDelete'
import { IconEdit } from './img/IconEdit'
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

const mockedOutcomes = [
  {
    text: 'Outcome Number 1',
  },
  {
    text: 'Outcome Number 2',
  },
  {
    text: 'Outcome Number 3',
  },
  {
    text: 'Outcome Number 4',
  },
  {
    text: 'Outcome Number 5',
  },
]

const EditableOutcome: React.FC<{ index: number }> = (props) => {
  const { index, ...restProps } = props
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState<string>(mockedOutcomes[index].text)

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
        <ButtonControl onClick={() => setIsEditing(!isEditing)}>
          <IconEdit />
        </ButtonControl>
        <ButtonControl>
          <IconDelete />
        </ButtonControl>
      </Controls>
    </OutcomeWrapper>
  )
}

export const AddOutcome: React.FC = (props) => {
  const { ...restProps } = props

  return (
    <Row cols="1fr" {...restProps}>
      <TitleValue
        title="Add Outcome"
        value={
          <NewOutcomeWrapper>
            <Textfield name="addOutcome" placeholder="New outcome title..." type="text" />
            <ButtonAdd>
              <IconPlus />
            </ButtonAdd>
          </NewOutcomeWrapper>
        }
      />
      <TitleValue
        title="Outcomes"
        value={
          <StripedList>
            {mockedOutcomes.map((item, index) => (
              <StripedListItem key={index}>
                <EditableOutcome index={index} />
              </StripedListItem>
            ))}
          </StripedList>
        }
      />
    </Row>
  )
}
