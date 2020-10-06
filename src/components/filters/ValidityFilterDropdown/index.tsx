import React from 'react'

import { ButtonSelectLight } from 'components/buttons/ButtonSelectLight'
import { DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { FilterDropdown } from 'components/pureStyledComponents/FilterDropdown'
import { FilterTitle } from 'components/pureStyledComponents/FilterTitle'
import { ValidityOptions } from 'util/types'

interface Props {
  onClick: (value: ValidityOptions) => void
  value: string
}

export const ValidityFilterDropdown: React.FC<Props> = (props) => {
  const { onClick, value } = props

  const dropdownItems = [
    {
      onClick: () => {
        onClick(ValidityOptions.All)
      },
      text: 'All',
      value: ValidityOptions.All,
    },
    {
      onClick: () => {
        onClick(ValidityOptions.Valid)
      },
      text: 'Valid',
      value: ValidityOptions.Valid,
    },
    {
      onClick: () => {
        onClick(ValidityOptions.Invalid)
      },
      text: 'Invalid',
      value: ValidityOptions.Invalid,
    },
  ]

  return (
    <>
      <FilterTitle>Validity</FilterTitle>
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
