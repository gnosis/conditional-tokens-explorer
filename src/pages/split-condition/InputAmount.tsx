import React, { useState, useEffect } from 'react'
import { FormContextValues, Controller } from 'react-hook-form'
import { SplitPositionForm, SplitFrom } from './SplitCondition'
import { Token } from 'config/networkConfig'
import { BigNumberInputWrapper } from 'components/common/BigNumberInputWrapper'
import { ZERO_BN, BYTES_REGEX } from 'config/constants'
import { BigNumber } from 'ethers/utils'
import { ERC20Service } from 'services/erc20'
import { formatBigNumber } from 'util/tools'
import { useWeb3Connected } from 'contexts/Web3Context'

interface Props {
  collateral: Token
  positionId: string
  formMethods: FormContextValues<SplitPositionForm>
  splitFrom: SplitFrom
}
export const InputAmount = ({
  collateral,
  positionId,
  formMethods: { setValue, control },
  splitFrom,
}: Props) => {
  const [balance, setBalance] = useState<Maybe<BigNumber>>(null)

  const { CTService, signer, provider, address } = useWeb3Connected()

  const regexpPosition: RegExp = BYTES_REGEX;

  useEffect(() => {
    setValue('amount', ZERO_BN)
  }, [collateral, positionId, setValue])

  useEffect(() => {
    let isSubscribed = true
    const fetchBalance = async () => {
      if (splitFrom === 'position' && regexpPosition.test(positionId)) {
        const balance = await CTService.balanceOf(positionId)
        if (isSubscribed) {
          setBalance(balance)
        }
      } else if (splitFrom === 'collateral' && provider && signer) {
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
  }, [positionId, collateral, splitFrom, CTService, provider, signer, address])

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
        <button onClick={() => setValue('amount', balance)}>{`Use wallet balance ${formatBigNumber(
          balance,
          collateral.decimals
        )}`}</button>
      )}
    </div>
  )
}
