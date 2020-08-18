import { constants } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React from 'react'
import { ConditionalTokensService } from 'services/conditionalTokens'

import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { Web3ContextStatus, useWeb3Context } from '../../contexts/Web3Context'
import { useAllowance } from '../../hooks/useAllowance'
import { getLogger } from '../../util/logger'
import { Remote } from '../../util/remoteData'
import { Token } from '../../util/types'

import { Form } from './Form'

const logger = getLogger('Form')

export const SplitPosition = () => {
  const { connect, status } = useWeb3Context()

  const [collateralToken, setCollateralToken] = React.useState<string>('')
  const [tokens, setTokens] = React.useState<Token[]>([])
  const [allowance, setAllowance] = React.useState<Remote<BigNumber>>(Remote.notAsked<BigNumber>())
  const [hasUnlockedCollateral, setHasUnlockedCollateral] = React.useState(false)

  React.useEffect(() => {
    if (status._type === Web3ContextStatus.Infura || status._type === Web3ContextStatus.Connected) {
      const { networkConfig } = status
      const tokens = networkConfig.getTokens()

      setCollateralToken(tokens[0].address)
      setTokens(tokens)
    }
  }, [status])

  const { refresh, unlock } = useAllowance(collateralToken)

  const unlockCollateral = React.useCallback(async () => {
    setAllowance(Remote.loading())
    try {
      await unlock()
      setAllowance(Remote.success(constants.MaxUint256))
    } catch (e) {
      setAllowance(Remote.failure(e))
    } finally {
      setHasUnlockedCollateral(true)
    }
  }, [unlock])

  const fetchAllowance = React.useCallback(async () => {
    try {
      const allowance = await refresh()
      if (allowance) setAllowance(Remote.success(allowance))
    } catch (e) {
      setAllowance(Remote.failure(e))
    }
  }, [refresh])

  React.useEffect(() => {
    fetchAllowance()
  }, [fetchAllowance])

  React.useEffect(() => {
    // TODO: I think this is probably wrong, why set the unlocked collateral to false if the collateralToken changed ? doesn't make sense
    setHasUnlockedCollateral(false)
  }, [collateralToken])

  const splitPosition = React.useCallback(
    async (
      collateral: string,
      parentCollection: string,
      conditionId: string,
      partition: BigNumber[],
      amount: BigNumber
    ) => {
      if (status._type === Web3ContextStatus.Connected) {
        const { CTService } = status

        partition.forEach((indexSet) => {
          const collectionId = ConditionalTokensService.getCollectionId(
            parentCollection,
            conditionId,
            indexSet
          )

          const positionId = ConditionalTokensService.getPositionId(collateralToken, collectionId)
          logger.info(
            `conditionId: ${conditionId} / parentCollection: ${parentCollection} / indexSet: ${indexSet.toString()}`
          )
          logger.info(`Position: ${positionId}`)
        })

        try {
          await CTService.splitPosition(
            collateral,
            parentCollection,
            conditionId,
            partition,
            amount
          )
        } catch (e) {
          logger.error(e)
        }
      } else {
        connect()
      }
    },
    [status, connect, collateralToken]
  )

  return (
    <>
      <PageTitle>Split Position</PageTitle>
      {tokens.length > 0 && (
        <Form
          allowance={allowance}
          hasUnlockedCollateral={hasUnlockedCollateral}
          onCollateralChange={setCollateralToken}
          splitPosition={splitPosition}
          tokens={tokens}
          unlockCollateral={unlockCollateral}
        />
      )}
    </>
  )
}
