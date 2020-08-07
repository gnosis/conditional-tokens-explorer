import React, { useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'

import { Token } from '../../util/types'

import { SplitPositionFormMethods } from './Form'

interface Props {
  splitFromCollateral: boolean
  formMethods: FormContextValues<SplitPositionFormMethods>
  tokens: Token[]
  onCollateralChange: (c: string) => void
}
export const SelectCollateral = ({
  formMethods: { register, watch },
  onCollateralChange,
  splitFromCollateral,
  tokens,
}: Props) => {
  const watchCollateral = watch('collateral')
  useEffect(() => {
    onCollateralChange(watchCollateral)
  }, [watchCollateral, onCollateralChange])

  return (
    <div>
      <input name="splitFrom" ref={register} type="radio" value="collateral" />

      <label htmlFor="collateral">Collateral</label>
      <select
        disabled={!splitFromCollateral}
        name="collateral"
        ref={register({ required: splitFromCollateral })}
      >
        {tokens.map(({ address, symbol }) => {
          return (
            <option key={address} value={address}>
              {symbol}
            </option>
          )
        })}
      </select>
    </div>
  )
}
