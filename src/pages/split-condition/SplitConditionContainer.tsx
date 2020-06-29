import React, { useState, useEffect, useCallback } from 'react'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { BigNumber } from 'ethers/utils'
import { useAllowance } from '../../hooks/useAllowance'
import { Remote } from '../../util/remoteData'
import { constants, ethers } from 'ethers'
import { SplitCondition } from './index'
import { ConditionalTokensService } from 'services/conditionalTokens'
// import CTHelpersConstructor from '@gnosis.pm/conditional-tokens-contracts/utils/id-helpers'
// const CTHelpers = CTHelpersConstructor({
//   BN: ethers.utils.BigNumber,
//   toBN: ethers.utils.bigNumberify,
//   soliditySha3: ethers.utils.keccak256,
// })

export const SplitConditionContainer = () => {
  const { networkConfig, provider, CTService } = useWeb3Connected()
  const tokens = networkConfig.getTokens()
  const [collateralToken, setCollateralToken] = useState(tokens[0].address)
  const { refresh, unlock } = useAllowance(collateralToken)
  const [allowance, setAllowance] = useState<Remote<BigNumber>>(Remote.notAsked<BigNumber>())
  const [hasUnlockedCollateral, setHasUnlockedCollateral] = useState(false)

  const unlockCollateral = async () => {
    setAllowance(Remote.loading())
    try {
      const { transactionHash } = await unlock()
      if (transactionHash) {
        await provider.waitForTransaction(transactionHash)
        setAllowance(Remote.success(constants.MaxUint256))
      }
    } catch (e) {
      setAllowance(Remote.failure(e))
    } finally {
      setHasUnlockedCollateral(true)
    }
  }

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

  const splitPosition = async (
    collateral: string,
    parentCollection: string,
    conditionId: string,
    partition: BigNumber[],
    amount: BigNumber
  ) => {
    // console.log(CTHelpers)
    const positions = await Promise.all(
      partition.map(async (indexSet) => {
        const collectionId = await CTService.getCollectionId(
          parentCollection,
          conditionId,
          indexSet
        )
        return ConditionalTokensService.getPositionId(collateralToken, collectionId)
      })
    )
    positions.forEach((pos, index) => console.log(`Position ${index}: ${pos}`))

    const tx = await CTService.splitPosition(
      collateral,
      parentCollection,
      conditionId,
      partition,
      amount
    )

    try {
      await provider.waitForTransaction(tx)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <SplitCondition
      allowance={allowance}
      splitPosition={splitPosition}
      unlockCollateral={unlockCollateral}
      onCollateralChange={(collateral: string) => setCollateralToken(collateral)}
      hasUnlockedCollateral={hasUnlockedCollateral}
      ctService={CTService}
      tokens={tokens}
    ></SplitCondition>
  )
}
