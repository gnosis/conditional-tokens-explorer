import React, { useState, useEffect, useCallback } from 'react'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { BigNumber } from 'ethers/utils'
import { useAllowance } from '../../hooks/useAllowance'
import { Remote } from '../../util/remoteData'
import { constants } from 'ethers'
import { SplitCondition } from './index'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { getLogger } from '../../util/logger'

const logger = getLogger('SplitCondition')

export const SplitConditionContainer = () => {
  const { networkConfig, CTService } = useWeb3Connected()
  const tokens = networkConfig.getTokens()
  const [collateralToken, setCollateralToken] = useState(tokens[0].address)
  const { refresh, unlock } = useAllowance(collateralToken)
  const [allowance, setAllowance] = useState<Remote<BigNumber>>(Remote.notAsked<BigNumber>())
  const [hasUnlockedCollateral, setHasUnlockedCollateral] = useState(false)

  const unlockCollateral = useCallback(async () => {
    setAllowance(Remote.loading())
    try {
      const tx = await unlock()
      await tx.wait()
      setAllowance(Remote.success(constants.MaxUint256))
    } catch (e) {
      setAllowance(Remote.failure(e))
    } finally {
      setHasUnlockedCollateral(true)
    }
  }, [unlock])

  const fetchAllowance = useCallback(async () => {
    try {
      const allowance = await refresh()
      setAllowance(Remote.success(allowance))
    } catch (e) {
      setAllowance(Remote.failure(e))
    }
  }, [refresh])

  useEffect(() => {
    fetchAllowance()
  }, [fetchAllowance])

  useEffect(() => {
    setHasUnlockedCollateral(false)
  }, [collateralToken])

  const splitPosition = useCallback(
    async (
      collateral: string,
      parentCollection: string,
      conditionId: string,
      partition: BigNumber[],
      amount: BigNumber
    ) => {
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

      const tx = await CTService.splitPosition(
        collateral,
        parentCollection,
        conditionId,
        partition,
        amount
      )

      try {
        await tx.wait()
      } catch (e) {
        logger.error(e)
      }
    },
    [CTService, collateralToken]
  )

  return (
    <SplitCondition
      allowance={allowance}
      splitPosition={splitPosition}
      unlockCollateral={unlockCollateral}
      onCollateralChange={setCollateralToken}
      hasUnlockedCollateral={hasUnlockedCollateral}
      tokens={tokens}
    />
  )
}
