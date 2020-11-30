import { InfuraProvider, JsonRpcSigner, Web3Provider } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'

import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { TitleControlButton } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { ZERO_BN } from 'config/constants'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { PositionWithUserBalanceWithDecimals } from 'hooks/usePositionsList'
import { SplitFrom } from 'pages/SplitPosition/Form'
import { ERC20Service } from 'services/erc20'
import { formatBigNumber } from 'util/tools'
import { SplitFromType, Token } from 'util/types'

interface Props {
  collateral: Token
  position: Maybe<PositionWithUserBalanceWithDecimals>
  splitFrom: SplitFrom
  onAmountChange: (value: BigNumber) => void
  amount: BigNumber
}

const fetchBalanceERC20 = (
  provider: Web3Provider | InfuraProvider,
  signer: JsonRpcSigner,
  tokenAddress: string,
  walletAddress: string
) => {
  const erc20Service = new ERC20Service(provider, tokenAddress, signer)
  return erc20Service.balanceOf(walletAddress)
}

export const InputAmount = (props: Props) => {
  const { amount, collateral, onAmountChange, position, splitFrom } = props

  const { _type: status, CTService, address, provider, signer } = useWeb3ConnectedOrInfura()
  const [balance, setBalance] = useState<Maybe<BigNumber>>(null)
  const [decimals, setDecimals] = useState(0)

  useEffect(() => {
    onAmountChange(ZERO_BN)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collateral, position, splitFrom])

  useEffect(() => {
    let cancelled = false

    if (splitFrom === SplitFromType.collateral && signer && address) {
      fetchBalanceERC20(provider, signer, collateral.address, address).then((result) => {
        if (!cancelled) {
          setDecimals(collateral.decimals)
          setBalance(result)
        }
      })
    } else if (splitFrom === SplitFromType.position && signer && address && position) {
      CTService.balanceOf(position.id).then((result) => {
        if (!cancelled) {
          setDecimals(+position.token.decimals)
          setBalance(result)
        }
      })
    } else {
      setDecimals(18)
      setBalance(null)
    }

    return () => {
      cancelled = true
    }
  }, [splitFrom, provider, signer, position, collateral, address, CTService])

  const tokenSymbol = useMemo(
    () => (splitFrom === SplitFromType.collateral ? collateral.symbol : ''),
    [splitFrom, collateral]
  )

  const isDisconnected = useMemo(() => status !== Web3ContextStatus.Connected, [status])

  const placeholder = useMemo(
    () =>
      isDisconnected
        ? 'Please connect to your wallet...'
        : balance && balance.isZero()
        ? 'Please add funds to your wallet...'
        : '0.00',
    [balance, isDisconnected]
  )

  return (
    <TitleValue
      title="Amount"
      titleControl={
        isDisconnected ? (
          <TitleControlButton disabled>Not Connected To Wallet</TitleControlButton>
        ) : (
          <TitleControlButton
            disabled={!balance || balance.isZero()}
            onClick={() => balance && onAmountChange(balance)}
          >
            Use Wallet Balance ({formatBigNumber(balance || new BigNumber(0), decimals)})
          </TitleControlButton>
        )
      }
      value={
        <BigNumberInputWrapper
          decimals={decimals}
          disabled={isDisconnected || (balance && balance.isZero()) || false}
          max={(balance && balance.toString()) || undefined}
          onChange={onAmountChange}
          placeholder={placeholder}
          tokenSymbol={tokenSymbol}
          value={amount}
        />
      }
    />
  )
}
