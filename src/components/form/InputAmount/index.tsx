import { formatBigNumber } from 'util/tools'

import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { BYTES_REGEX, ZERO_BN } from 'config/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { Controller, FormContextValues } from 'react-hook-form'
import { ERC20Service } from 'services/erc20'

import { Web3ContextStatus, useWeb3Context } from '../../../contexts/Web3Context'
import { SplitFrom, SplitPositionFormMethods } from '../../../pages/SplitPosition/Form'
import { Token } from '../../../util/types'
import { TitleControlButton } from '../../pureStyledComponents/TitleControl'
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
  const { status } = useWeb3Context()

  const [balance, setBalance] = useState<Maybe<BigNumber>>(null)
  const regexpPosition: RegExp = BYTES_REGEX

  useEffect(() => {
    setValue('amount', ZERO_BN)
  }, [collateral, positionId, setValue])

  useEffect(() => {
    let isSubscribed = true
    if (status._type === Web3ContextStatus.Connected) {
      const { CTService, address, provider, signer } = status

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
    }

    return () => {
      isSubscribed = false
    }
  }, [status, positionId, collateral, splitFrom, regexpPosition])

  return (
    <TitleValue
      title="Amount"
      titleControl={
        balance && (
          <TitleControlButton
            disabled={balance.isZero()}
            onClick={() => setValue('amount', balance)}
          >
            Use Wallet Balance (${formatBigNumber(balance, collateral.decimals)})
          </TitleControlButton>
        )
      }
      value={
        <Controller
          as={BigNumberInputWrapper}
          control={control}
          decimals={collateral.decimals}
          disabled={(balance && balance.isZero()) || false}
          name="amount"
          placeholder={balance && balance.isZero() ? 'Please add funds to your wallet...' : '0.00'}
          rules={{ required: true, validate: (amount) => amount.gt(ZERO_BN) }}
          tokenSymbol={collateral.symbol}
        />
      }
    />
  )
}
