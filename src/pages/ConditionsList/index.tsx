import { useDebounceCallback } from '@react-hook/debounce'
import React from 'react'
import DataTable from 'react-data-table-component'
import { NavLink, useHistory } from 'react-router-dom'
import styled from 'styled-components'

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
import { Switch } from 'components/form/Switch'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { Pill, PillTypes } from 'components/pureStyledComponents/Pill'
import { Sidebar } from 'components/pureStyledComponents/Sidebar'
import { SidebarRow } from 'components/pureStyledComponents/SidebarRow'
import { TwoColumnsCollapsibleLayout } from 'components/pureStyledComponents/TwoColumnsCollapsibleLayout'
import { SearchField } from 'components/search/SearchField'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { TableControls } from 'components/table/TableControls'
import { Hash } from 'components/text/Hash'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useConditionsList } from 'hooks/useConditionsList'
import { useConditionsSearchOptions } from 'hooks/useConditionsSearchOptions'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { customStyles } from 'theme/tableCustomStyles'
import { Conditions_conditions } from 'types/generatedGQLForCTE'
import { getLogger } from 'util/logger'
import { formatTSSimple } from 'util/tools'
import {
  AdvancedFilterConditions,
  ConditionSearchOptions,
  ConditionType,
  ConditionTypeAll,
  LocalStorageManagement,
  OracleFilterOptions,
  StatusOptions,
} from 'util/types'

const DropdownItemLink = styled(NavLink)<DropdownItemProps>`
  ${DropdownItemCSS}
`

const logger = getLogger('ConditionsList')

