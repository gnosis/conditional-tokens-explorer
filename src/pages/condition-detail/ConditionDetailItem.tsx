import React, { useEffect, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import {
  formatDate,
  getConditionTypeTitle,
  isContract,
  truncateStringInTheMiddle,
} from '../../util/tools'
import { useQuestion } from '../../hooks/useQuestion'
import { INFORMATION_NOT_AVAILABLE } from '../../config/constants'
import { getKnowOracleFromAddress } from '../../config/networkConfig'
import { useWeb3Context } from '../../contexts/Web3Context'
import { Provider } from 'ethers/providers'
import { ConditionStatus, ConditionType } from '../../util/types'

interface ConditionDetailItemProps {
  conditionId: string
  resolved: boolean
  questionId: string
  oracle: string
  creator: string
  outcomeSlotCount: number
}

export const ConditionDetailItem = (props: ConditionDetailItemProps) => {
  const { status } = useWeb3Context()
  const { conditionId, resolved, questionId, oracle, outcomeSlotCount, creator } = props

  let networkId = null
  if (status._type === 'connected') {
    const { networkConfig } = status
    networkId = networkConfig.networkId
  }

  const { question, loading } = useQuestion(questionId)
  const [isAContract, setIsAContract] = useState(false)

  const {
    templateId = null,
    resolution = null,
    title = INFORMATION_NOT_AVAILABLE,
    category = INFORMATION_NOT_AVAILABLE,
    outcomes = Array.from(Array(outcomeSlotCount), (_, i) => i + 1 + ''),
  } = question ?? {}

  // We check if the owner is a contract, if is a contract is from Safe, and Omen use safe, we can say the origin is from omen, maybe we can improve this in the future
  useEffect(() => {
    if (status._type === 'connected') {
      const { provider } = status

      const checkIfThisConditionIsFromOmen = async (provider: Provider, address: string) => {
        const isReallyAContract = await isContract(provider, address)

        setIsAContract(isReallyAContract)
      }

      checkIfThisConditionIsFromOmen(provider, creator)
    }
  }, [creator, status])

  const isFromOmen =
    isAContract ||
    !!question ||
    (networkId && getKnowOracleFromAddress(networkId, oracle) === 'realitio')

  return (
    <>
      {loading && <div>Loading...</div>}
      {!loading && (
        <>
          <div className="row">
            <label>Condition Type</label>{' '}
            <label>{isFromOmen ? ConditionType.Omen : ConditionType.Unknown}</label>
            <button>Actions</button>
          </div>
          <div className="row">
            <label>Condition Id</label>{' '}
            <label title={conditionId}>{truncateStringInTheMiddle(conditionId, 6, 6)}</label>
            <CopyToClipboard text={conditionId}>
              <button>Copy</button>
            </CopyToClipboard>
          </div>
          <div className="row">
            <label>Status</label>{' '}
            <label>{resolved ? ConditionStatus.Resolved : ConditionStatus.Open}</label>
          </div>
          <div className="row">
            <label>Condition Type:</label> <label>{getConditionTypeTitle(templateId)}</label>
          </div>
          <div className="row">
            <label>Question:</label> <label>{title}</label>
          </div>
          <div className="row">
            <label>Outcomes:</label>
            <ul>
              {outcomes.map((outcome: string, index: number) => (
                <li key={index}>{outcome}</li>
              ))}
            </ul>
          </div>
          <div className="row">
            <label>Resolution Date:</label>{' '}
            <label>{(resolution && formatDate(resolution)) || INFORMATION_NOT_AVAILABLE}</label>
          </div>
          <div className="row">
            <label>Category:</label> <label>{category}</label>
          </div>
          <div className="row">
            <label>Oracle</label>{' '}
            <label title={oracle}>
              {(networkId && getKnowOracleFromAddress(networkId, oracle)) ||
                truncateStringInTheMiddle(oracle, 6, 6)}
            </label>
          </div>
        </>
      )}
    </>
  )
}
