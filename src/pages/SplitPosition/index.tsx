import { BigNumber } from 'ethers/utils'
import { useAllowance } from 'hooks/useAllowance'
import React from 'react'
import { ConditionalTokensService } from 'services/conditionalTokens'

import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from '../../contexts/Web3Context'
import { getLogger } from '../../util/logger'

import { Form } from './Form'

const logger = getLogger('SplitPositionIndex')

export const SplitPosition = () => {
  const { _type: status, CTService, connect, networkConfig } = useWeb3ConnectedOrInfura()

  const tokens = networkConfig.getTokens()
  const [collateralToken, setCollateralToken] = React.useState<string>(tokens[0].address)
  const allowanceMethods = useAllowance(collateralToken)

  const splitPosition = React.useCallback(
    async (
      collateral: string,
      parentCollection: string,
      conditionId: string,
      partition: BigNumber[],
      amount: BigNumber
    ) => {
      if (status === Web3ContextStatus.Connected) {
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

        await CTService.splitPosition(collateral, parentCollection, conditionId, partition, amount)
      } else {
        connect()
      }
    },
    [status, CTService, connect, collateralToken]
  )

  return (
    <>
      <PageTitle>Split Position</PageTitle>

      <Form
        allowanceMethods={allowanceMethods}
        onCollateralChange={setCollateralToken}
        splitPosition={splitPosition}
        tokens={tokens}
      />
    </>
  )
}
