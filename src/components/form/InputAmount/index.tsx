import { formatBigNumber } from 'util/tools'

import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { ZERO_BN } from 'config/constants'
import { useBatchBalanceContext } from 'contexts/BatchBalanceContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { InfuraProvider, JsonRpcSigner, Web3Provider } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { Controller, FormContextValues } from 'react-hook-form'
import { ERC20Service } from 'services/erc20'
import { GetMultiPositions_positions } from 'types/generatedGQL'

import { useWeb3ConnectedOrInfura } from '../../../contexts/Web3Context'
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
  const erc20Service = new ERC20Service(provider, signer, tokenAddress)
  return erc20Service.balanceOf(walletAddress)
}

export const InputAmount = ({
  collateral,
  formMethods: { control, setValue },
  positionId,
  splitFrom,
}: Props) => {
  const { address, networkConfig, provider, signer } = useWeb3ConnectedOrInfura()
  const { loading: positionsLoading, positionIds, positions } = useMultiPositionsContext()

  const { balances, loading: balancesLoading } = useBatchBalanceContext()

  const [balance, setBalance] = useState<Maybe<BigNumber>>(null)
  const [decimals, setDecimals] = useState(0)

  useEffect(() => {
    setValue('amount', ZERO_BN)
  }, [collateral, positionId, setValue])

  useEffect(() => {
    if (
      splitFrom === 'position' &&
      canSetPositionBalance(positionsLoading, balancesLoading, positions, balances, positionIds)
    ) {
      // FIXME - this only works with non custom tokens
      setDecimals(networkConfig.getTokenFromAddress(positions[0].collateralToken.id).decimals)
      setBalance(balances[0])
    }
  }, [
    splitFrom,
    balances,
    positionIds,
    positionsLoading,
    balancesLoading,
    positions,
    networkConfig,
  ])

  useEffect(() => {
    if (splitFrom === 'collateral' && signer && address) {
      fetchBalance(provider, signer, collateral.address, address).then((result) => {
        setDecimals(collateral.decimals)
        setBalance(result)
      })
    }
  }, [splitFrom, provider, signer, collateral, address])

  const tokenSymbol = useMemo(() => (splitFrom === 'collateral' ? collateral.symbol : ''), [
    splitFrom,
    collateral,
  ])

  return (
    <TitleValue
      title="Amount"
      titleControl={
        balance && (
          <TitleControlButton
            disabled={balance.isZero()}
            onClick={() => setValue('amount', balance, true)}
          >
            Use Wallet Balance (${formatBigNumber(balance, decimals)})
          </TitleControlButton>
        )
      }
      value={
        <Controller
          as={BigNumberInputWrapper}
          control={control}
          decimals={decimals}
          disabled={(balance && balance.isZero()) || false}
          name="amount"
          placeholder={balance && balance.isZero() ? 'Please add funds to your wallet...' : '0.00'}
          rules={{ required: true, validate: (amount) => amount.gt(ZERO_BN) }}
          tokenSymbol={tokenSymbol}
        />
      }
    />
  )
}
