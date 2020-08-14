import { Remote } from 'util/remoteData'

import { constants } from 'ethers'
import { BigNumber } from 'ethers/utils'
import { useCallback, useEffect, useState } from 'react'

import { useAllowance } from './useAllowance'

/**
 * Return the state related to allowance permission given a collateral token
 * and an amount.
 *
 */
export const useAllowanceState = (collateralToken: string, amount: BigNumber) => {
  const { refresh, unlock } = useAllowance(collateralToken)
  const [allowance, setAllowance] = useState<Remote<BigNumber>>(Remote.notAsked<BigNumber>())
  const [hasUnlockedCollateral, setHasUnlockedCollateral] = useState(false)
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const [showAskAllowance, setShowAskAllowance] = useState(true)

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

  useEffect(() => {
    const hasEnoughAllowance = allowance.map(
      (allowance) => allowance.gte(amount) && !allowance.isZero()
    )
    const notEnoughAllowance = hasEnoughAllowance.hasData() && !hasEnoughAllowance.get()
    setAllowanceFinished(hasEnoughAllowance.getOr(false) && hasUnlockedCollateral)

    // We show the allowance component if
    // - *We know* that the user doesn't have enough allowance
    // - The user just unlocked his collateral
    // - allowance is loading
    setShowAskAllowance(notEnoughAllowance || hasUnlockedCollateral || allowance.isLoading())
  }, [allowance, amount, hasUnlockedCollateral])

  return {
    fetching: allowance.isLoading(),
    unlockCollateral: unlockCollateral,
    showAskAllowance: showAskAllowance,
    allowanceFinished: allowanceFinished,
  }
}
