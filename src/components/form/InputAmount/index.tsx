import { InfuraProvider, JsonRpcSigner, Web3Provider } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { Controller, FormContextValues } from 'react-hook-form'

import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { TitleControlButton } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { ZERO_BN } from 'config/constants'
import { useBatchBalanceContext } from 'contexts/BatchBalanceContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useWithToken } from 'hooks/useWithToken'
import { SplitFrom, SplitPositionFormMethods } from 'pages/SplitPosition/Form'
import { ERC20Service } from 'services/erc20'
import { GetMultiPositions_positions } from 'types/generatedGQLForCTE'
import { formatBigNumber } from 'util/tools'
import { SplitFromType, Token } from 'util/types'

interface Props {
  collateral: Token
  formMethods: FormContextValues<SplitPositionFormMethods>
  positionId: string
  splitFrom: SplitFrom
}

const canSetPositionBalance = (
  positionsLoading: boolean,
  balancesLoading: boolean,
  positions: GetMultiPositions_positions[],
  balances: BigNumber[],
  positionIds: string[]
) => {
  return (
    !positionsLoading &&
    !balancesLoading &&
    positions.length &&
    balances.length &&
    balances.length === positionIds.length &&
    positions.length === positionIds.length &&
    JSON.stringify(positions.map(({ id }) => id).sort()) === JSON.stringify([...positionIds].sort())
  )
}

const fetchBalance = (
  provider: Web3Provider | InfuraProvider,
  signer: JsonRpcSigner,
  tokenAddress: string,
  walletAddress: string
) => {
  const erc20Service = new ERC20Service(provider, tokenAddress, signer)
  return erc20Service.balanceOf(walletAddress)
}

export const InputAmount = ({
  collateral,
  formMethods: { control, setValue },
  positionId,
  splitFrom,
}: Props) => {
  const { _type: status, address, networkConfig, provider, signer } = useWeb3ConnectedOrInfura()
  const { loading: positionsLoading, positionIds, positions } = useMultiPositionsContext()
  const { data: positionsWithToken } = useWithToken(positions)

  const { balances, loading: balancesLoading } = useBatchBalanceContext()

  const [balance, setBalance] = useState<Maybe<BigNumber>>(null)
  const [decimals, setDecimals] = useState(0)

  useEffect(() => {
    setValue('amount', ZERO_BN, true)
  }, [collateral, positionId, setValue, splitFrom])

  useEffect(() => {
    if (splitFrom === SplitFromType.position) {
      if (
        canSetPositionBalance(
          positionsLoading,
          balancesLoading,
          positionsWithToken,
          balances,
          positionIds
        )
      ) {
        setDecimals(positionsWithToken[0].token.decimals)
        setBalance(balances[0])
      } else {
        setBalance(ZERO_BN)
      }
    }
  }, [
    splitFrom,
    balances,
    positionIds,
    positionsLoading,
    balancesLoading,
    positions,
    networkConfig,
    positionsWithToken,
  ])

  useEffect(() => {
    let cancelled = false

    if (splitFrom === SplitFromType.collateral && signer && address) {
      fetchBalance(provider, signer, collateral.address, address).then((result) => {
        if (!cancelled) {
          setDecimals(collateral.decimals)
          setBalance(result)
        }
      })
    }

    return () => {
      cancelled = true
    }
  }, [splitFrom, provider, signer, collateral, address])

  const tokenSymbol = useMemo(
    () => (splitFrom === SplitFromType.collateral ? collateral.symbol : ''),
    [splitFrom, collateral]
  )

  const isDisconnected = status !== Web3ContextStatus.Connected
  const placeholder = isDisconnected
    ? 'Please connect to your wallet...'
    : balance && balance.isZero()
    ? 'Please add funds to your wallet...'
    : '0.00'

  return (
    <TitleValue
      title="Amount"
      titleControl={
        isDisconnected || !balance ? (
          <TitleControlButton disabled>Not Connected To Wallet</TitleControlButton>
        ) : (
          balance && (
            <TitleControlButton
              disabled={balance.isZero()}
              onClick={() => setValue('amount', balance, true)}
            >
              Use Wallet Balance ${formatBigNumber(balance, decimals)})
            </TitleControlButton>
          )
        )
      }
      value={
        <Controller
          as={BigNumberInputWrapper}
          control={control}
          decimals={decimals}
          disabled={isDisconnected || (balance && balance.isZero()) || false}
          max={(balance && balance.toString()) || undefined}
          name="amount"
          placeholder={placeholder}
          rules={{ required: true, validate: (amount) => amount.gt(ZERO_BN) }}
          tokenSymbol={tokenSymbol}
        />
      }
    />
  )
}
