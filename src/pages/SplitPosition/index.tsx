import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'

import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { BatchBalanceProvider } from 'contexts/BatchBalanceContext'
import { ConditionProvider } from 'contexts/ConditionContext'
import { MultiPositionsProvider } from 'contexts/MultiPositionsContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useAllowance } from 'hooks/useAllowance'
import { useCollateral } from 'hooks/useCollateral'
import { Form } from 'pages/SplitPosition/Form'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { getLogger } from 'util/logger'

const logger = getLogger('SplitPositionIndex')

export const SplitPosition = () => {
  const { _type: status, CTService, connect, networkConfig } = useWeb3ConnectedOrInfura()

  const tokens = networkConfig.getTokens()
  const [collateral, setCollateral] = useState<string>(tokens[0].address)
  const [isLoading, setIsLoading] = useState(true)
  const allowanceMethods = useAllowance(collateral)
  const { collateral: collateralToken } = useCollateral(collateral)

  const splitPosition = React.useCallback(
    async (
      collateral: string,
      parentCollection: string,
      conditionId: string,
      partition: BigNumber[],
      amount: BigNumber
    ) => {
      if (status === Web3ContextStatus.Connected && collateral) {
        partition.forEach((indexSet) => {
          const collectionId = ConditionalTokensService.getCollectionId(
            parentCollection,
            conditionId,
            indexSet
          )

          const positionId = ConditionalTokensService.getPositionId(collateral, collectionId)
          logger.info(
            `conditionId: ${conditionId} / parentCollection: ${parentCollection} / indexSet: ${indexSet.toString()}`
          )
          logger.info(`Position: ${positionId}`)
        })

        await CTService.splitPosition(collateral, parentCollection, conditionId, partition, amount)
      } else {
        connect()
      }
    },
    [status, CTService, connect]
  )

  useEffect(() => {
    if (collateralToken) {
      setIsLoading(false)
    }
  }, [collateralToken])

  return (
    <ConditionProvider>
      <PageTitle>Split Position</PageTitle>
      {isLoading && <InlineLoading />}
      {collateralToken && !isLoading && (
        <MultiPositionsProvider>
          <BatchBalanceProvider checkForEmptyBalance={true}>
            <Form
              allowanceMethods={allowanceMethods}
              collateral={collateralToken}
              onCollateralChange={setCollateral}
              splitPosition={splitPosition}
              tokens={tokens}
            />
          </BatchBalanceProvider>
        </MultiPositionsProvider>
      )}
    </ConditionProvider>
  )
}
