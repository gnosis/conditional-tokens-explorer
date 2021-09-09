import React, { useCallback, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { ButtonCopy } from 'components/buttons/ButtonCopy'
import { ButtonDropdownCircle } from 'components/buttons/ButtonDropdownCircle'
import { CenteredCard } from 'components/common/CenteredCard'
import {
  Dropdown,
  DropdownItemCSS,
  DropdownItemProps,
  DropdownPosition,
} from 'components/common/Dropdown'
import { DisplayTablePositions } from 'components/form/DisplayTablePositions'
import { OmenMarketsOrQuestion } from 'components/form/OmenMarketsOrQuestion'
import { ExternalLink } from 'components/navigation/ExternalLink'
import { FlexRow } from 'components/pureStyledComponents/FlexRow'
import { Pill, PillTypes } from 'components/pureStyledComponents/Pill'
import { Row } from 'components/pureStyledComponents/Row'
import { StripedList, StripedListItem } from 'components/pureStyledComponents/StripedList'
import { FormatHash } from 'components/text/FormatHash'
import { TitleValue } from 'components/text/TitleValue'
import { INFORMATION_NOT_AVAILABLE } from 'config/constants'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useActiveAddress } from 'hooks/useActiveAddress'
import { useIsConditionFromOmen } from 'hooks/useIsConditionFromOmen'
import { usePositionsList } from 'hooks/usePositionsList'
import { useQuestion } from 'hooks/useQuestion'
import { GetCondition_condition } from 'types/generatedGQLForCTE'
import {
  formatTS,
  getConditionTypeTitle,
  getRealityQuestionUrl,
  truncateStringInTheMiddle,
} from 'util/tools'
import {
  AdvancedFilterPosition,
  ConditionStatus,
  ConditionType,
  PositionSearchOptions,
  WrappedCollateralOptions,
} from 'util/types'

const StripedListStyled = styled(StripedList)`
  margin-top: 6px;
`

const DropdownItemLink = styled(NavLink)<DropdownItemProps>`
  ${DropdownItemCSS}
`

interface Props {
  condition: GetCondition_condition
}

const optionsDisplayTable = {
  showCollectionColumn: true,
}

