import React, { useState, useEffect } from 'react'
import { FormContextValues, Controller } from 'react-hook-form'
import { SplitPositionForm, SplitFrom } from './SplitCondition'
import { Token } from 'config/networkConfig'
import { BigNumberInputWrapper } from 'components/common/BigNumberInputWrapper'
import { ZERO_BN } from 'config/constants'
import { BigNumber } from 'ethers/utils'
import { ERC20Service } from 'services/erc20'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { formatBigNumber } from 'util/tools'
import { Signer } from 'ethers'
import { JsonRpcProvider } from 'ethers/providers'

interface Props {
  collateral: Token
  positionId: string
  formMethods: FormContextValues<SplitPositionForm>
  splitFrom: SplitFrom
  ctService: ConditionalTokensService
  signer: Signer
  provider: JsonRpcProvider
  address: string
}
export const InputAmount = ({
  collateral,
  positionId,
  formMethods: { setValue, control },
  splitFrom,
  ctService,
  signer,
  provider,
  address,
}: Props) => {
  const [balance, setBalance] = useState<Maybe<BigNumber>>(null)

  useEffect(() => {
    setValue('amount', ZERO_BN)
  }, [collateral, positionId, setValue])

  useEffect(() => {
    let isSubscribed = true
    const fetchBalance = async () => {
      if (splitFrom === 'position') {
        const balance = await ctService.balanceOf(positionId)
        if (isSubscribed) {
          setBalance(balance)
        }
      } else if (splitFrom === 'collateral') {
        const erc20Service = new ERC20Service(provider, signer, collateral.address)
        const balance = await erc20Service.balanceOf(address)
        if (isSubscribed) {
          setBalance(balance)
        }
      }
    }

    fetchBalance()

    return () => {
      isSubscribed = false
    }
  }, [positionId, collateral, splitFrom, ctService, provider, signer, address])

  return (
    <div>
      <label htmlFor="amount">Amount</label>

      <Controller
        name="amount"
        rules={{ required: true, validate: (amount) => amount.gt(ZERO_BN) }}
        control={control}
        decimals={collateral.decimals}
        as={BigNumberInputWrapper}
      />
      {balance && (
        <button onClick={() => setValue('amount', balance)}>{`Wallet Balance ${formatBigNumber(
          balance,
          collateral.decimals
        )}`}</button>
      )}
    </div>
  )
}
