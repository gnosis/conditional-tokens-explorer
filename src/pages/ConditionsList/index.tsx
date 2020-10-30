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
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { customStyles } from 'theme/tableCustomStyles'
import { Conditions_conditions } from 'types/generatedGQLForCTE'
import { getLogger } from 'util/logger'
import { formatTSSimple, getRealityQuestionUrl, isOracleRealitio } from 'util/tools'
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
  const { _type: status, CPKService, address, networkConfig } = useWeb3ConnectedOrInfura()

  const history = useHistory()
  const { setValue } = useLocalStorage(LocalStorageManagement.ConditionId)

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

  // Clear the filters
  useEffect(() => {
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

  const { data, error, loading } = useConditionsList(advancedFilters)

  const isLoading = useMemo(() => !textToSearch && loading, [textToSearch, loading])
  const isSearching = useMemo(() => textToSearch && loading, [textToSearch, loading])
  const isConnected = useMemo(() => status === Web3ContextStatus.Connected, [status])

  const buildMenuForRow = useCallback(
    (row: Conditions_conditions) => {
      const { id, resolved } = row

      const menu = [
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
          disabled: !isConnected,
        },
        {
          href: `/merge/`,
          text: 'Merge Positions',
          onClick: () => {
            setValue(id)
          },
          disabled: !isConnected,
        },
        {
          href: `/report/`,
          text: 'Report Payouts',
          onClick: () => {
            setValue(id)
          },
          disabled: resolved || !isConnected,
        },
      ]

      return menu
    },
    [setValue, isConnected]
  )

  const handleRowClick = useCallback(
    (row: Conditions_conditions) => {
      history.push(`/conditions/${row.id}`)
    },
    [history]
  )

  const columns = useMemo(
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
            <Hash onClick={() => handleRowClick(row)} value={oracle} />
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
        name: '',
        width: '60px',
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