export const Contents: React.FC<Props> = ({ condition }) => {
  const { _type: status, networkConfig } = useWeb3ConnectedOrInfura()

  const activeAddress = useActiveAddress()

  const {
    createTimestamp,
    creator,
    id: conditionId,
    oracle,
    outcomeSlotCount,
    payouts,
    questionId,
    resolveTimestamp,
    resolved,
  } = condition

  const isConnected = useMemo(() => status === Web3ContextStatus.Connected, [status])
  const isAllowedToReport = useMemo(
    () => activeAddress && activeAddress.toLowerCase() === oracle.toLowerCase(),
    [activeAddress, oracle]
  )

  const dropdownItems = useMemo(() => {
    return [
      {
        href: `/split/${conditionId}`,
        text: 'Split Position',
        disabled: !isConnected,
      },
      {
        href: `/report/${conditionId}`,
        text: 'Report Payouts',
        disabled: resolved || !isConnected || !isAllowedToReport,
      },
    ]
  }, [isConnected, resolved, isAllowedToReport, conditionId])

  const { outcomesPrettier, question } = useQuestion(questionId, outcomeSlotCount)
  const isConditionFromOmen = useIsConditionFromOmen([oracle])
  const { templateId = null, category = INFORMATION_NOT_AVAILABLE } = question ?? {}

  const oracleName = useMemo(
    () =>
      isConditionFromOmen ? (
        networkConfig.getOracleFromAddress(oracle).description
      ) : (
        <FormatHash hash={truncateStringInTheMiddle(oracle, 8, 6)} />
      ),
    [networkConfig, oracle, isConditionFromOmen]
  )

  const advancedFilters: AdvancedFilterPosition = useMemo(() => {
    return {
      CollateralValue: {
        type: null,
        value: null,
      },
      ToCreationDate: null,
      FromCreationDate: null,
      TextToSearch: {
        type: PositionSearchOptions.ConditionId,
        value: conditionId,
      },
      WrappedCollateral: WrappedCollateralOptions.All,
    }
  }, [conditionId])

  const { data: positions, loading: loadingPositions } = usePositionsList(advancedFilters)

  const getRealityQuestionUrlMemoized = useCallback(
    (questionId: string): string => getRealityQuestionUrl(questionId, networkConfig),
    [networkConfig]
  )

  return (
    <CenteredCard
      dropdown={
        <Dropdown
          activeItemHighlight={false}
          dropdownButtonContent={<ButtonDropdownCircle />}
          dropdownPosition={DropdownPosition.right}
          items={dropdownItems.map((item, index) => (
            <DropdownItemLink disabled={item.disabled} key={index} to={item.href}>
              {item.text}
            </DropdownItemLink>
          ))}
        />
      }
    >
      <Row cols="1fr 1fr">
        <TitleValue
          title="Condition Id"
          value={
            <FlexRow>
              <FormatHash hash={truncateStringInTheMiddle(conditionId, 8, 6)} />
              <ButtonCopy value={conditionId} />
            </FlexRow>
          }
        />
        <TitleValue
          title="Condition Type"
          value={isConditionFromOmen ? ConditionType.omen : ConditionType.custom}
        />
        <TitleValue
          title="Status"
          value={
            <Pill type={resolved ? PillTypes.primary : PillTypes.open}>
              {resolved ? ConditionStatus.Resolved : ConditionStatus.Open}
            </Pill>
          }
        />
        <TitleValue title="Creation Date" value={formatTS(createTimestamp)} />
        <TitleValue
          title="Creator Address"
          value={
            <FlexRow>
              <FormatHash hash={truncateStringInTheMiddle(creator, 8, 6)} />
              <ButtonCopy value={creator} />
            </FlexRow>
          }
        />
        {isConditionFromOmen && (
          <TitleValue title="Question Type" value={getConditionTypeTitle(templateId)} />
        )}
        <TitleValue
          title="Question Id"
          value={
            <FlexRow>
              <FormatHash hash={truncateStringInTheMiddle(questionId, 8, 6)} />
              <ButtonCopy value={questionId} />
            </FlexRow>
          }
        />
      </Row>
      <OmenMarketsOrQuestion conditionId={conditionId} />
      {isConditionFromOmen && (
        <Row paddingTop>
          <TitleValue
            title="Outcomes"
            value={
              <StripedListStyled>
                {outcomesPrettier.map((outcome: string, index: number) => (
                  <StripedListItem key={index} wordBreak="normal">
                    {resolved && payouts ? `${outcome} - ${payouts[index]}%` : outcome}
                  </StripedListItem>
                ))}
              </StripedListStyled>
            }
          />
        </Row>
      )}
      <Row cols="1fr 1fr">
        {isConditionFromOmen && resolved && (
          <TitleValue title="Resolution Date" value={formatTS(resolveTimestamp)} />
        )}
        {isConditionFromOmen && <TitleValue title="Category" value={category} />}
        <TitleValue
          title={isConditionFromOmen ? 'Oracle' : 'Reporting Address'}
          value={
            <FlexRow>
              {oracleName}
              <ButtonCopy value={oracle} />
              {isConditionFromOmen && (
                <ExternalLink href={getRealityQuestionUrlMemoized(questionId)} />
              )}
            </FlexRow>
          }
        />
      </Row>
      <Row paddingTop>
        <TitleValue
          title={"Condition's split positions"}
          value={
            <DisplayTablePositions
              isLoading={loadingPositions}
              options={optionsDisplayTable}
              positions={positions || []}
            />
          }
        />
      </Row>
    </CenteredCard>
  )
}
