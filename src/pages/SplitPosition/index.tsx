import { BigNumber } from 'ethers/utils'
import React, { useCallback, useState } from 'react'
import { ConditionalTokensService } from 'services/conditionalTokens'

import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { getLogger } from '../../util/logger'

import { Form } from './Form'

const logger = getLogger('Form')

export const SplitPosition = () => {
  const { CTService, networkConfig } = useWeb3Connected()
  const tokens = networkConfig.getTokens()
  const [collateralToken, setCollateralToken] = useState(tokens[0].address)

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
    <>
      <PageTitle>Split Position</PageTitle>
      <Form onCollateralChange={setCollateralToken} splitPosition={splitPosition} tokens={tokens} />
    </>
  )
}
