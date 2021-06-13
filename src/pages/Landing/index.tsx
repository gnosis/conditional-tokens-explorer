/* eslint-disable react/display-name */
import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'

import chart from 'chart.svg'
import { Button } from 'components/buttons/Button'
import { SearchField } from 'components/form/SearchField'
import { ChevronDown } from 'components/icons/ChevronDown'
import { IconPlus } from 'components/icons/IconPlus'
import { BaseCard } from 'components/pureStyledComponents/BaseCard'
import { GetCondition_landing, LandingConditionsCell } from 'components/table/LandingConditionsCell'
import { GetPosition_landing, LandingPositionsCell } from 'components/table/LandingPositionsCell'
import conditionsData from 'conditions-data.json'
import { useConditionsSearchOptions } from 'hooks/useConditionsSearchOptions'
import positionsData from 'positions-data.json'
import { customStyles } from 'theme/tableCustomStyles'
import { ConditionSearchOptions } from 'util/types'

const LandingContainer = styled.div`
  max-width: 1300px;
  width: 100%;
  // height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  margin-top: 25px;
`

const LandingRow = styled.div`
  display: flex;
  justify-items: space-between;
  gap: 18px;
  width: 100%;
  margin-bottom: 25px;
`

const SearchFieldStyled = styled(SearchField)`
  max-width: unset;
  width: 100%;
`

const LandingCard = styled(BaseCard)`
  width: 50%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 22px;
  padding: 18px;
`
const TotalsItem = styled.div`
  flex: 1 0 40%;
  padding-left: 10px;
  position: relative;
  // border-left: 5px solid #0092ab;

  &::after {
    content: '';
    position: absolute;
    left: -5px;
    top: 0;
    bottom: 0;
    width: 5px;
    background: #0092ab;
    border-radius: 3px;
  }
`

const TotalsItemTitle = styled.p`
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 22px;
  color: #5d6d74;
  margin: 0 0 5px;
  padding: 0;
`

const TotalsItemValue = styled.p`
  font-family: 'Averta Semibold', 'Averta', 'Helvetica Neue', 'Arial', 'Segoe UI', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', '-apple-system', 'BlinkMacSystemFont',
    sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 22px;
  line-height: 27px;
  color: #445055;
  margin: 0;
  padding: 0;
`
const Chart = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`
const ChartHeader = styled.div`
  display: flex;
  flex direction: row;
  justify-content: space-between;
  margin-bottom: 18px;
`

const ChartTtile = styled.p`
  font-family: 'Averta Semibold', 'Averta', 'Helvetica Neue', 'Arial', 'Segoe UI', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', '-apple-system', 'BlinkMacSystemFont',
    sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 22px;
  margin: 0;
`

const ChartDropdown = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  line-height: 20px;
`

export const Landing: React.FC = () => {
  // eslint-disable-next-line
  const [searchBy, setSearchBy] = useState<ConditionSearchOptions>(
    ConditionSearchOptions.ConditionId
  )
  // eslint-disable-next-line
  const [textToSearch, setTextToSearch] = useState<string>('')
  // eslint-disable-next-line
  const [textToShow, setTextToShow] = useState<string>('')

  const dropdownItems = useConditionsSearchOptions(setSearchBy)

  const debouncedHandlerTextToSearch = useDebounceCallback((conditionIdToSearch) => {
    setTextToSearch(conditionIdToSearch)
  }, 500)

  const onChangeSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget
      debouncedHandlerTextToSearch(value)
    },
    [debouncedHandlerTextToSearch]
  )

  const onClearSearch = useCallback(() => {
    debouncedHandlerTextToSearch('')
  }, [debouncedHandlerTextToSearch])

  const conditionsColumns = [
    {
      cell: (row: GetCondition_landing) => (
        <LandingConditionsCell
          conditionId={row.conditionId}
          createTimestamp={row.createTimestamp}
          oracle={row.oracle}
          question={row.question}
          resolved={row.resolved}
          totalLocked={row.totalLocked}
          userBalance={row.userBalance}
        />
      ),
      maxWidth: '100%',
      minWidth: '110px',
      name: 'Conditions',
    },
  ]

  const positionsColumns = [
    {
      cell: (row: GetPosition_landing) => (
        <LandingPositionsCell
          conditionId={row.conditionId}
          createTimestamp={row.createTimestamp}
          oracle={row.oracle}
          positionId={row.positionId}
          question={row.question}
          totalBalance={row.totalBalance}
        />
      ),
      maxWidth: '100%',
      minWidth: '110px',
      name: 'Positions',
    },
  ]

  return (
    <LandingContainer>
      <LandingRow style={{ alignItems: 'center' }}>
        <SearchFieldStyled
          dropdownItems={dropdownItems}
          onChange={onChangeSearch}
          onClear={onClearSearch}
          placeholder={
            'Search by condition id, position id, question id, question text, oracle address, creator address, collateral symbol…'
          }
          value={textToShow}
        />
        <Button>
          <IconPlus />
          &nbsp;New Condition
        </Button>
      </LandingRow>
      <LandingRow>
        <LandingCard>
          <TotalsItem>
            <TotalsItemTitle>Total Collateral Locked</TotalsItemTitle>
            <TotalsItemValue>$55,808,127</TotalsItemValue>
          </TotalsItem>
          <TotalsItem>
            <TotalsItemTitle>Total Conditions Created</TotalsItemTitle>
            <TotalsItemValue>999,000,000</TotalsItemValue>
          </TotalsItem>
          <TotalsItem>
            <TotalsItemTitle>Total Collateral Redeemed</TotalsItemTitle>
            <TotalsItemValue>$28,368,428</TotalsItemValue>
          </TotalsItem>
          <TotalsItem>
            <TotalsItemTitle>Total Positions Created</TotalsItemTitle>
            <TotalsItemValue>15,568,374</TotalsItemValue>
          </TotalsItem>
        </LandingCard>
        <LandingCard>
          <Chart>
            <ChartHeader>
              <ChartTtile>Transaction History</ChartTtile>
              <ChartDropdown>
                7 days
                <ChevronDown />
              </ChartDropdown>
            </ChartHeader>
            <img alt="chart" src={chart} width="100%" />
          </Chart>
        </LandingCard>
      </LandingRow>
      <LandingRow>
        <DataTable
          className="outerTableWrapper"
          columns={conditionsColumns}
          customStyles={customStyles}
          data={conditionsData}
          noHeader
        />
        <DataTable
          className="outerTableWrapper"
          columns={positionsColumns}
          customStyles={customStyles}
          data={positionsData}
          noHeader
        />
      </LandingRow>
    </LandingContainer>
  )
}
