import { truncateStringInTheMiddle } from 'util/tools'

import React from 'react'
import styled from 'styled-components'

import { Button } from '../../components/buttons/Button'
import { ButtonCopy } from '../../components/buttons/ButtonCopy'
import { ButtonDropdownCircle } from '../../components/buttons/ButtonDropdownCircle'
import { CenteredCard } from '../../components/common/CenteredCard'
import { Dropdown, DropdownItemProps, DropdownPosition } from '../../components/common/Dropdown'
import { SetAllowance } from '../../components/common/SetAllowance'
import { StripedList, StripedListItem } from '../../components/common/StripedList'
import { TokenIcon } from '../../components/common/TokenIcon'
import { GridTwoColumns } from '../../components/pureStyledComponents/GridTwoColumns'
import { TitleValue } from '../../components/text/TitleValue'
import { getTokenFromAddress } from '../../config/networkConfig'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { GetPosition_position as Position } from '../../types/generatedGQL'

const CollateralText = styled.span`
  color: ${(props) => props.theme.colors.darkerGray};
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  text-align: left;
`

const CollateralTextStrong = styled.span`
  font-weight: 600;
`

const CollateralTextAmount = styled.span<{ italic?: boolean }>`
  font-style: ${(props) => (props.italic ? 'italic' : 'normal')};
`

const CollateralWrapButton = styled(Button)`
  font-size: 14px;
  font-weight: 600;
  height: 24px;
  width: 80px;
`

interface Props {
  position: Position
}

const OutcomeList = ({ outcomeList }: { outcomeList: number[] }) => {
  return (
    <>
      {outcomeList.map((value) => (
        <div key={`index-${value}`}>{value}</div>
      ))}
    </>
  )
}

export const Contents = ({ position }: Props) => {
  const { collateralToken, id, indexSets } = position
  const numberedOutcomes = indexSets.map((indexSet: string) => {
    return Number(indexSet)
      .toString(2)
      .split('')
      .reverse()
      .map((value, index) => (value === '1' ? index + 1 : 0))
      .filter((n) => !!n)
  })
  const dropdownItems: Array<DropdownItemProps> = [
    {
      content: 'Redeem',
      onClick: () => {
        console.log('clickity')
      },
    },
    {
      content: 'Split',
      onClick: () => {
        console.log('clickity')
      },
    },
  ]
  const { networkConfig } = useWeb3Connected()
  const tokenSymbol = getTokenFromAddress(networkConfig.networkId, collateralToken.id).symbol
  const ERC20Amount = 100
  const ERC1155Amount = 0

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
          title="Position Id"
          value={
            <>
              {truncateStringInTheMiddle(id, 8, 6)}
              <ButtonCopy value={id} />
            </>
          }
        />
        <TitleValue title="Collateral Token" value={<TokenIcon symbol={tokenSymbol} />} />
        <TitleValue
          title="Contract Address"
          value={
            <>
              {truncateStringInTheMiddle(collateralToken.id, 8, 6)}
              <ButtonCopy value={collateralToken.id} />
            </>
          }
        />
      </GridTwoColumns>
      <SetAllowance
        collateral={collateralToken}
        finished={false}
        loading={false}
        onUnlock={() => {}}
      />
      <GridTwoColumns forceOneColumn marginBottomXL>
        <TitleValue
          title="Collateral Wrapping"
          value={
            <StripedList>
              <StripedListItem>
                <CollateralText>
                  <CollateralTextStrong>ERC20:</CollateralTextStrong>{' '}
                  <CollateralTextAmount>
                    {ERC20Amount} {tokenSymbol}
                  </CollateralTextAmount>
                </CollateralText>
                <CollateralWrapButton>Wrap</CollateralWrapButton>
              </StripedListItem>
              <StripedListItem>
                <CollateralText>
                  <CollateralTextStrong>ERC1155:</CollateralTextStrong>{' '}
                  <CollateralTextAmount>
                    {ERC1155Amount
                      ? `${ERC1155Amount} ${tokenSymbol}`
                      : 'No unwrapper collateral yet.'}
                  </CollateralTextAmount>
                </CollateralText>
                <CollateralWrapButton disabled={!ERC1155Amount}>Unwrap</CollateralWrapButton>
              </StripedListItem>
            </StripedList>
          }
        />
      </GridTwoColumns>
      <GridTwoColumns forceOneColumn marginBottomXL>
        <TitleValue
          title="Partition"
          value={numberedOutcomes.map((outcomeList, index) => {
            return (
              <div className="outcomePartition" key={`outcomelist-${index}`}>
                <OutcomeList outcomeList={outcomeList}></OutcomeList>
              </div>
            )
          })}
        />
      </GridTwoColumns>
    </CenteredCard>
  )
}
