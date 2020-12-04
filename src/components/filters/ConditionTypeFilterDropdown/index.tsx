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
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { ConditionType, ConditionTypeAll } from 'util/types'

const Wrapper = styled.div``

interface Props {
  onClear?: () => void
  onClick: (value: ConditionType | ConditionTypeAll, filter: Maybe<string>) => void
  value: Maybe<string>
}

export const ConditionTypeFilterDropdown: React.FC<Props> = (props) => {
  const { networkConfig } = useWeb3ConnectedOrInfura()
  const { onClear, onClick, value, ...restProps } = props

  const oracleReality = React.useMemo(
    () => networkConfig.getOracleFromName('reality' as KnownOracle),
    [networkConfig]
  )

  const dropdownItems = [
    {
      onClick: () => {
        onClick(ConditionTypeAll.all, null)
      },
      text: 'All',
      value: ConditionTypeAll.all,
    },
    {
      onClick: () => {
        onClick(ConditionType.omen, oracleReality.address.toLowerCase())
      },
      text: 'Omen Condition',
      value: ConditionType.omen,
    },
    {
      onClick: () => {
        onClick(ConditionType.custom, oracleReality.address.toLowerCase())
      },
      text: 'Custom Reporter',
      value: ConditionType.custom,
    },
  ]

  return (
    <Wrapper {...restProps}>
      <FilterWrapper>
        <FilterTitle>Condition Type</FilterTitle>
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
