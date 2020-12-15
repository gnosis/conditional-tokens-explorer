import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import styled, { withTheme } from 'styled-components'

import { ButtonCopy } from 'components/buttons/ButtonCopy'
import { ConditionTypeFilterDropdown } from 'components/filters/ConditionTypeFilterDropdown'
import { DateFilter } from 'components/filters/DateFilter'
import { MinMaxFilter } from 'components/filters/MinMaxFilter'
import { OraclesFilterDropdown } from 'components/filters/OraclesFilterDropdown'
import { StatusFilterDropdown } from 'components/filters/StatusFilterDropdown'
import { SearchField } from 'components/form/SearchField'
import { Switch } from 'components/form/Switch'
import { ExternalLink } from 'components/navigation/ExternalLink'
import { CompactFiltersLayout } from 'components/pureStyledComponents/CompactFiltersLayout'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import {
  FilterResultsControl,
  FilterResultsTextAlternativeLayout,
} from 'components/pureStyledComponents/FilterResultsText'
import { FiltersSwitchWrapper } from 'components/pureStyledComponents/FiltersSwitchWrapper'
import { RadioButton } from 'components/pureStyledComponents/RadioButton'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { SpinnerSize } from 'components/statusInfo/common'
import { TableControls } from 'components/table/TableControls'
import { FormatHash } from 'components/text/FormatHash'
import { TitleValue } from 'components/text/TitleValue'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useConditionsList } from 'hooks/useConditionsList'
import { useConditionsSearchOptions } from 'hooks/useConditionsSearchOptions'
import { customStyles } from 'theme/tableCustomStyles'
import { GetCondition_condition } from 'types/generatedGQLForCTE'
import { getRealityQuestionUrl, isOracleRealitio, truncateStringInTheMiddle } from 'util/tools'
import {
  AdvancedFilterConditions,
  ConditionSearchOptions,
  ConditionType,
  ConditionTypeAll,
  OracleFilterOptions,
  StatusOptions,
} from 'util/types'

const Search = styled(SearchField)`
  min-width: 0;
  width: 400px;
`

const TableControlsStyled = styled(TableControls)`
  padding-top: 13px;
`

interface Props {
  allowToDisplayOnlyConditionsToReport?: boolean
  onClearSelection: () => void
  onRowClicked: (row: GetCondition_condition) => void
  refetch?: boolean
  selectedConditionId?: string | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme?: any
  title?: string
  resetFilterUpdate?: boolean
}

interface Params {
  conditionId?: string
}

