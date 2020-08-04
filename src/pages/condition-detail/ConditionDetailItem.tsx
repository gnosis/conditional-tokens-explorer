import { Provider } from 'ethers/providers'
import React, { useEffect, useState } from 'react'

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
import { useQuestion } from '../../hooks/useQuestion'
import {
  formatDate,
  getConditionTypeTitle,
  isContract,
  truncateStringInTheMiddle,
} from '../../util/tools'
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
  const { conditionId, creator, oracle, outcomeSlotCount, questionId, resolved } = props
  const dropdownItems: Array<DropdownItemProps> = [
    {
      content: 'Resolve Condition',
      onClick: () => {
        console.log('clickity')
      },
    },
    {
      content: 'Split Position',
      onClick: () => {
        console.log('clickity')
      },
    },
    {
      content: 'Merge Positions',
      onClick: () => {
        console.log('clickity')
      },
    },
    {
      content: 'Report Payouts',
      onClick: () => {
        console.log('clickity')
      },
    },
  ]

  let networkId = null
  if (status._type === 'connected') {
    const { networkConfig } = status
    networkId = networkConfig.networkId
  }

  const { question } = useQuestion(questionId)
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
            value={isFromOmen ? ConditionType.Omen : ConditionType.Unknown}
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
          <TitleValue title="Question Type" value={getConditionTypeTitle(templateId)} />
        </GridTwoColumns>
        <GridTwoColumns forceOneColumn marginBottomXL>
          <TitleValue title="Question" value={title} />
        </GridTwoColumns>
        <GridTwoColumns forceOneColumn marginBottomXL>
          <TitleValue
            title="Outcomes"
            value={
              <StripedList>
                {outcomes.map((outcome: string, index: number) => (
                  <StripedListItem key={index}>{outcome}</StripedListItem>
                ))}
              </StripedList>
            }
          />
        </GridTwoColumns>
        <GridTwoColumns>
          <TitleValue
            title="Resolution Date"
            value={(resolution && formatDate(resolution)) || INFORMATION_NOT_AVAILABLE}
          />
          <TitleValue title="Category" value={category} />
          <TitleValue
            title="Oracle"
            value={
              (networkId && getKnowOracleFromAddress(networkId, oracle)) ||
              truncateStringInTheMiddle(oracle, 6, 6)
            }
          />
        </GridTwoColumns>
      </CenteredCard>
      {/* )} */}
    </>
  )
}
