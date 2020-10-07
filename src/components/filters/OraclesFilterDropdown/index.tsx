import React from 'react'

import { ButtonSelectLight } from 'components/buttons/ButtonSelectLight'
import { DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { FilterDropdown } from 'components/pureStyledComponents/FilterDropdown'
import { FilterTitle } from 'components/pureStyledComponents/FilterTitle'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Oracle, OracleFilterOptions } from 'util/types'

interface Props {
  onClick: (value: OracleFilterOptions, filter: string[]) => void
  value: string
}

export const OraclesFilterDropdown = ({ onClick, value }: Props) => {
  const { networkConfig, address } = useWeb3ConnectedOrInfura()
  const oracles: Oracle[] = networkConfig.getOracles()

  const oraclesAdresses: string[] = oracles.map((oracle: Oracle) => oracle.address)

  const oraclesItems = [
    {
      text: 'All',
      onClick: () => {
        onClick(OracleFilterOptions.All, [])
      },
      value: OracleFilterOptions.All,
    },
    {
      text: 'Current Wallet',
      onClick: () => {
        const currentWallet = address ? [address] : []
        onClick(OracleFilterOptions.Current, currentWallet)
      },
      value: OracleFilterOptions.Current,
    },
    {
      text: 'Custom Reporters',
      onClick: () => {
        onClick(OracleFilterOptions.Custom, oraclesAdresses)
      },
      value: OracleFilterOptions.Custom,
    },
  ]

  for (const oracle of oracles) {
    const oracleItem = {
      text: oracle.description,
      onClick: () => {
        onClick(oracle.name as OracleFilterOptions, [oracle.address])
      },
      value: oracle.name as OracleFilterOptions,
    }
    oraclesItems.push(oracleItem)
  }

  return (
    <>
      <FilterTitle>Reporter / Oracle</FilterTitle>
      <FilterDropdown
        currentItem={oraclesItems.findIndex((oracleItem) => oracleItem.value === value)}
        dropdownButtonContent={
          <ButtonSelectLight
            content={oraclesItems.filter((item) => item.value === value)[0].text}
          />
        }
        dropdownPosition={DropdownPosition.center}
        items={oraclesItems.map((item, index) => (
          <DropdownItem key={index} onClick={item.onClick}>
            {item.text}
          </DropdownItem>
        ))}
      />
    </>
  )
}
