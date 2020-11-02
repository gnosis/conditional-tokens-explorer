import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'

import { ConditionTypeFilterDropdown } from 'components/filters/ConditionTypeFilterDropdown'
import { DateFilter } from 'components/filters/DateFilter'
import { MinMaxFilter } from 'components/filters/MinMaxFilter'
import { OraclesFilterDropdown } from 'components/filters/OraclesFilterDropdown'
import { StatusFilterDropdown } from 'components/filters/StatusFilterDropdown'
import { SearchField } from 'components/form/SearchField'
import { Switch } from 'components/form/Switch'
import { CompactFiltersLayout } from 'components/pureStyledComponents/CompactFiltersLayout'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { RadioButton } from 'components/pureStyledComponents/RadioButton'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { SpinnerSize } from 'components/statusInfo/common'
import { TableControls } from 'components/table/TableControls'
import { FormatHash } from 'components/text/FormatHash'
import { TitleValue } from 'components/text/TitleValue'
import { useConditions } from 'hooks/useConditions'
import { useConditionsSearchOptions } from 'hooks/useConditionsSearchOptions'
import { customStyles } from 'theme/tableCustomStyles'
import { Conditions_conditions } from 'types/generatedGQLForCTE'
import { getLogger } from 'util/logger'
import { truncateStringInTheMiddle } from 'util/tools'
import { ConditionType, ConditionTypeAll, OracleFilterOptions, StatusOptions } from 'util/types'

const Search = styled(SearchField)`
  min-width: 0;
  width: 400px;
`

const TableControlsStyled = styled(TableControls)`
  padding-top: 13px;
`

const logger = getLogger('SelectableConditionTable')

interface Props {
  onRowClicked: (row: Conditions_conditions) => void
  selectedConditionId?: string | undefined
  title?: string
}

