import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'

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
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { customStyles } from 'theme/tableCustomStyles'
import { Conditions_conditions } from 'types/generatedGQLForCTE'
import { getRealityQuestionUrl, isOracleRealitio, truncateStringInTheMiddle } from 'util/tools'
import {
  AdvancedFilterConditions,
  ConditionSearchOptions,
  ConditionType,
  ConditionTypeAll,
  LocalStorageManagement,
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
  onRowClicked: (row: Conditions_conditions) => void
  selectedConditionId?: string | undefined
  onClearSelection: () => void
  title?: string
  allowToDisplayOnlyConditionsToReport?: boolean
  refetch?: boolean
}

export const SelectableConditionTable: React.FC<Props> = (props) => {
  const { _type: status, CPKService, address, networkConfig } = useWeb3ConnectedOrInfura()

  const { getValue } = useLocalStorage(LocalStorageManagement.ConditionId)

  const {
    allowToDisplayOnlyConditionsToReport = false,
    onClearSelection,
    onRowClicked,
    refetch,
    selectedConditionId,
    title = 'Conditions',
    ...restProps
  } = props

  const [textToSearch, setTextToSearch] = useState<string>('')
  const [textToShow, setTextToShow] = useState<string>('')
  const [resetPagination, setResetPagination] = useState<boolean>(false)

  const [selectedOracleFilter, setSelectedOracleFilter] = useState<string[]>(() =>
    allowToDisplayOnlyConditionsToReport && address && CPKService
      ? [address.toLowerCase(), CPKService.address.toLowerCase()]
      : []
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

  const dropdownItems = useConditionsSearchOptions(setSearchBy)

  const debouncedHandlerTextToSearch = useDebounceCallback((conditionIdToSearch) => {
    setTextToSearch(conditionIdToSearch)
  }, 500)

  useEffect(() => {
    const localStorageCondition = getValue()
    if (localStorageCondition) {
      setTextToShow(localStorageCondition)
      debouncedHandlerTextToSearch(localStorageCondition)
    }
  }, [getValue, debouncedHandlerTextToSearch])

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
      allowToDisplayOnlyConditionsToReport && address && CPKService
        ? [address.toLowerCase(), CPKService.address.toLowerCase()]
        : []
    )
    setSelectedConditionTypeValue(ConditionTypeAll.all)
    setSelectedConditionTypeFilter(null)
    setSelectedStatus(allowToDisplayOnlyConditionsToReport ? StatusOptions.Open : StatusOptions.All)
    setSelectedMinOutcomes(null)
    setSelectedMaxOutcomes(null)
    setSelectedToCreationDate(null)
    setSelectedFromCreationDate(null)
    setSearchBy(ConditionSearchOptions.ConditionId)
    setTextToSearch('')
    onClearSelection()
  }, [resetPagination, CPKService, address, allowToDisplayOnlyConditionsToReport, onClearSelection])

  // Clear the filters
  useEffect(() => {
    if (!showFilters) {
      resetFilters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFilters])

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
      address &&
      CPKService
    ) {
      setSelectedOracleFilter([address.toLowerCase(), CPKService.address.toLowerCase()])
    }

    if (
      selectedOracleValue === OracleFilterOptions.Current &&
      status === Web3ContextStatus.Infura
    ) {
      setSelectedOracleFilter([])
    }
  }, [status, CPKService, address, selectedOracleValue])

  const { data, error, loading, refetch: refetchConditionList } = useConditionsList(advancedFilters)

  useEffect(() => {
    if (refetch) refetchConditionList()
  }, [refetch, refetchConditionList])

  const [conditionList, setConditionList] = useState<Conditions_conditions[]>([])

  useEffect(() => {
    if (!data || !data.conditions) {
      setConditionList([])
    } else {
      setConditionList(data.conditions)
    }
  }, [data])

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
        sortable: false,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => {
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
            start={<Switch active={showFilters} label="Filters" onClick={toggleShowFilters} />}
          />
          {error && !isBytes32Error && !isLoading && (
            <InfoCard message={error.message} title="Error" />
          )}
          {(!error || isBytes32Error) && showFilters && (
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
