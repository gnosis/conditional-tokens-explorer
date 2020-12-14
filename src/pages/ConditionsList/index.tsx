import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { NavLink, useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { ButtonCopy } from 'components/buttons/ButtonCopy'
import { ButtonDots } from 'components/buttons/ButtonDots'
import {
  Dropdown,
  DropdownItemCSS,
  DropdownItemProps,
  DropdownPosition,
} from 'components/common/Dropdown'
import { ConditionTypeFilterDropdown } from 'components/filters/ConditionTypeFilterDropdown'
import { DateFilter } from 'components/filters/DateFilter'
import { MinMaxFilter } from 'components/filters/MinMaxFilter'
import { OraclesFilterDropdown } from 'components/filters/OraclesFilterDropdown'
import { StatusFilterDropdown } from 'components/filters/StatusFilterDropdown'
import { SearchField } from 'components/form/SearchField'
import { Switch } from 'components/form/Switch'
import { ExternalLink } from 'components/navigation/ExternalLink'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import {
  FilterResultsControl,
  FilterResultsText,
} from 'components/pureStyledComponents/FilterResultsText'
import { FiltersSwitchWrapper } from 'components/pureStyledComponents/FiltersSwitchWrapper'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { Pill, PillTypes } from 'components/pureStyledComponents/Pill'
import { Sidebar } from 'components/pureStyledComponents/Sidebar'
import { SidebarRow } from 'components/pureStyledComponents/SidebarRow'
import { TwoColumnsCollapsibleLayout } from 'components/pureStyledComponents/TwoColumnsCollapsibleLayout'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { TableControls } from 'components/table/TableControls'
import { Hash } from 'components/text/Hash'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useConditionsList } from 'hooks/useConditionsList'
import { useConditionsSearchOptions } from 'hooks/useConditionsSearchOptions'
import { customStyles } from 'theme/tableCustomStyles'
import { GetCondition_condition } from 'types/generatedGQLForCTE'
import { getLogger } from 'util/logger'
import { formatTSSimple, getRealityQuestionUrl, isOracleRealitio } from 'util/tools'
import {
  AdvancedFilterConditions,
  ConditionSearchOptions,
  ConditionType,
  ConditionTypeAll,
  OracleFilterOptions,
  StatusOptions,
} from 'util/types'

const DropdownItemLink = styled(NavLink)<DropdownItemProps>`
  ${DropdownItemCSS}
`

const logger = getLogger('ConditionsList')

