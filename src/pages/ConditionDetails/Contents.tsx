import React from 'react'
import styled from 'styled-components'

import { ButtonCopy } from '../../components/buttons/ButtonCopy'
import { ButtonDropdownCircle } from '../../components/buttons/ButtonDropdownCircle'
import { CenteredCard } from '../../components/common/CenteredCard'
import { Dropdown, DropdownItem, DropdownPosition } from '../../components/common/Dropdown'
import { Pill, PillTypes } from '../../components/pureStyledComponents/Pill'
import { Row } from '../../components/pureStyledComponents/Row'
import { StripedList, StripedListItem } from '../../components/pureStyledComponents/StripedList'
import { TitleValue } from '../../components/text/TitleValue'
import { INFORMATION_NOT_AVAILABLE } from '../../config/constants'
import { getKnowOracleFromAddress } from '../../config/networkConfig'
import { Web3ContextStatus, useWeb3Context } from '../../contexts/Web3Context'
import { useIsConditionFromOmen } from '../../hooks/useIsConditionFromOmen'
import { useQuestion } from '../../hooks/useQuestion'
import { GetCondition_condition } from '../../types/generatedGQL'
import { getLogger } from '../../util/logger'
import { formatTS, getConditionTypeTitle, truncateStringInTheMiddle } from '../../util/tools'
import { ConditionStatus, ConditionType } from '../../util/types'

const StripedListStyled = styled(StripedList)`
  margin-top: 6px;
`

const logger = getLogger('ConditionDetails')

interface Props {
  condition: GetCondition_condition
}

export const Contents: React.FC<Props> = ({ condition }) => {
  const { status } = useWeb3Context()
  const {
    creator,
    id: conditionId,
    oracle,
    outcomeSlotCount,
    questionId,
    resolveTimestamp,
    resolved,
  } = condition
  const dropdownItems = [
    {
      onClick: () => {
        logger.log('Resolve Condition')
      },
      text: 'Resolve Condition',
    },
    {
      onClick: () => {
        logger.log('Split Position')
      },
      text: 'Split Position',
    },
    {
      onClick: () => {
        logger.log('Merge Positions')
      },
      text: 'Merge Positions',
    },
    {
      onClick: () => {
        logger.log('Report Payouts')
      },
      text: 'Report Payouts',
    },
  ]

  let networkId = null
  if (status._type === Web3ContextStatus.Connected || status._type === Web3ContextStatus.Infura) {
    const { networkConfig } = status
    networkId = networkConfig.networkId
  }

  const { outcomesPrettier, question } = useQuestion(questionId, outcomeSlotCount)
  const { isConditionFromOmen } = useIsConditionFromOmen(creator, oracle, question)
  const {
    templateId = null,
    title = INFORMATION_NOT_AVAILABLE,
    category = INFORMATION_NOT_AVAILABLE,
  } = question ?? {}

  const oracleTitle =
    isConditionFromOmen && networkId
      ? getKnowOracleFromAddress(networkId, oracle)
      : truncateStringInTheMiddle(oracle, 8, 6)

  return (
    <CenteredCard
      dropdown={
        <Dropdown
          dropdownButtonContent={<ButtonDropdownCircle />}
          dropdownPosition={DropdownPosition.right}
          items={dropdownItems.map((item, index) => (
            <DropdownItem key={index} onClick={item.onClick}>
              {item.text}
            </DropdownItem>
          ))}
        />
      }
    >
      <Row marginBottomXL>
        <TitleValue
          title="Condition Type"
          value={isConditionFromOmen ? ConditionType.Omen : ConditionType.Custom}
        />
        <TitleValue
          title="Condition Id"
          value={
            <>
              {truncateStringInTheMiddle(conditionId, 8, 6)}
              <ButtonCopy value={conditionId} />
            </>
          }
        />
        <TitleValue
          title="Status"
          value={
            <Pill type={resolved ? PillTypes.primary : PillTypes.open}>
              {resolved ? ConditionStatus.Resolved : ConditionStatus.Open}
            </Pill>
          }
        />
        {isConditionFromOmen && (
          <TitleValue title="Question Type" value={getConditionTypeTitle(templateId)} />
        )}
        <TitleValue
          title="Question Id"
          value={
            <>
              {truncateStringInTheMiddle(questionId, 8, 6)}
              <ButtonCopy value={questionId} />
            </>
          }
        />
      </Row>
      {isConditionFromOmen && (
        <>
          <Row cols="1fr" marginBottomXL>
            <TitleValue title="Question" value={title} />
          </Row>
          <Row cols="1fr" marginBottomXL>
            <TitleValue
              title="Outcomes"
              value={
                <StripedListStyled>
                  {outcomesPrettier.map((outcome: string, index: number) => (
                    <StripedListItem key={index}>{outcome}</StripedListItem>
                  ))}
                </StripedListStyled>
              }
            />
          </Row>
        </>
      )}
      <Row>
        <TitleValue
          title="Resolution Date"
          value={formatTS(resolveTimestamp) || INFORMATION_NOT_AVAILABLE}
        />
        {isConditionFromOmen && <TitleValue title="Category" value={category} />}
        <TitleValue
          title={isConditionFromOmen ? 'Oracle' : 'Reporting Address'}
          value={
            <>
              {oracleTitle}
              <ButtonCopy value={oracle} />
            </>
          }
        />
      </Row>
    </CenteredCard>
  )
}
