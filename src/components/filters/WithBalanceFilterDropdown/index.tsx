import React from 'react'
import styled from 'styled-components'

import { ButtonSelectLight } from 'components/buttons/ButtonSelectLight'
import { DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { FilterDropdown } from 'components/pureStyledComponents/FilterDropdown'
import {
  FilterTitle,
  FilterTitleButton,
  FilterWrapper,
} from 'components/pureStyledComponents/FilterTitle'
import { WithBalanceOptions } from 'util/types'

const Wrapper = styled.div``

interface Props {
  onClear?: () => void
  onClick: (value: WithBalanceOptions) => void
  value: string
}

export const WithBalanceFilterDropdown: React.FC<Props> = (props) => {
  const { onClear, onClick, value, ...restProps } = props

  const dropdownItems = [
    {
      onClick: () => {
        onClick(WithBalanceOptions.All)
      },
      text: 'All',
      value: WithBalanceOptions.All,
    },
    {
      onClick: () => {
        onClick(WithBalanceOptions.Yes)
      },
      text: 'Yes',
      value: WithBalanceOptions.Yes,
    },
    {
      onClick: () => {
        onClick(WithBalanceOptions.No)
      },
      text: 'No',
      value: WithBalanceOptions.No,
    },
  ]

  return (
    <Wrapper {...restProps}>
      <FilterWrapper>
        <FilterTitle>With Balance</FilterTitle>
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
    </Wrapper>
  )
}