export const ConditionsList: React.FC = () => {
  const { _type: status, address, cpkAddress, networkConfig } = useWeb3ConnectedOrInfura()

  const history = useHistory()

  const [textToSearch, setTextToSearch] = useState<string>('')
  const [textToShow, setTextToShow] = useState<string>('')
  const [resetPagination, setResetPagination] = useState<boolean>(false)

  const [selectedOracleFilter, setSelectedOracleFilter] = useState<string[]>([])
  const [selectedOracleValue, setSelectedOracleValue] = useState<OracleFilterOptions>(
    OracleFilterOptions.All
  )
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
  const [searchBy, setSearchBy] = useState<ConditionSearchOptions>(
    ConditionSearchOptions.ConditionId
  )
  const [showFilters, setShowFilters] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)

  const dropdownItems = useConditionsSearchOptions(setSearchBy)

  logger.log(`Search by ${searchBy}`)

  const debouncedHandlerTextToSearch = useDebounceCallback((conditionIdToSearch) => {
    setTextToSearch(conditionIdToSearch)
  }, 500)

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
    setSelectedOracleValue(OracleFilterOptions.All)
    setSelectedOracleFilter([])
    setSelectedConditionTypeValue(ConditionTypeAll.all)
    setSelectedConditionTypeFilter(null)
    setSelectedStatus(StatusOptions.All)
    setSelectedMinOutcomes(null)
    setSelectedMaxOutcomes(null)
    setSelectedToCreationDate(null)
    setSelectedFromCreationDate(null)
  }, [resetPagination])

  useEffect(() => {
    setIsFiltering(
      selectedOracleValue !== OracleFilterOptions.All ||
        selectedOracleFilter.length > 0 ||
        selectedConditionTypeValue !== ConditionTypeAll.all ||
        selectedConditionTypeFilter !== null ||
        selectedStatus !== StatusOptions.All ||
        selectedMinOutcomes !== null ||
        selectedMaxOutcomes !== null ||
        selectedToCreationDate !== null ||
        selectedFromCreationDate !== null
    )
  }, [
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
      address &&
      cpkAddress
    ) {
      setSelectedOracleFilter([cpkAddress.toLowerCase(), address.toLowerCase()])
    }

    if (
      selectedOracleValue === OracleFilterOptions.Current &&
      status === Web3ContextStatus.Infura
    ) {
      setSelectedOracleFilter([])
    }
  }, [status, cpkAddress, address, selectedOracleValue])

  const { data, error, loading } = useConditionsList(advancedFilters)

  const isLoading = useMemo(() => !textToSearch && loading, [textToSearch, loading])
  const isSearching = useMemo(() => textToSearch && loading, [textToSearch, loading])
  const isConnected = useMemo(() => status === Web3ContextStatus.Connected, [status])

  const buildMenuForRow = useCallback(
    (row: GetCondition_condition) => {
      const { id, oracle, resolved } = row
      const isAllowedToReport = cpkAddress && cpkAddress.toLowerCase() === oracle.toLowerCase()

      const menu = [
        {
          href: `/conditions/${id}`,
          text: 'Details',
          onClick: undefined,
        },
        {
          href: `/split/${id}`,
          text: 'Split Position',
          disabled: !isConnected,
        },
        {
          href: `/report/${id}`,
          text: 'Report Payouts',
          disabled: resolved || !isConnected || !isAllowedToReport,
        },
      ]

      return menu
    },
    [cpkAddress, isConnected]
  )

  const handleRowClick = useCallback(
    (row: GetCondition_condition) => {
      history.push(`/conditions/${row.id}`)
    },
    [history]
  )

  const columns = useMemo(
    () => [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: GetCondition_condition) => (
          <Hash href={`/conditions/${row.id}`} value={row.id} />
        ),
        maxWidth: '270px',
        minWidth: '270px',
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
            <Hash onClick={() => handleRowClick(row)} value={oracle} />
          )
          return oracleName
        },
        maxWidth: '250px',
        minWidth: '250px',
        name: 'Reporter / Oracle',
        sortable: false,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: GetCondition_condition) => (
          <Hash onClick={() => handleRowClick(row)} value={row.questionId} />
        ),
        maxWidth: '250px',
        minWidth: '250px',
        name: 'Question Id',
        selector: 'questionId',
        sortable: true,
      },
      {
        maxWidth: '110px',
        minWidth: '110px',
        name: 'Outcomes',
        right: true,
        selector: 'outcomeSlotCount',
        sortable: true,
      },
      {
        cell: (row: GetCondition_condition) => formatTSSimple(row.createTimestamp),
        maxWidth: '170px',
        minWidth: '170px',
        name: 'Creation Date',
        right: true,
        selector: 'createTimestamp',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: GetCondition_condition) =>
          row.resolved ? (
            <Pill onClick={() => handleRowClick(row)} type={PillTypes.primary}>
              Resolved
            </Pill>
          ) : (
            <Pill onClick={() => handleRowClick(row)} type={PillTypes.open}>
              Open
            </Pill>
          ),
        center: true,
        name: 'Status',
        selector: 'resolved',
        sortable: true,
        sortFunction: (a: GetCondition_condition, b: GetCondition_condition) => {
          const valA = a.resolved ? 2 : 1
          const valB = b.resolved ? 2 : 1
          return valA - valB
        },
        minWidth: '110px',
        maxWidth: '110px',
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: GetCondition_condition) => (
          <Dropdown
            activeItemHighlight={false}
            dropdownButtonContent={<ButtonDots />}
            dropdownPosition={DropdownPosition.right}
            items={buildMenuForRow(row).map((item, index) => (
              <DropdownItemLink
                disabled={item.disabled}
                key={index}
                onMouseDown={item.onClick}
                to={item.href}
              >
                {item.text}
              </DropdownItemLink>
            ))}
          />
        ),
        minWidth: '60px',
        name: '',
        right: true,
      },
    ],
    [buildMenuForRow, handleRowClick, networkConfig]
  )

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

  useEffect(() => {
    resetFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <>
      <PageTitle>Conditions</PageTitle>
      <TableControls
        end={
          <SearchField
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
              <FilterResultsText>
                Showing {isFiltering ? 'filtered' : 'all'} results -{' '}
                <FilterResultsControl disabled={!isFiltering} onClick={resetFilters}>
                  Clear Filters
                </FilterResultsControl>
              </FilterResultsText>
            )}
          </FiltersSwitchWrapper>
        }
      />
      {error && !isBytes32Error && !isLoading && <InfoCard message={error.message} title="Error" />}
      {(!error || isBytes32Error) && (
        <TwoColumnsCollapsibleLayout isCollapsed={!showFilters}>
          <Sidebar isVisible={showFilters}>
            <SidebarRow>
              <OraclesFilterDropdown
                onClick={(value: OracleFilterOptions, filter: string[]) => {
                  setSelectedOracleFilter(filter)
                  setSelectedOracleValue(value)
                  setResetPagination(!resetPagination)
                }}
                value={selectedOracleValue}
              />
            </SidebarRow>
            <SidebarRow>
              <StatusFilterDropdown
                onClick={(value: StatusOptions) => {
                  setSelectedStatus(value)
                }}
                value={selectedStatus}
              />
            </SidebarRow>
            <SidebarRow>
              <ConditionTypeFilterDropdown
                onClick={(value: ConditionType | ConditionTypeAll, filter: Maybe<string>) => {
                  setSelectedConditionTypeFilter(filter)
                  setSelectedConditionTypeValue(value)
                }}
                value={selectedConditionTypeValue}
              />
            </SidebarRow>
            <SidebarRow>
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
            </SidebarRow>
            <SidebarRow>
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
            </SidebarRow>
          </Sidebar>
          <DataTable
            className="outerTableWrapper"
            columns={columns}
            customStyles={customStyles}
            data={showSpinner ? [] : data || []}
            highlightOnHover
            noDataComponent={
              showSpinner ? (
                <InlineLoading />
              ) : status === Web3ContextStatus.Infura &&
                selectedOracleValue === OracleFilterOptions.Current ? (
                <EmptyContentText>User is not connected to wallet.</EmptyContentText>
              ) : (
                <EmptyContentText>No conditions found.</EmptyContentText>
              )
            }
            noHeader
            onRowClicked={handleRowClick}
            pagination
            paginationResetDefaultPage={resetPagination}
            responsive
          />
        </TwoColumnsCollapsibleLayout>
      )}
    </>
  )
}
