import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { formatDate, getConditionTypeTitle, truncateStringInTheMiddle } from '../../util/tools'
import { useQuestion } from '../../hooks/useQuestion'
import { INFORMATION_NOT_AVAILABLE } from '../../config/constants'
import { getKnowOracleFromAddress } from '../../config/networkConfig'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { ConditionStatus, ConditionType } from '../../util/types'
import { useIsConditionFromOmen } from '../../hooks/useIsConditionFromOmen'
import { GetCondition_condition } from '../../types/generatedGQL'

interface ConditionDetailItemProps {
  condition: GetCondition_condition
}

export const ConditionDetailItem = ({ condition }: ConditionDetailItemProps) => {
  const { id: conditionId, resolved, questionId, oracle, outcomeSlotCount, creator } = condition
  const { networkConfig } = useWeb3Connected()

  const { question, loading: loadingQuestion, outcomesPrettier } = useQuestion(questionId, outcomeSlotCount)

  const { isConditionFromOmen, loading: loadingIsConditionFromOmen } = useIsConditionFromOmen(
    creator,
    oracle,
    question
  )

  const {
    templateId = null,
    resolution = null,
    title = INFORMATION_NOT_AVAILABLE,
    category = INFORMATION_NOT_AVAILABLE,
  } = question ?? {}


  const loading = loadingQuestion || loadingIsConditionFromOmen
  return (
    <>
      {loading && <div>Loading...</div>}
      {!loading && (
        <>
          <div className="row">
            <label>Condition Type</label>{' '}
            <label>{isConditionFromOmen ? ConditionType.Omen : ConditionType.Unknown}</label>
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
              {outcomesPrettier.map((outcome: string, index: number) => (
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
              {getKnowOracleFromAddress(networkConfig.networkId, oracle) ||
                truncateStringInTheMiddle(oracle, 6, 6)}
            </label>
          </div>
        </>
      )}
    </>
  )
}