const SelectConditionTable: React.FC<Props> = (props) => {
  const { _type: status, cpkAddress, networkConfig } = useWeb3ConnectedOrInfura()

  const {
    allowToDisplayOnlyConditionsToReport = false,
    onClearSelection,
    onRowClicked,
    refetch,
    resetFilterUpdate = false,
    selectedConditionId,
    theme,
    title = 'Conditions',
    ...restProps
  } = props

  const { conditionId } = useParams<Params>()

  const [textToSearch, setTextToSearch] = useState<string>(conditionId || '')
  const [textToShow, setTextToShow] = useState<string>(conditionId || '')
  const [resetPagination, setResetPagination] = useState<boolean>(false)

  const [selectedOracleFilter, setSelectedOracleFilter] = useState<string[]>(() =>
    allowToDisplayOnlyConditionsToReport && cpkAddress ? [cpkAddress.toLowerCase()] : []
  )
  const [selectedOracleValue, setSelectedOracleValue] = useState<OracleFilterOptions>(() =>
    allowToDisplayOnlyConditionsToReport ? OracleFilterOptions.Current : OracleFilterOptions.All
  )
  const [selectedStatus, setSelectedStatus] = useState<StatusOptions>(() =>
    allowToDisplayOnlyConditionsToReport ? StatusOptions.Open : StatusOptions.All
  )
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
  const [searchBy, setSearchBy] = useState<ConditionSearchOptions>(
    ConditionSearchOptions.ConditionId
  )
  const [showFilters, setShowFilters] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)

  const dropdownItems = useConditionsSearchOptions(setSearchBy)

  const debouncedHandlerTextToSearch = useDebounceCallback((conditionIdToSearch) => {
    setTextToSearch(conditionIdToSearch)
  }, 100)

  const onChangeSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget
      setTextToShow(value)
      debouncedHandlerTextToSearch(value)
    },
    [debouncedHandlerTextToSearch]
  )

  const onClearSearch = useCallback(() => {
    setTextToShow('')
    debouncedHandlerTextToSearch('')
  }, [debouncedHandlerTextToSearch])

  // Clear the filters on network change
  useEffect(() => {
    setShowFilters(false)
  }, [networkConfig])

  const resetFilters = useCallback(() => {
    setResetPagination(!resetPagination)
    setSelectedOracleValue(
      allowToDisplayOnlyConditionsToReport ? OracleFilterOptions.Current : OracleFilterOptions.All
    )
    setSelectedOracleFilter(
      allowToDisplayOnlyConditionsToReport && cpkAddress ? [cpkAddress.toLowerCase()] : []
    )
    setSelectedConditionTypeValue(ConditionTypeAll.all)
    setSelectedConditionTypeFilter(null)
    setSelectedStatus(allowToDisplayOnlyConditionsToReport ? StatusOptions.Open : StatusOptions.All)
    setSelectedMinOutcomes(null)
    setSelectedMaxOutcomes(null)
    setSelectedToCreationDate(null)
    setSelectedFromCreationDate(null)
    onClearSelection()
  }, [resetPagination, cpkAddress, allowToDisplayOnlyConditionsToReport, onClearSelection])

  useEffect(() => {
    resetFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetFilterUpdate])

  useEffect(() => {
    setIsFiltering(
      (allowToDisplayOnlyConditionsToReport &&
        selectedOracleValue !== OracleFilterOptions.Current) ||
        (!allowToDisplayOnlyConditionsToReport &&
          selectedOracleValue !== OracleFilterOptions.All) ||
        selectedConditionTypeValue !== ConditionTypeAll.all ||
        selectedConditionTypeFilter !== null ||
        (allowToDisplayOnlyConditionsToReport && selectedStatus !== StatusOptions.Open) ||
        (!allowToDisplayOnlyConditionsToReport && selectedStatus !== StatusOptions.All) ||
        selectedMinOutcomes !== null ||
        selectedMaxOutcomes !== null ||
        selectedToCreationDate !== null ||
        selectedFromCreationDate !== null
    )
  }, [
    allowToDisplayOnlyConditionsToReport,
    isFiltering,
    selectedConditionTypeFilter,
    selectedConditionTypeValue,
    selectedFromCreationDate,
    selectedMaxOutcomes,
    selectedMinOutcomes,
    selectedOracleFilter.length,
    selectedOracleValue,
    selectedStatus,
    selectedToCreationDate,
  ])

  const advancedFilters: AdvancedFilterConditions = useMemo(() => {
    return {
      ReporterOracle: {
        type: selectedOracleValue,
        value: selectedOracleFilter,
      },
      ConditionType: {
        type: selectedConditionTypeValue,
        value: selectedConditionTypeFilter,
      },
      Status: selectedStatus,
      MinOutcomes: selectedMinOutcomes,
      MaxOutcomes: selectedMaxOutcomes,
      ToCreationDate: selectedToCreationDate,
      FromCreationDate: selectedFromCreationDate,
      TextToSearch: {
        type: searchBy,
        value: textToSearch,
      },
    }
  }, [
    searchBy,
    textToSearch,
    selectedOracleValue,
    selectedOracleFilter,
    selectedConditionTypeValue,
    selectedConditionTypeFilter,
    selectedStatus,
    selectedMinOutcomes,
    selectedMaxOutcomes,
    selectedToCreationDate,
    selectedFromCreationDate,
  ])

  useEffect(() => {
    if (
      selectedOracleValue === OracleFilterOptions.Current &&
      status === Web3ContextStatus.Connected &&
      cpkAddress
    ) {
      setSelectedOracleFilter([cpkAddress.toLowerCase()])
    }

    if (
      selectedOracleValue === OracleFilterOptions.Current &&
      status === Web3ContextStatus.Infura
    ) {
      setSelectedOracleFilter([])
    }
  }, [status, cpkAddress, selectedOracleValue])

  const { data, error, loading, refetch: refetchConditionList } = useConditionsList(advancedFilters)

  useEffect(() => {
    if (refetch) {
      onClearSearch()
      refetchConditionList()
    }
  }, [refetch, refetchConditionList, onClearSearch])

  const [conditionList, setConditionList] = useState<GetCondition_condition[]>([])

  useEffect(() => {
    if (!data) {
      setConditionList([])
    } else {
      setConditionList(data)
    }
  }, [data])

  const columns = useMemo(
    () => [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: GetCondition_condition) => (
          <RadioButton checked={selectedConditionId === row.id} onClick={() => onRowClicked(row)} />
        ),
        maxWidth: '12px',
        minWidth: '12px',
        name: '',
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: GetCondition_condition) => (
          <FormatHash
            hash={truncateStringInTheMiddle(row.id, 8, 6)}
            onClick={() => onRowClicked(row)}
          />
        ),
        name: 'Condition Id',
        sortable: false,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: GetCondition_condition) => {
          const { oracle, questionId } = row

          const isConditionFromOmen = isOracleRealitio(oracle, networkConfig)

          const oracleName = isConditionFromOmen ? (
            <>
              {networkConfig.getOracleFromAddress(oracle).description}
              <ButtonCopy value={oracle} />
              <ExternalLink href={getRealityQuestionUrl(questionId, networkConfig)} />
            </>
          ) : (
            <FormatHash
              hash={truncateStringInTheMiddle(oracle, 8, 6)}
              onClick={() => onRowClicked(row)}
            />
          )

          return oracleName
        },
        name: 'Reporter / Oracle',
        sortable: false,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: GetCondition_condition) => (
          <FormatHash
            hash={truncateStringInTheMiddle(row.questionId, 8, 6)}
            onClick={() => onRowClicked(row)}
          />
        ),
        name: 'Question Id',
        sortable: false,
      },
    ],
    [onRowClicked, selectedConditionId, networkConfig]
  )

  const isLoading = useMemo(() => !textToSearch && loading, [textToSearch, loading])
  const isSearching = useMemo(() => textToSearch && loading, [textToSearch, loading])

  const toggleShowFilters = useCallback(() => {
    setShowFilters(!showFilters)
  }, [showFilters])

  const showSpinner = useMemo(() => (isLoading || isSearching) && !error, [
    isLoading,
    isSearching,
    error,
  ])

  // This is a HACK until this issue was resolved https://github.com/gnosis/hg-subgraph/issues/23
  const isBytes32Error = useMemo(
    () => error && error.message.includes('Failed to decode `Bytes` value: `Odd number of digits`'),
    [error]
  )

  useEffect(() => {
    if (
      textToSearch !== '' ||
      selectedOracleValue !== OracleFilterOptions.All ||
      selectedOracleFilter.length !== 0 ||
      selectedConditionTypeValue !== ConditionTypeAll.all ||
      selectedConditionTypeFilter ||
      selectedStatus !== StatusOptions.All ||
      selectedMinOutcomes ||
      selectedMaxOutcomes ||
      selectedToCreationDate ||
      selectedFromCreationDate
    ) {
      setResetPagination(!resetPagination)
      onClearSelection()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    textToSearch,
    selectedOracleValue,
    selectedOracleFilter,
    selectedConditionTypeValue,
    selectedConditionTypeFilter,
    selectedStatus,
    selectedMinOutcomes,
    selectedMaxOutcomes,
    selectedToCreationDate,
    selectedFromCreationDate,
  ])

  const conditionalRowStyles = [
    {
      when: (condition: GetCondition_condition) => selectedConditionId === condition.id,
      style: {
        backgroundColor: theme.colors.whitesmoke3,
        color: theme.colors.darkerGrey,
        '&:hover': {
          cursor: 'default',
        },
        pointerEvents: 'none' as const,
      },
    },
  ]

  return (
    <TitleValue
      title={title}
      value={
        <>
          <TableControlsStyled
            end={
              <Search
                dropdownItems={dropdownItems}
                onChange={onChangeSearch}
                onClear={onClearSearch}
                value={textToShow}
              />
            }
            start={
              <FiltersSwitchWrapper>
                <Switch active={showFilters} label="Filters" onClick={toggleShowFilters} />
                {(isFiltering || showFilters) && (
                  <FilterResultsTextAlternativeLayout>
                    Showing {isFiltering ? 'filtered' : 'all'} results -{' '}
                    <FilterResultsControl disabled={!isFiltering} onClick={resetFilters}>
                      Clear Filters
                    </FilterResultsControl>
                  </FilterResultsTextAlternativeLayout>
                )}
              </FiltersSwitchWrapper>
            }
          />
          <CompactFiltersLayout isVisible={(!error || !!isBytes32Error) && showFilters}>
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
              maxValue={selectedMaxOutcomes}
              minValue={selectedMinOutcomes}
              onClear={() => {
                setSelectedMinOutcomes(null)
                setSelectedMaxOutcomes(null)
              }}
              onSubmit={(min, max) => {
                setSelectedMinOutcomes(min)
                setSelectedMaxOutcomes(max)
              }}
              title="Outcomes"
            />
            <DateFilter
              fromValue={selectedFromCreationDate}
              onClear={() => {
                setSelectedToCreationDate(null)
                setSelectedFromCreationDate(null)
              }}
              onSubmit={(from, to) => {
                setSelectedFromCreationDate(from)
                setSelectedToCreationDate(to)
              }}
              title="Creation Date"
              toValue={selectedToCreationDate}
            />
          </CompactFiltersLayout>
          <DataTable
            className="outerTableWrapper condensedTable"
            columns={columns}
            conditionalRowStyles={conditionalRowStyles}
            customStyles={customStyles}
            data={showSpinner ? [] : conditionList.length ? conditionList : []}
            highlightOnHover
            noDataComponent={
              showSpinner ? (
                <InlineLoading size={SpinnerSize.regular} />
              ) : error && !isBytes32Error && !isLoading ? (
                <InfoCard message={error.message} title="Error" />
              ) : status === Web3ContextStatus.Infura &&
                selectedOracleValue === OracleFilterOptions.Current ? (
                <EmptyContentText>User is not connected to wallet.</EmptyContentText>
              ) : (
                <EmptyContentText>No conditions found.</EmptyContentText>
              )
            }
            noHeader
            onRowClicked={onRowClicked}
            pagination
            paginationPerPage={5}
            paginationResetDefaultPage={resetPagination}
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

export const SelectableConditionTable = withTheme(SelectConditionTable)
