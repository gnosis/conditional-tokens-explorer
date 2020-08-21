import React from 'react'

import { ConditionType } from '../../../util/types'
import { ButtonSelect } from '../../buttons/ButtonSelect'
import { SelectItem } from '../../form/SelectItem'
import { Dropdown, DropdownPosition } from '../Dropdown'

interface Props {
  onClick: (value: ConditionType) => void
  value: ConditionType
}

export const ConditionTypesDropdown = ({ onClick, value }: Props) => {
  const conditionTypeItems = [
    {
      text: ConditionType.custom,
      onClick: () => {
        onClick(ConditionType.custom)
      },
      value: ConditionType.custom,
    },
    {
      text: ConditionType.omen,
      onClick: () => {
        onClick(ConditionType.omen)
      },
      value: ConditionType.omen,
    },
  ]

  return (
    <Dropdown
      dropdownButtonContent={
        <ButtonSelect content={conditionTypeItems.filter((item) => item.value === value)[0].text} />
      }
      dropdownPosition={DropdownPosition.center}
      fullWidth
      items={conditionTypeItems.map((item, index) => (
        <SelectItem
          content={item.text}
          key={index}
          name="conditionType"
          onClick={item.onClick}
          value={item.value}
        />
      ))}
    />
  )
}
