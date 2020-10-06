import React from 'react'

import { ButtonSelectLight } from 'components/buttons/ButtonSelectLight'
import { DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { FilterDropdown } from 'components/pureStyledComponents/FilterDropdown'
import { FilterTitle } from 'components/pureStyledComponents/FilterTitle'
import { ConditionType, ConditionTypeAll } from 'util/types'

interface Props {
  onClick: (value: ConditionType | ConditionTypeAll) => void
  value: string
}

export const ConditionTypeFilterDropdown: React.FC<Props> = (props) => {
  const { onClick, value } = props

  const dropdownItems = [
    {
      onClick: () => {
        onClick(ConditionTypeAll.all)
      },
      text: 'All',
      value: ConditionTypeAll.all,
    },
    {
      onClick: () => {
        onClick(ConditionType.omen)
      },
      text: 'Omen',
      value: ConditionType.omen,
    },
    {
      onClick: () => {
        onClick(ConditionType.custom)
      },
      text: 'Open',
      value: ConditionType.custom,
    },
  ]

  return (
    <>
      <FilterTitle>Condition Type</FilterTitle>
      <FilterDropdown
        currentItem={dropdownItems.findIndex((item) => item.value === value)}
        dropdownButtonContent={
          <ButtonSelectLight
            content={dropdownItems.filter((item) => item.value === value)[0].text}
          />
        }
        dropdownPosition={DropdownPosition.center}
        items={dropdownItems.map((item, index) => (
          <DropdownItem key={index} onClick={item.onClick}>
            {item.text}
          </DropdownItem>
        ))}
      />
    </>
  )
}