export const SelectableConditionTable: React.FC<Props> = (props) => {
  const { onRowClicked, selectedConditionId, title = 'Conditions', ...restProps } = props
  const [conditionIdToSearch, setConditionIdToSearch] = useState<string>('')
  const [conditionIdToShow, setConditionIdToShow] = useState<string>('')
  const [selectedOracleFilter, setSelectedOracleFilter] = useState<string[]>([])
  const [selectedOracleValue, setSelectedOracleValue] = useState<OracleFilterOptions>(
    OracleFilterOptions.All
  )
  const [resetPagination, setResetPagination] = useState<boolean>(false)
  const [selectedStatus, setSelectedStatus] = useState<StatusOptions>(StatusOptions.All)
  const [selectedMinOutcomes, setSelectedMinOutcomes] = useState<Maybe<number>>(null)
  const [selectedMaxOutcomes, setSelectedMaxOutcomes] = useState<Maybe<number>>(null)
  const [selectedFromCreationDate, setSelectedFromCreationDate] = useState<Maybe<number>>(null)
  const [selectedToCreationDate, setSelectedToCreationDate] = useState<Maybe<number>>(null)
  const [selectedConditionTypeFilter, setSelectedConditionTypeFilter] = useState<Maybe<string>>(
    null
  )
  const [selectedConditionTypeValue, setSelectedConditionTypeValue] = useState<
    ConditionType | ConditionTypeAll
  >(ConditionTypeAll.all)

  const debouncedHandler = useDebounceCallback((conditionIdToSearch) => {
    setConditionIdToSearch(conditionIdToSearch)
  }, 500)

  const inputHandler = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget
      setConditionIdToShow(value)
      debouncedHandler(value)
    },
    [debouncedHandler]
  )

  const onClearSearch = React.useCallback(() => {
    setConditionIdToShow('')
    debouncedHandler('')
  }, [debouncedHandler])

  const { data, error, loading } = useConditions({
    conditionId: conditionIdToSearch,
  })

  const [selectedCondition, setSelectedCondition] = useState<Maybe<Conditions_conditions>>(null)
  const [conditionList, setConditionList] = useState<Conditions_conditions[]>([])

  useEffect(() => {
    if (!data || !data.conditions) {
      setConditionList([])
    } else {
      if (selectedCondition) {
        setConditionList(data.conditions.filter(({ id }) => selectedCondition.id !== id))
      } else {
        setConditionList(data.conditions)
      }
    }
  }, [selectedCondition, data])

  const columns = useMemo(
    () => [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => (
          <RadioButton checked={selectedConditionId === row.id} onClick={() => onRowClicked(row)} />
        ),
        maxWidth: '12px',
        minWidth: '12px',
        name: '',
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => (
          <FormatHash
            hash={truncateStringInTheMiddle(row.id, 8, 6)}
            onClick={() => onRowClicked(row)}
          />
        ),
        name: 'Condition Id',
        selector: 'createTimestamp',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => (
          <FormatHash
            hash={truncateStringInTheMiddle(row.oracle, 8, 6)}
            onClick={() => onRowClicked(row)}
          />
        ),
        name: 'Reporter / Oracle',
        selector: 'oracle',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => (
          <FormatHash
            hash={truncateStringInTheMiddle(row.questionId, 8, 6)}
            onClick={() => onRowClicked(row)}
          />
        ),
        name: 'Question Id',
        selector: 'questionId',
        sortable: true,
      },
    ],
    [onRowClicked, selectedConditionId]
  )

  const [searchBy, setSearchBy] = useState('all')
  const dropdownItems = useConditionsSearchOptions(setSearchBy)

  const [showFilters, setShowFilters] = useState(false)
  const toggleShowFilters = useCallback(() => {
    setShowFilters(!showFilters)
  }, [showFilters])

  const isLoading = !conditionIdToSearch && loading
  const isSearching = conditionIdToSearch && loading
  const showSpinner = (isLoading || isSearching) && !error

  logger.log(`Search by ${searchBy}`)

  return (
    <TitleValue
      title={title}
      value={
        <>
          <TableControlsStyled
            end={
              <Search
                dropdownItems={dropdownItems}
                onChange={inputHandler}
                onClear={onClearSearch}
                value={conditionIdToShow}
              />
            }
            start={<Switch active={showFilters} label="Filters" onClick={toggleShowFilters} />}
          />
          {showFilters && (
            <CompactFiltersLayout>
              <OraclesFilterDropdown
                onClick={(value: OracleFilterOptions, filter: string[]) => {
                  setSelectedOracleFilter(filter)
                  setSelectedOracleValue(value)
                  setResetPagination(!resetPagination)
                }}
                value={selectedOracleValue}
              />
              <StatusFilterDropdown
                onClick={(value: StatusOptions) => {
                  setSelectedStatus(value)
                }}
                value={selectedStatus}
              />
              <ConditionTypeFilterDropdown
                onClick={(value: ConditionType | ConditionTypeAll, filter: Maybe<string>) => {
                  setSelectedConditionTypeFilter(filter)
                  setSelectedConditionTypeValue(value)
                }}
                value={selectedConditionTypeValue}
              />
              <MinMaxFilter
                onSubmit={(min, max) => {
                  setSelectedMinOutcomes(min)
                  setSelectedMaxOutcomes(max)
                }}
                title="Number Of Outcomes"
              />
              <DateFilter
                onSubmit={(from, to) => {
                  setSelectedFromCreationDate(from)
                  setSelectedToCreationDate(to)
                }}
                title="Creation Date"
              />
            </CompactFiltersLayout>
          )}
          <DataTable
            className="outerTableWrapper condensedTable"
            columns={columns}
            customStyles={customStyles}
            data={showSpinner ? [] : conditionList.length ? conditionList : []}
            highlightOnHover
            noDataComponent={
              showSpinner ? (
                <InlineLoading size={SpinnerSize.small} />
              ) : error ? (
                <EmptyContentText>Error: {error.message}</EmptyContentText>
              ) : (
                <EmptyContentText>No conditions found.</EmptyContentText>
              )
            }
            noHeader
            onRowClicked={onRowClicked}
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 15]}
            pointerOnHover
            responsive
          />
        </>
      }
      {...restProps}
    />
  )
}
