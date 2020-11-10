import React from 'react'
import styled from 'styled-components'

import { ButtonSelectLight } from 'components/buttons/ButtonSelectLight'
import { DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { FilterDropdown } from 'components/pureStyledComponents/FilterDropdown'
import { FilterTitle } from 'components/pureStyledComponents/FilterTitle'
import { StatusOptions } from 'util/types'

const Wrapper = styled.div``

interface Props {
  onClick: (value: StatusOptions) => void
  value: string
}

export const StatusFilterDropdown: React.FC<Props> = (props) => {
  const { onClick, value, ...restProps } = props

  const dropdownItems = [
    {
      onClick: () => {
        onClick(StatusOptions.All)
      },
      text: 'All',
      value: StatusOptions.All,
    },
    {
      onClick: () => {
        onClick(StatusOptions.Resolved)
      },
      text: 'Resolved',
      value: StatusOptions.Resolved,
    },
    {
      onClick: () => {
        onClick(StatusOptions.Open)
      },
      text: 'Open',
      value: StatusOptions.Open,
    },
  ]

  return (
    <Wrapper {...restProps}>
      <FilterTitle>Status</FilterTitle>
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