export const ConditionsList: React.FC = () => {
  const { _type: status, CPKService, address } = useWeb3ConnectedOrInfura()

  const history = useHistory()
  const { setValue } = useLocalStorage(LocalStorageManagement.ConditionId)

  const [textToSearch, setTextToSearch] = React.useState<string>('')
  const [textToShow, setTextToShow] = React.useState<string>('')
  const [resetPagination, setResetPagination] = React.useState<boolean>(false)

  const [selectedOracleFilter, setSelectedOracleFilter] = React.useState<string[]>([])
  const [selectedOracleValue, setSelectedOracleValue] = React.useState<OracleFilterOptions>(
    OracleFilterOptions.All
  )
  const [selectedStatus, setSelectedStatus] = React.useState<StatusOptions>(StatusOptions.All)
  const [selectedMinOutcomes, setSelectedMinOutcomes] = React.useState<Maybe<number>>(null)
  const [selectedMaxOutcomes, setSelectedMaxOutcomes] = React.useState<Maybe<number>>(null)
  const [selectedFromCreationDate, setSelectedFromCreationDate] = React.useState<Maybe<number>>(
    null
  )
  const [selectedToCreationDate, setSelectedToCreationDate] = React.useState<Maybe<number>>(null)
  const [selectedConditionTypeFilter, setSelectedConditionTypeFilter] = React.useState<
    Maybe<string>
  >(null)
  const [selectedConditionTypeValue, setSelectedConditionTypeValue] = React.useState<
    ConditionType | ConditionTypeAll
  >(ConditionTypeAll.all)
  const [searchBy, setSearchBy] = React.useState<ConditionSearchOptions>(
    ConditionSearchOptions.ConditionId
  )
  const [showFilters, setShowFilters] = React.useState(false)

  const dropdownItems = useConditionsSearchOptions(setSearchBy)

  logger.log(`Search by ${searchBy}`)

  const debouncedHandlerTextToSearch = useDebounceCallback((conditionIdToSearch) => {
    setTextToSearch(conditionIdToSearch)
  }, 500)

  const onChangeSearch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget
      setTextToShow(value)
      debouncedHandlerTextToSearch(value)
    },
    [debouncedHandlerTextToSearch]
  )

  const onClearSearch = React.useCallback(() => {
    setTextToShow('')
    debouncedHandlerTextToSearch('')
  }, [debouncedHandlerTextToSearch])

  // Clear the filters
  React.useEffect(() => {
    if (!showFilters) {
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
      setSearchBy(ConditionSearchOptions.ConditionId)
      setTextToSearch('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFilters])

  const advancedFilters: AdvancedFilterConditions = React.useMemo(() => {
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

  React.useEffect(() => {
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

  const { data, error, loading } = useConditionsList(advancedFilters)

  const isLoading = React.useMemo(() => !textToSearch && loading, [textToSearch, loading])
  const isSearching = React.useMemo(() => textToSearch && loading, [textToSearch, loading])

  const buildMenuForRow = React.useCallback(
    (row: Conditions_conditions) => {
      const { id, resolved } = row

      const menues = [
        {
          href: `/conditions/${id}`,
          text: 'Details',
          onClick: undefined,
        },
        {
          href: `/split/`,
          text: 'Split Position',
          onClick: () => {
            setValue(id)
          },
        },
        {
          href: `/merge/`,
          text: 'Merge Positions',
          onClick: () => {
            setValue(id)
          },
        },
      ]

      if (!resolved) {
        menues.push({
          href: `/report/`,
          text: 'Report Payouts',
          onClick: () => {
            setValue(id)
          },
        })
      }

      return menues
    },
    [setValue]
  )

  const handleRowClick = React.useCallback(
    (row: Conditions_conditions) => {
      history.push(`/conditions/${row.id}`)
    },
    [history]
  )

  const columns = React.useMemo(
    () => [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => (
          <Hash href={`/conditions/${row.id}`} value={row.id} />
        ),
        name: 'Condition Id',
        sortable: false,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => (
          <Hash onClick={() => handleRowClick(row)} value={row.oracle} />
        ),
        name: 'Reporter / Oracle',
        selector: 'oracle',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => (
          <Hash onClick={() => handleRowClick(row)} value={row.questionId} />
        ),
        name: 'Question Id',
        selector: 'questionId',
        sortable: true,
      },
      {
        maxWidth: '100px',
        name: 'Outcomes',
        right: true,
        selector: 'outcomeSlotCount',
        sortable: true,
      },
      {
        cell: (row: Conditions_conditions) => formatTSSimple(row.createTimestamp),
        maxWidth: '150px',
        name: 'Creation Date',
        right: true,
        selector: 'createTimestamp',
        sortable: true,
      },
      {
        center: true,
        name: 'Status',
        selector: 'resolved',
        sortable: true,
        width: '150px',
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) =>
          row.resolved ? (
            <Pill onClick={() => handleRowClick(row)} type={PillTypes.primary}>
              Resolved
            </Pill>
          ) : (
            <Pill onClick={() => handleRowClick(row)} type={PillTypes.open}>
              Open
            </Pill>
          ),
        sortFunction: (a: Conditions_conditions, b: Conditions_conditions) => {
          const valA = a.resolved ? 2 : 1
          const valB = b.resolved ? 2 : 1
          return valA - valB
        },
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => (
          <Dropdown
            activeItemHighlight={false}
            dropdownButtonContent={<ButtonDots />}
            dropdownPosition={DropdownPosition.right}
            items={buildMenuForRow(row).map((item, index) => (
              <DropdownItemLink key={index} onMouseDown={item.onClick} to={item.href}>
                {item.text}
              </DropdownItemLink>
            ))}
          />
        ),
        name: '',
        width: '60px',
        right: true,
      },
    ],
    [buildMenuForRow, handleRowClick]
  )

  const toggleShowFilters = React.useCallback(() => {
    setShowFilters(!showFilters)
  }, [showFilters])

  const showSpinner = React.useMemo(() => (isLoading || isSearching) && !error, [
    isLoading,
    isSearching,
    error,
  ])

  // This is a HACK until this issue was resolved https://github.com/gnosis/hg-subgraph/issues/23
  const isBytes32Error = React.useMemo(
    () => error && error.message.includes('Failed to decode `Bytes` value: `Odd number of digits`'),
    [error]
  )

  React.useEffect(() => {
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
        start={<Switch active={showFilters} label="Filters" onClick={toggleShowFilters} />}
      />
      {error && !isBytes32Error && !isLoading && <InfoCard message={error.message} title="Error" />}
      {(!error || isBytes32Error) && (
        <TwoColumnsCollapsibleLayout isCollapsed={!showFilters}>
          {showFilters && (
            <Sidebar>
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
                  onSubmit={(min, max) => {
                    setSelectedMinOutcomes(min)
                    setSelectedMaxOutcomes(max)
                  }}
                  title="Number Of Outcomes"
                />
              </SidebarRow>
              <SidebarRow>
                <DateFilter
                  onSubmit={(from, to) => {
                    setSelectedFromCreationDate(from)
                    setSelectedToCreationDate(to)
                  }}
                  title="Creation Date"
                />
              </SidebarRow>
            </Sidebar>
          )}
          <DataTable
            className="outerTableWrapper"
            columns={columns}
            customStyles={customStyles}
            data={showSpinner ? [] : data?.conditions || []}
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
