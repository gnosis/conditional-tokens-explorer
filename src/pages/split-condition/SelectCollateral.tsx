import React, { useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'
import { SplitPositionForm } from './SplitCondition'

import { Token } from '../../util/types'

interface Props {
  splitFromCollateral: boolean
  formMethods: FormContextValues<SplitPositionForm>
  tokens: Token[]
  onCollateralChange: (c: string) => void
}
export const SelectCollateral = ({
  splitFromCollateral,
  tokens,
  onCollateralChange,
  formMethods: { register, watch },
}: Props) => {
  const watchCollateral = watch('collateral')
  useEffect(() => {
    onCollateralChange(watchCollateral)
  }, [watchCollateral, onCollateralChange])

  return (
    <div>
      <input name="splitFrom" type="radio" value="collateral" ref={register} />

      <label htmlFor="collateral">Collateral</label>
      <select
        ref={register({ required: splitFromCollateral })}
        name="collateral"
        disabled={!splitFromCollateral}
      >
        {tokens.map(({ symbol, address }) => {
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
