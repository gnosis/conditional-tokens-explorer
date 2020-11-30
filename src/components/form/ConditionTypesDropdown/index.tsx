import React, { useMemo } from 'react'

import { ButtonSelect } from 'components/buttons/ButtonSelect'
import { Dropdown, DropdownPosition } from 'components/common/Dropdown'
import { SelectItem } from 'components/form/SelectItem'
import { ConditionType } from 'util/types'

interface Props {
  onClick: (value: ConditionType) => void
  value: ConditionType
}

export const ConditionTypesDropdown = ({ onClick, value }: Props) => {
  const conditionTypeItems = useMemo(
    () => [
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
    ],
    [onClick]
  )

  const currentItem = useMemo(
    () => conditionTypeItems.findIndex((conditionType) => conditionType.value === value),
    [value, conditionTypeItems]
  )

  return (
    <Dropdown
      currentItem={currentItem}
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
