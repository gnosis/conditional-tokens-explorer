import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useState } from 'react'
import DataTable from 'react-data-table-component'
import { NavLink, useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { ButtonDots } from 'components/buttons/ButtonDots'
import { Dropdown, DropdownItemCSS, DropdownPosition } from 'components/common/Dropdown'
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
import { CellHash } from 'components/table/CellHash'
import { TableControls } from 'components/table/TableControls'
import { useConditionsList } from 'hooks/useConditionsList'
import { useConditionsSearchOptions } from 'hooks/useConditionsSearchOptions'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { customStyles } from 'theme/tableCustomStyles'
import { Conditions_conditions } from 'types/generatedGQLForCTE'
import { getLogger } from 'util/logger'
import {
  AdvancedFilter,
  ConditionSearchOptions,
  ConditionType,
  ConditionTypeAll,
  FromToCreationDateOptions,
  LocalStorageManagement,
  MinMaxOutcomesOptions,
  OracleFilterOptions,
  StatusOptions,
} from 'util/types'

const DropdownItemLink = styled(NavLink)<{ isItemActive?: boolean }>`
  ${DropdownItemCSS}
`

const logger = getLogger('ConditionsList')

export const ConditionsList: React.FC = () => {
  const history = useHistory()
  const { setValue } = useLocalStorage(LocalStorageManagement.ConditionId)

  const [textToSearch, setTextToSearch] = useState<string>('')
  const [textToShow, setTextToShow] = useState<string>('')

  const [selectedOracleFilter, setSelectedOracleFilter] = useState<string[]>([])
  const [selectedOracleValue, setSelectedOracleValue] = useState<OracleFilterOptions>(
    OracleFilterOptions.All
  )
  const [selectedStatus, setSelectedStatus] = useState<StatusOptions>(StatusOptions.All)
  const [selectedMinMaxOutcomes, setSelectedMinMaxOutcomes] = useState<
    Maybe<MinMaxOutcomesOptions>
  >(null)
  const [selectedFromToCreationDate, setSelectedFromToCreationDate] = useState<
    Maybe<FromToCreationDateOptions>
  >(null)
  const [selectedConditionTypeFilter, setSelectedConditionTypeFilter] = useState<Maybe<string>>(
    null
  )
  const [selectedConditionTypeValue, setSelectedConditionTypeValue] = useState<
    ConditionType | ConditionTypeAll
  >(ConditionTypeAll.all)

  const [searchBy, setSearchBy] = useState<ConditionSearchOptions>(
    ConditionSearchOptions.ConditionId
  )
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

  const advancedFilters: AdvancedFilter = {
    ReporterOracle: {
      type: selectedOracleValue,
      value: selectedOracleFilter,
    },
    ConditionType: {
      type: selectedConditionTypeValue,
      value: selectedConditionTypeFilter,
    },
    Status: selectedStatus,
    MinMaxOutcomes: selectedMinMaxOutcomes,
    FromToCreationDate: selectedFromToCreationDate,
    TextToSearch: {
      type: searchBy,
      value: textToSearch,
    },
  }

  const { data, error, loading } = useConditionsList(advancedFilters)

  const isLoading = !textToSearch && loading
  const isSearching = textToSearch && loading

  const buildMenuForRow = useCallback(
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

  const handleRowClick = useCallback(
    (row: Conditions_conditions) => {
      history.push(`/conditions/${row.id}`)
    },
    [history]
  )

  const columns = [
    {
      // eslint-disable-next-line react/display-name
      cell: (row: Conditions_conditions) => (
        <CellHash href={`/conditions/${row.id}`} value={row.id} />
      ),
      name: 'Condition Id',
      selector: 'createTimestamp',
      sortable: true,
    },
    {
      // eslint-disable-next-line react/display-name
      cell: (row: Conditions_conditions) => (
        <CellHash onClick={() => handleRowClick(row)} value={row.oracle} />
      ),
      name: 'Reporting Address / Oracle',
      selector: 'oracle',
      sortable: true,
    },
    {
      // eslint-disable-next-line react/display-name
      cell: (row: Conditions_conditions) => (
        <CellHash onClick={() => handleRowClick(row)} value={row.questionId} />
      ),
      name: 'Question Id',
      selector: 'questionId',
      sortable: true,
    },
    {
      maxWidth: '150px',
      name: 'Outcomes',
      right: true,
      selector: 'outcomeSlotCount',
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
  ]

  const [showFilters, setShowFilters] = useState(false)

  const toggleShowFilters = useCallback(() => {
    setShowFilters(!showFilters)
  }, [showFilters])

  const showSpinner = (isLoading || isSearching) && !error

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
      {error && !isLoading && <InfoCard message={error.message} title="Error" />}
      {!error && (
        <TwoColumnsCollapsibleLayout isCollapsed={!showFilters}>
          {showFilters && (
            <Sidebar>
              <SidebarRow>
                <OraclesFilterDropdown
                  onClick={(value: OracleFilterOptions, filter: string[]) => {
                    setSelectedOracleFilter(filter)
                    setSelectedOracleValue(value)
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
                    const value = min && max ? { min, max } : null
                    setSelectedMinMaxOutcomes(value)
                  }}
                  title="Number Of Outcomes"
                />
              </SidebarRow>
              <SidebarRow>
                <DateFilter
                  onSubmit={(from, to) => {
                    const value = to && from ? { from, to } : null
                    setSelectedFromToCreationDate(value)
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
              ) : (
                <EmptyContentText>No conditions found.</EmptyContentText>
              )
            }
            noHeader
            onRowClicked={handleRowClick}
            pagination
            responsive
          />
        </TwoColumnsCollapsibleLayout>
      )}
    </>
  )
}
