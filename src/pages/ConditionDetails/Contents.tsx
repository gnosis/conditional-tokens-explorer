import React from 'react'

import { ButtonCopy } from '../../components/buttons/ButtonCopy'
import { ButtonDropdownCircle } from '../../components/buttons/ButtonDropdownCircle'
import { CenteredCard } from '../../components/common/CenteredCard'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../components/common/Dropdown'
import { StripedList, StripedListItem } from '../../components/common/StripedList'
import { GridTwoColumns } from '../../components/pureStyledComponents/GridTwoColumns'
import { Pill, PillTypes } from '../../components/pureStyledComponents/Pill'
import { TitleValue } from '../../components/text/TitleValue'
import { INFORMATION_NOT_AVAILABLE } from '../../config/constants'
import { getKnowOracleFromAddress } from '../../config/networkConfig'
import { useWeb3Context } from '../../contexts/Web3Context'
import { useIsConditionFromOmen } from '../../hooks/useIsConditionFromOmen'
import { useQuestion } from '../../hooks/useQuestion'
import { GetCondition_condition } from '../../types/generatedGQL'
import { getLogger } from '../../util/logger'
import { formatTS, getConditionTypeTitle, truncateStringInTheMiddle } from '../../util/tools'
import { ConditionStatus, ConditionType } from '../../util/types'

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
    payouts,
    questionId,
    resolveTimestamp,
    resolved,
  } = condition
  const dropdownItems: Array<DropdownItemProps> = [
    {
      content: 'Resolve Condition',
      onClick: () => {
        logger.log('clickity')
      },
    },
    {
      content: 'Split Position',
      onClick: () => {
        logger.log('clickity')
      },
    },
    {
      content: 'Merge Positions',
      onClick: () => {
        logger.log('clickity')
      },
    },
    {
      content: 'Report Payouts',
      onClick: () => {
        logger.log('clickity')
      },
    },
  ]

  let networkId = null
  if (status._type === 'connected' || status._type === 'infura') {
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
      : truncateStringInTheMiddle(oracle, 6, 6)

  return (
    <CenteredCard
      dropdown={
        <Dropdown
          activeItemHightlight={false}
          dropdownButtonContent={<ButtonDropdownCircle />}
          dropdownPosition={DropdownPosition.right}
          items={dropdownItems}
        />
      }
    >
      <GridTwoColumns marginBottomXL>
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
        {!isConditionFromOmen && (
          <TitleValue
            title="Question Id"
            value={
              <>
                {truncateStringInTheMiddle(questionId, 6, 6)}
                <ButtonCopy value={questionId} />
              </>
            }
          />
        )}
      </GridTwoColumns>
      <GridTwoColumns forceOneColumn marginBottomXL>
        {isConditionFromOmen && <TitleValue title="Question" value={title} />}
      </GridTwoColumns>
      <GridTwoColumns forceOneColumn marginBottomXL>
        <TitleValue
          title="Outcomes"
          value={
            <StripedList>
              {outcomesPrettier.map((outcome: string, index: number) => (
                <StripedListItem key={index}>{outcome}</StripedListItem>
              ))}
            </StripedList>
          }
        />
      </GridTwoColumns>
      <GridTwoColumns>
        {resolved && (
          <TitleValue
            title="Resolution Date"
            value={formatTS(resolveTimestamp) || INFORMATION_NOT_AVAILABLE}
          />
        )}
        {isConditionFromOmen && <TitleValue title="Category" value={category} />}
        <TitleValue
          title="Oracle"
          value={
            <>
              {oracleTitle}
              <ButtonCopy value={oracle} />
            </>
          }
        />
        {resolved && <TitleValue title="Payouts" value={`[${payouts && payouts.toString()}]`} />}
      </GridTwoColumns>
    </CenteredCard>
  )
}
