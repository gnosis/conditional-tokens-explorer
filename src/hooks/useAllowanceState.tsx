import { constants } from 'ethers'
import { TransactionReceipt } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'
import { useCallback, useEffect, useState } from 'react'

import { Remote } from 'util/remoteData'

export type AllowanceMethods = {
  refresh: () => Promise<BigNumber>
  unlock: () => Promise<TransactionReceipt | undefined>
}
/**
 * Return the state related to allowance permission given a pair of allowance methods
 * and an amount.
 *
 */
export const useAllowanceState = (allowanceMethods: AllowanceMethods, amount: BigNumber) => {
  const { refresh, unlock } = allowanceMethods
  const [allowance, setAllowance] = useState<Remote<BigNumber>>(Remote.notAsked<BigNumber>())
  const [hasUnlockedCollateral, setHasUnlockedCollateral] = useState(false)
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const [shouldDisplayAllowance, setShouldDisplayAllowance] = useState(true)
  const [allowanceError, setAllowanceError] = useState<Maybe<Error>>(null)

  const unlockCollateral = useCallback(async () => {
    setAllowance(Remote.loading())
    try {
      await unlock()
      setAllowance(Remote.success(constants.MaxUint256))
    } catch (e) {
      setAllowance(Remote.failure(e))
      setAllowanceError(e)
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
  }, [unlock, refresh])

  useEffect(() => {
    const hasEnoughAllowance = allowance.map(
      (allowance) => allowance.gte(amount) && !allowance.isZero()
    )

    const notEnoughAllowance = hasEnoughAllowance.hasData() && !hasEnoughAllowance.get()
    setAllowanceFinished(hasEnoughAllowance.getOr(false))

    // We show the allowance component if
    // - *We know* that the user doesn't have enough allowance
    // - The user just unlocked his collateral
    // - allowance is loading
    setShouldDisplayAllowance(notEnoughAllowance || hasUnlockedCollateral || allowance.isLoading())
  }, [allowance, amount, hasUnlockedCollateral])

  return {
    fetchingAllowance: allowance.isLoading(),
    unlockCollateral,
    shouldDisplayAllowance,
    allowanceFinished,
    allowanceError,
  }
}
