import React, { useEffect, useMemo, useState } from 'react'

import { ButtonSelect } from 'components/buttons/ButtonSelect'
import { Dropdown, DropdownPosition } from 'components/common/Dropdown'
import { TokenIcon } from 'components/common/TokenIcon'
import { SelectItem } from 'components/form/SelectItem'
import { getLogger } from 'util/logger'
import { Token } from 'util/types'

export interface SelectCollateralProps {
  cleanAllowanceError: () => void
  splitFromCollateral: boolean
  tokens: Token[]
  onCollateralChange: (collateral: string) => void
  collateral: Token
}

const logger = getLogger('SelectCollateral')

export const SelectCollateral = (props: SelectCollateralProps) => {
  const { cleanAllowanceError, collateral, onCollateralChange, tokens, ...restProps } = props
  const [token, setToken] = useState(tokens[0])
  const button = <ButtonSelect content={<TokenIcon token={token} />} />
  const dropdownItems = tokens.map((token: Token) => {
    const { address } = token
    return (
      <SelectItem
        activeItemHighlight={collateral.address.toLowerCase() === address.toLowerCase()}
        content={<TokenIcon token={token} />}
        key={address}
        name="collateral"
        onClick={() => {
          cleanAllowanceError()
          onCollateralChange(address)
        }}
        value={address}
      />
    )
  })

  useEffect(() => {
    const tokenFound = tokens.find(
      (t) => t.address.toLowerCase() === collateral.address.toLowerCase()
    )
    if (tokenFound) {
      setToken(tokenFound)
    } else {
      logger.error('Unknown token', collateral.address)
    }
  }, [tokens, collateral])

  const currentItem = useMemo(
    () =>
      tokens.findIndex((token) => token.address.toLowerCase() === collateral.address.toLowerCase()),
    [tokens, collateral]
  )

  return (
    <Dropdown
      {...restProps}
      currentItem={currentItem}
      dropdownButtonContent={button}
      dropdownPosition={DropdownPosition.center}
      fullWidth
      items={dropdownItems}
    />
  )
}
