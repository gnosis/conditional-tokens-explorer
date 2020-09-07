import React from 'react'

import { ButtonSelect } from 'components/buttons/ButtonSelect'
import { Dropdown, DropdownPosition } from 'components/common/Dropdown'
import { SelectItem } from 'components/form/SelectItem'
import { QuestionType } from 'util/types'

interface Props {
  onClick: (value: QuestionType) => void
  value: QuestionType
}

export const QuestionTypesDropdown = ({ onClick, value }: Props) => {
  const questionTypeItems = [
    {
      text: QuestionType.binary,
      onClick: () => {
        onClick(QuestionType.binary)
      },
      value: QuestionType.binary,
    },
    {
      text: QuestionType.nuancedBinary,
      onClick: () => {
        onClick(QuestionType.nuancedBinary)
      },
      value: QuestionType.nuancedBinary,
    },
    {
      text: QuestionType.categorical,
      onClick: () => {
        onClick(QuestionType.categorical)
      },
      value: QuestionType.categorical,
    },
  ]

  return (
    <Dropdown
      dropdownButtonContent={
        <ButtonSelect content={questionTypeItems.filter((item) => item.value === value)[0].text} />
      }
      dropdownPosition={DropdownPosition.center}
      fullWidth
      items={questionTypeItems.map((item, index) => (
        <SelectItem
          content={item.text}
          key={index}
          name="questionType"
          onClick={item.onClick}
          value={item.value}
        />
      ))}
    />
  )
}
