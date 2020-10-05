import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useState } from 'react'
import DataTable from 'react-data-table-component'
import { NavLink, useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { ButtonDots } from 'components/buttons/ButtonDots'
import { Dropdown, DropdownItemCSS, DropdownPosition } from 'components/common/Dropdown'
import { OraclesFilterDropdown } from 'components/common/OraclesFilterDropdown'
import { Switch } from 'components/form/Switch'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { Pill, PillTypes } from 'components/pureStyledComponents/Pill'
import { SearchField } from 'components/search/SearchField'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { CellHash } from 'components/table/CellHash'
import { TableControls } from 'components/table/TableControls'
import { useConditions } from 'hooks/useConditions'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { customStyles } from 'theme/tableCustomStyles'
import { Conditions_conditions } from 'types/generatedGQLForCTE'
import { getLogger } from 'util/logger'
import { LocalStorageManagement, OracleFilterOptions } from 'util/types'

const DropdownItemLink = styled(NavLink)<{ isItemActive?: boolean }>`
  ${DropdownItemCSS}
`

const logger = getLogger('ConditionsList')

export const ConditionsList: React.FC = () => {
  const history = useHistory()
  const { setValue } = useLocalStorage(LocalStorageManagement.ConditionId)

  const [conditionIdToSearch, setConditionIdToSearch] = useState<string>('')
  const [conditionIdToShow, setConditionIdToShow] = useState<string>('')

  const [selectedOracleFilter, setSelectedOracleFilter] = useState<string[]>([])
  const [selectedOracleValue, setSelectedOracleValue] = useState<OracleFilterOptions>(
    OracleFilterOptions.All
  )

  const debouncedHandlerConditionToSearch = useDebounceCallback((conditionIdToSearch) => {
    setConditionIdToSearch(conditionIdToSearch)
  }, 500)

  const onChangeConditionId = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget
      setConditionIdToShow(value)
      debouncedHandlerConditionToSearch(value)
    },
    [debouncedHandlerConditionToSearch]
  )

  const onClearSearch = React.useCallback(() => {
    setConditionIdToShow('')
    debouncedHandlerConditionToSearch('')
  }, [debouncedHandlerConditionToSearch])

  const { data, error, loading } = useConditions({
    conditionId: conditionIdToSearch,
    oracleValue: selectedOracleValue,
    oracleFilter: selectedOracleFilter,
  })

  const isLoading = !conditionIdToSearch && loading
  const isSearching = conditionIdToSearch && loading

  const buildMenuForRow = useCallback(
    ({ id }) => {
      const detailsOption = {
        href: `/conditions/${id}`,
        onClick: undefined,
        text: 'Details',
      }

      const splitOption = {
        href: `/split/`,
        text: 'Split Position',
        onClick: () => {
          setValue(id)
        },
      }

      const mergeOption = {
        href: `/merge/`,
        text: 'Merge Positions',
        onClick: () => {
          setValue(id)
        },
      }

      const reportOption = {
        href: `/report/`,
        text: 'Report Payouts',
        onClick: () => {
          setValue(id)
        },
      }

      return [detailsOption, splitOption, mergeOption, reportOption]
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

  const [searchBy, setSearchBy] = useState('all')
  const dropdownItems = [
    {
      onClick: () => {
        setSearchBy('all')
      },
      placeholder:
        'Search by Condition Id, Question Id, Question Text, Oracle Address, Reporting Address, Creator Address.',
      text: 'All',
    },
    {
      onClick: () => {
        setSearchBy('conditionId')
      },
      placeholder: 'Search by Condition Id',
      text: 'Condition Id',
    },
    {
      onClick: () => {
        setSearchBy('questionId')
      },
      placeholder: 'Search by Question Id',
      text: 'Question Id',
    },
    {
      onClick: () => {
        setSearchBy('questionText')
      },
      placeholder: 'Search by Question Text',
      text: 'Question Text',
    },
    {
      onClick: () => {
        setSearchBy('oracleAddress')
      },
      placeholder: 'Search by Oracle Address',
      text: 'Oracle Address',
    },
    {
      onClick: () => {
        setSearchBy('reportingAddress')
      },
      placeholder: 'Search by Reporting Address',
      text: 'Reporting Address',
    },
    {
      onClick: () => {
        setSearchBy('creatorAddress')
      },
      placeholder: 'Search by Creator Address',
      text: 'Creator Address',
    },
  ]

  logger.log(`Search by ${searchBy}`)

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
            disabled={!data}
            dropdownItems={dropdownItems}
            onChange={onChangeConditionId}
            onClear={onClearSearch}
            value={conditionIdToShow}
          />
        }
        start={
          <Switch
            active={showFilters}
            disabled={!data}
            label="Filters"
            onClick={toggleShowFilters}
          />
          // <OraclesFilterDropdown
          //   onClick={(value: OracleFilterOptions, filter: string[]) => {
          //     setSelectedOracleFilter(filter)
          //     setSelectedOracleValue(value)
          //   }}
          //   value={selectedOracleValue}
          // />
        }
      />
      {error && <InfoCard message={error.message} title="Error" />}
      {!error && (
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
      )}
    </>
  )
}
