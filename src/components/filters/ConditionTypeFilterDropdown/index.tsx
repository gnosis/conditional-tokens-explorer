import React from 'react'

import { ButtonSelectLight } from 'components/buttons/ButtonSelectLight'
import { DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { FilterDropdown } from 'components/pureStyledComponents/FilterDropdown'
import { FilterTitle } from 'components/pureStyledComponents/FilterTitle'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { ConditionType, ConditionTypeAll } from 'util/types'

interface Props {
  onClick: (value: ConditionType | ConditionTypeAll, filter: Maybe<string>) => void
  value: Maybe<string>
}

export const ConditionTypeFilterDropdown: React.FC<Props> = (props) => {
  const { networkConfig } = useWeb3ConnectedOrInfura()
  const { onClick, value } = props

  const oracleRealitio = networkConfig.getOracleFromName('realitio' as KnownOracle)

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
        onClick(ConditionType.omen, oracleRealitio.address)
      },
      text: 'Omen',
      value: ConditionType.omen,
    },
    {
      onClick: () => {
        onClick(ConditionType.custom, oracleRealitio.address)
      },
      text: 'Custom Reporter',
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
