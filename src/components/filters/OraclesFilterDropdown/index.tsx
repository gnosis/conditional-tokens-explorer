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
import { getLogger } from 'util/logger'
import { Oracle, OracleFilterOptions } from 'util/types'

const Wrapper = styled.div``

interface Props {
  onClear?: () => void
  onClick: (value: OracleFilterOptions, filter: string[]) => void
  value: string
}

const logger = getLogger('Oracle Filter')

export const OraclesFilterDropdown = ({ onClear, onClick, value }: Props) => {
  const { CPKService, address, networkConfig, ...restProps } = useWeb3ConnectedOrInfura()
  const oracles: Oracle[] = networkConfig.getOracles()

  const oraclesAdresses: string[] = oracles.map((oracle: Oracle) => oracle.address.toLowerCase())

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
        const currentWallet =
          address && CPKService ? [address.toLowerCase(), CPKService.address.toLowerCase()] : []
        logger.log(`Current Wallet`, currentWallet)
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
    ...oracles
      .filter((item) => item.name !== OracleFilterOptions.Kleros)
      .map((item) => {
        return {
          text: item.description,
          onClick: () => {
            onClick(item.name as OracleFilterOptions, [item.address.toLowerCase()])
          },
          value: item.name as OracleFilterOptions,
        }
      }),
  ]

  return (
    <Wrapper {...restProps}>
      <FilterWrapper>
        <FilterTitle>Reporter / Oracle</FilterTitle>
        {onClear && <FilterTitleButton onClick={onClear}>Clear</FilterTitleButton>}
      </FilterWrapper>
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
    </Wrapper>
  )
}
