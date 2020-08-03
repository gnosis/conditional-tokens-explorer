import { constants } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useState } from 'react'
import { ConditionalTokensService } from 'services/conditionalTokens'

import { useWeb3Connected } from '../../contexts/Web3Context'
import { useAllowance } from '../../hooks/useAllowance'
import { getLogger } from '../../util/logger'
import { Remote } from '../../util/remoteData'

import { SplitCondition } from './index'

const logger = getLogger('SplitCondition')

export const SplitConditionContainer = () => {
  const { CTService, networkConfig } = useWeb3Connected()
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
      hasUnlockedCollateral={hasUnlockedCollateral}
      onCollateralChange={setCollateralToken}
      splitPosition={splitPosition}
      tokens={tokens}
      unlockCollateral={unlockCollateral}
    />
  )
}
