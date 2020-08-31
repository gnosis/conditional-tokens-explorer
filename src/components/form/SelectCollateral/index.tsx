import React, { useEffect, useState } from 'react'
import { FormContextValues } from 'react-hook-form'

import { SplitPositionFormMethods } from '../../../pages/SplitPosition/Form'
import { getLogger } from '../../../util/logger'
import { Token } from '../../../util/types'
import { ButtonSelect } from '../../buttons/ButtonSelect'
import { Dropdown, DropdownPosition } from '../../common/Dropdown'
import { TokenIcon } from '../../common/TokenIcon'
import { SelectItem } from '../../form/SelectItem'

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
  const [collateral, setCollateral] = useState(tokens[0].symbol)
  const button = <ButtonSelect content={<TokenIcon symbol={collateral} />} />
  const dropdownItems = tokens.map(({ address, symbol }) => {
    return (
      <SelectItem
        content={<TokenIcon symbol={symbol} />}
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
    const token = tokens.find((t) => t.address === watchCollateral)
    if (token) {
      setCollateral(token.symbol)
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
