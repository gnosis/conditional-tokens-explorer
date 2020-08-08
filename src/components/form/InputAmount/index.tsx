import { formatBigNumber } from 'util/tools'

import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { BYTES_REGEX, ZERO_BN } from 'config/constants'
import { useWeb3Connected } from 'contexts/Web3Context'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { Controller, FormContextValues } from 'react-hook-form'
import { ERC20Service } from 'services/erc20'

import { SplitFrom, SplitPositionFormMethods } from '../../../pages/SplitPosition/Form'
import { Token } from '../../../util/types'
import { TitleControl } from '../../pureStyledComponents/TitleControl'
import { TitleValue } from '../../text/TitleValue'

interface Props {
  collateral: Token
  formMethods: FormContextValues<SplitPositionFormMethods>
  positionId: string
  splitFrom: SplitFrom
}

export const InputAmount = ({
  collateral,
  formMethods: { control, setValue },
  positionId,
  splitFrom,
}: Props) => {
  const [balance, setBalance] = useState<Maybe<BigNumber>>(null)
  const { CTService, address, provider, signer } = useWeb3Connected()
  const regexpPosition: RegExp = BYTES_REGEX

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
  }, [positionId, collateral, splitFrom, CTService, provider, signer, address, regexpPosition])

  return (
    <TitleValue
      title="Amount"
      titleControl={
        balance && (
          <TitleControl onClick={() => setValue('amount', balance)}>
            Use Wallet Balance (${formatBigNumber(balance, collateral.decimals)})
          </TitleControl>
        )
      }
      value={
        <Controller
          as={BigNumberInputWrapper}
          control={control}
          decimals={collateral.decimals}
          name="amount"
          rules={{ required: true, validate: (amount) => amount.gt(ZERO_BN) }}
          tokenSymbol={collateral.symbol}
        />
      }
    />
  )
}
