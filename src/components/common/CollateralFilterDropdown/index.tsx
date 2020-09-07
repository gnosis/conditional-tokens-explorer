import React from 'react'

import { ButtonSelectLight } from 'components/buttons/ButtonSelectLight'
import { Dropdown, DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { TokenIcon } from 'components/common/TokenIcon'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { CollateralFilterOptions, Token } from 'util/types'

interface Props {
  onClick: (symbol: string, address: string) => void
  value: string
}

export const CollateralFilterDropdown = ({ onClick, value }: Props) => {
  const { networkConfig } = useWeb3ConnectedOrInfura()
  const tokensList = networkConfig
    ? [
        ...networkConfig.getTokens().map((token: Token) => {
          return {
            content: <TokenIcon symbol={token.symbol} />,
            onClick: () => {
              onClick(token.symbol, token.address)
            },
            value: token.symbol,
          }
        }),
      ]
    : []

  const tokenItems = [
    {
      content: 'All Collaterals',
      onClick: () => {
        onClick(CollateralFilterOptions.All, '')
      },
      value: CollateralFilterOptions.All,
    },
    ...tokensList,
  ]

  return (
    <Dropdown
      currentItem={tokenItems.findIndex((tokenItem) => tokenItem.value === value)}
      dropdownButtonContent={
        <ButtonSelectLight
          content={tokenItems.filter((tokenItem) => tokenItem.value === value)[0].content}
        />
      }
      dropdownPosition={DropdownPosition.right}
      items={tokenItems.map((tokenItem, index) => (
        <DropdownItem key={index} onClick={tokenItem.onClick}>
          {tokenItem.content}
        </DropdownItem>
      ))}
    />
  )
}
