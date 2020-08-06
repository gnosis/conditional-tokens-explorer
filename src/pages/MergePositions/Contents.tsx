import { getLogger } from 'util/logger'

import { Button, ButtonLink } from 'components/buttons'
import { CenteredCard } from 'components/common/CenteredCard'
import { StripedList, StripedListItem } from 'components/common/StripedList'
import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { GridTwoColumns } from 'components/pureStyledComponents/GridTwoColumns'
import { TitleValue } from 'components/text/TitleValue'
import React, { useState } from 'react'
import styled from 'styled-components'

const logger = getLogger('MergePosition')

export const Contents = () => {
  const [positionsToMerge, setPositions] = useState<Array<any>>([
    '[DAI C:0x123 O:0|1, C:0x345 O:0] x10',
    '[DAI C:0x123 O:0|1, C:0x345 O:1] x10',
  ])
  const [conditionId, setConditionId] = useState('0x345')
  const [mergedPosition, setMergedPosition] = useState('[DAI C:0x123 O:0|1] x10')

  return (
    <CenteredCard>
      <GridTwoColumns forceOneColumn marginBottomXL>
        <TitleValue
          title={
            <TitleWrapper>
              <span>Positions</span>
              <ButtonLink>Select Positions</ButtonLink>
            </TitleWrapper>
          }
          value={
            <StripedList>
              {positionsToMerge.map((position: string, index: number) => (
                <StripedListItem key={index}>{position}</StripedListItem>
              ))}
            </StripedList>
          }
        />
      </GridTwoColumns>
      <GridTwoColumns forceOneColumn marginBottomXL>
        <TitleValue
          title={
            <TitleWrapper>
              <span>Condition Id</span>
              <ButtonLink>Select Condition</ButtonLink>
            </TitleWrapper>
          }
          value={conditionId}
        />
      </GridTwoColumns>
      <GridTwoColumns forceOneColumn marginBottomXL>
        <TitleValue
          title={
            <TitleWrapper>
              <span>Amount</span>
              <ButtonLink>Use Wallet Balance</ButtonLink>
            </TitleWrapper>
          }
          value={<BigNumberInputWrapper />}
        />
      </GridTwoColumns>
      <GridTwoColumns forceOneColumn marginBottomXL>
        <TitleValue
          title="Merged position preview"
          value={
            <StripedList>
              <StripedListItem>{mergedPosition}</StripedListItem>
            </StripedList>
          }
        />
      </GridTwoColumns>
      <ButtonWrapper>
        <Button>Merge</Button>
      </ButtonWrapper>
    </CenteredCard>
  )
}

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 80px;
`
