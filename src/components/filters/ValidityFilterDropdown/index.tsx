import React from 'react'

import { ButtonSelectLight } from 'components/buttons/ButtonSelectLight'
import { DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { FilterDropdown } from 'components/pureStyledComponents/FilterDropdown'
import {
  FilterTitle,
  FilterTitleButton,
  FilterWrapper,
} from 'components/pureStyledComponents/FilterTitle'
import { ValidityOptions } from 'util/types'

interface Props {
  onClear?: () => void
  onClick: (value: ValidityOptions) => void
  value: string
}

export const ValidityFilterDropdown: React.FC<Props> = (props) => {
  const { onClear, onClick, value } = props

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
      <FilterWrapper>
        <FilterTitle>Validity</FilterTitle>
        {onClear && <FilterTitleButton onClick={onClear}>Clear</FilterTitleButton>}
      </FilterWrapper>
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
