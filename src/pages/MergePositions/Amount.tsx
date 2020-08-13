import { formatBigNumber } from 'util/tools'
import { Token } from 'util/types'

import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { Row } from 'components/pureStyledComponents/Row'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { ZERO_BN } from 'config/constants'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useMemo, useState } from 'react'

interface Props {
  balances: BigNumber[]
  isMergeable: boolean
  collateralToken: Maybe<Token>
}

export const Amount = ({ balances, collateralToken, isMergeable }: Props) => {
  const [amount, setAmount] = useState<BigNumber>(ZERO_BN)
  const balance = useMemo(
    () =>
      isMergeable
        ? balances.reduce((min, balance) => (min.lte(balance) ? min : balance), balances[0])
        : ZERO_BN,
    [balances, isMergeable]
  )
  const decimals = useMemo(() => (collateralToken ? collateralToken.decimals : 0), [
    collateralToken,
  ])

  const amountChangeHandler = useCallback(
    (value: BigNumber) => {
      if (isMergeable && balance.gte(value)) {
        setAmount(value)
      }

      // setAmount(prevAmount => {
      //   console.log(prevAmount, balance, value)
      //   return isMergeable && balance.gte(value) ? value : prevAmount
      // })
    },
    [balance, isMergeable]
  )

  const useWalletHandler = useCallback(() => {
    if (isMergeable && balance.gt(ZERO_BN)) {
      setAmount(balance)
    }
  }, [balance, isMergeable])

  return (
    <Row cols={'1fr'} marginBottomXL>
      <TitleValue
        title="Amount"
        titleControl={
          <TitleControl onClick={useWalletHandler}>
            Use Wallet Balance (${formatBigNumber(balance, decimals)})
          </TitleControl>
        }
        value={
          <BigNumberInputWrapper
            decimals={decimals}
            disabled={!isMergeable}
            onChange={amountChangeHandler}
            value={amount}
          />
        }
      />
    </Row>
  )
}
