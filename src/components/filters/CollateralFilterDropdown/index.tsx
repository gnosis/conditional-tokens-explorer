import React from 'react'
import styled from 'styled-components'

import { ButtonSelectLight } from 'components/buttons/ButtonSelectLight'
import { DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { TokenIcon } from 'components/common/TokenIcon'
import { FilterDropdown } from 'components/pureStyledComponents/FilterDropdown'
import { FilterTitle } from 'components/pureStyledComponents/FilterTitle'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { CollateralFilterOptions, Token } from 'util/types'

const Wrapper = styled.div``

interface Props {
  onClick: (symbol: string, address: Maybe<string[]>) => void
  value: string
}

export const CollateralFilterDropdown = ({ onClick, value, ...restProps }: Props) => {
  const { networkConfig } = useWeb3ConnectedOrInfura()
  const tokensList = networkConfig
    ? [
        ...networkConfig.getTokens().map((token: Token) => {
          return {
            content: <TokenIcon token={token} />,
            onClick: () => {
              onClick(token.symbol, [token.address.toLowerCase()])
            },
            value: token.symbol,
          }
        }),
      ]
    : []

  const tokenItems = [
    {
      content: 'All',
      onClick: () => {
        onClick(CollateralFilterOptions.All, null)
      },
      value: CollateralFilterOptions.All,
    },
    ...tokensList,
    {
      content: 'Custom Token',
      onClick: () => {
        onClick(
          CollateralFilterOptions.Custom,
          networkConfig.getTokens().map((token: Token) => token.address.toLowerCase())
        )
      },
      value: CollateralFilterOptions.Custom,
    },
  ]

  return (
    <Wrapper {...restProps}>
      <FilterTitle>Collateral</FilterTitle>
      <FilterDropdown
        currentItem={tokenItems.findIndex((tokenItem) => tokenItem.value === value)}
        dropdownButtonContent={
          <ButtonSelectLight
            content={tokenItems.filter((tokenItem) => tokenItem.value === value)[0].content}
          />
        }
        dropdownPosition={DropdownPosition.center}
        items={tokenItems.map((tokenItem, index) => (
          <DropdownItem key={index} onClick={tokenItem.onClick}>
            {tokenItem.content}
          </DropdownItem>
        ))}
      />
    </Wrapper>
  )
}
