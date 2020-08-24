import { BigNumber } from 'ethers/utils'
import { useAllowance } from 'hooks/useAllowance'
import React from 'react'
import { ConditionalTokensService } from 'services/conditionalTokens'

import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { Web3ContextStatus, useWeb3Context } from '../../contexts/Web3Context'
import { getLogger } from '../../util/logger'
import { Token } from '../../util/types'

import { Form } from './Form'

const logger = getLogger('Form')

export const SplitPosition = () => {
  const { connect, status } = useWeb3Context()

  const [collateralToken, setCollateralToken] = React.useState<string>('')
  const [tokens, setTokens] = React.useState<Token[]>([])
  const allowanceMethods = useAllowance(collateralToken)

  React.useEffect(() => {
    if (status._type === Web3ContextStatus.Infura || status._type === Web3ContextStatus.Connected) {
      const { networkConfig } = status
      const tokens = networkConfig.getTokens()

      setCollateralToken(tokens[0].address)
      setTokens(tokens)
    }
  }, [status])

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
          allowanceMethods={allowanceMethods}
          onCollateralChange={setCollateralToken}
          splitPosition={splitPosition}
          tokens={tokens}
        />
      )}
    </>
  )
}
