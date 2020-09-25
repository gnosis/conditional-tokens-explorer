import React, { useEffect, useState } from 'react'
import { FormContextValues } from 'react-hook-form'

import { ButtonSelect } from 'components/buttons/ButtonSelect'
import { Dropdown, DropdownPosition } from 'components/common/Dropdown'
import { TokenIcon } from 'components/common/TokenIcon'
import { SelectItem } from 'components/form/SelectItem'
import { SplitPositionFormMethods } from 'pages/SplitPosition/Form'
import { getLogger } from 'util/logger'
import { Token } from 'util/types'

export interface SelectCollateralProps {
  formMethods: FormContextValues<SplitPositionFormMethods>
  splitFromCollateral: boolean
  tokens: Token[]
}

const logger = getLogger('SelectCollateral')

export const SelectCollateral = ({
  formMethods,
  splitFromCollateral,
  tokens,
  ...restProps
}: SelectCollateralProps) => {
  const { register, setValue, watch } = formMethods
  const watchCollateral = watch('collateral')
  const [token, setToken] = useState(tokens[0])
  const button = <ButtonSelect content={<TokenIcon token={token} />} />
  const dropdownItems = tokens.map((token: Token) => {
    const { address } = token
    return (
      <SelectItem
        content={<TokenIcon token={token} />}
        key={address}
        name="collateral"
        onClick={() => {
          setValue('collateral', address, true)
        }}
        radioRef={register({ required: splitFromCollateral })}
        value={address}
      />
    )
  })

  useEffect(() => {
    const tokenFound = tokens.find((t) => t.address === watchCollateral)
    if (tokenFound) {
      setToken(tokenFound)
    } else {
      logger.error('Unknown token', watchCollateral)
    }
  }, [tokens, watchCollateral])

  return (
    <Dropdown
      {...restProps}
      dropdownButtonContent={button}
      dropdownPosition={DropdownPosition.center}
      fullWidth
      items={dropdownItems}
    />
  )
}
