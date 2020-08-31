import { useQuery } from '@apollo/react-hooks'
import { useDebounceCallback } from '@react-hook/debounce'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { ConditionsListQuery, ConditionsSearchQuery } from 'queries/conditions'
import React, { useCallback, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'
import { Conditions, Conditions_conditions } from 'types/generatedGQL'

import { ButtonDots } from '../../components/buttons/ButtonDots'
import { ButtonSelectLight } from '../../components/buttons/ButtonSelectLight'
import { Dropdown, DropdownItem, DropdownPosition } from '../../components/common/Dropdown'
import { SearchField } from '../../components/form/SearchField'
import { EmptyContentText } from '../../components/pureStyledComponents/EmptyContentText'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { Pill, PillTypes } from '../../components/pureStyledComponents/Pill'
import { InfoCard } from '../../components/statusInfo/InfoCard'
import { InlineLoading } from '../../components/statusInfo/InlineLoading'
import { CellHash } from '../../components/table/CellHash'
import { TableControls } from '../../components/table/TableControls'
import { customStyles } from '../../theme/tableCustomStyles'

export const ConditionsList: React.FC = () => {
  const [conditionIdToSearch, setConditionIdToSearch] = useState<string>('')
  const [conditionIdToShow, setConditionIdToShow] = useState<string>('')
  const { setValue } = useLocalStorage('conditionid')
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

  const { data, error, loading } = useQuery<Conditions>(
    conditionIdToSearch ? ConditionsSearchQuery : ConditionsListQuery,
    {
      variables: { conditionId: conditionIdToSearch },
    }
  )

  const isLoading = !conditionIdToSearch && loading
  const isSearching = conditionIdToSearch && loading
  const history = useHistory()
  const { _type: status, address } = useWeb3ConnectedOrInfura()
  const isConnected = status === 'connected'

  const buildMenuForRow = useCallback(
    ({ id, oracle }) => {
      const detailsOption = {
        text: 'Details',
        onClick: () => history.push(`/conditions/${id}`),
      }

      const splitOption = {
        text: 'Split Position',
        onClick: () => {
          setValue(id)
          history.push(`/split/`)
        },
      }

      const mergeOption = {
        text: 'Merge Positions',
        onClick: () => {
          setValue(id)
          history.push(`/merge/`)
        },
      }

      const reportOption = {
        text: 'Report Payouts',
        onClick: () => {
          setValue(id)
          history.push(`/report/`)
        },
      }

      if (!isConnected) {
        return [detailsOption]
      }

      return address && oracle.toLowerCase() === address.toLowerCase()
        ? [detailsOption, splitOption, mergeOption, reportOption]
        : [detailsOption, splitOption, mergeOption]
    },
    [isConnected, address, history, setValue]
  )

  const handleRowClick = (row: Conditions_conditions) => {
    history.push(`/conditions/${row.id}`)
  }

  const columns = [
    {
      // eslint-disable-next-line react/display-name
      cell: (row: Conditions_conditions) => (
        <CellHash
          onClick={() => {
            handleRowClick(row)
          }}
          underline
          value={row.id}
        />
      ),
      name: 'Condition Id',
      selector: 'id',
      sortable: true,
    },
    {
      // eslint-disable-next-line react/display-name
      cell: (row: Conditions_conditions) => (
        <CellHash onClick={handleRowClick} value={row.oracle} />
      ),
      name: 'Reporting Address / Oracle',
      selector: 'oracle',
      sortable: true,
    },
    {
      // eslint-disable-next-line react/display-name
      cell: (row: Conditions_conditions) => (
        <CellHash onClick={handleRowClick} value={row.questionId} />
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
          <Pill type={PillTypes.primary}>Resolved</Pill>
        ) : (
          <Pill type={PillTypes.open}>Open</Pill>
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
            <DropdownItem key={index} onClick={item.onClick}>
              {item.text}
            </DropdownItem>
          ))}
        />
      ),
      name: '',
      width: '60px',
      right: true,
    },
  ]

  const filterItems = [
    { text: 'All Reporters / Oracles' },
    { text: 'Custom Reporters' },
    { text: 'Realit.io' },
    { text: 'Kleros' },
  ]

  const [selectedFilter, setselectedFilter] = useState(0)

  const filterDropdown = (
    <Dropdown
      dropdownButtonContent={<ButtonSelectLight content={filterItems[selectedFilter].text} />}
      dropdownPosition={DropdownPosition.right}
      items={filterItems.map((item, index) => (
        <DropdownItem key={index} onClick={() => setselectedFilter(index)}>
          {item.text}
        </DropdownItem>
      ))}
    />
  )

  return (
    <>
      <PageTitle>Conditions</PageTitle>
      {isLoading && <InlineLoading />}
      {error && <InfoCard message={error.message} title="Error" />}
      {data && !isLoading && (
        <>
          <TableControls
            end={filterDropdown}
            start={
              <SearchField
                onChange={inputHandler}
                placeholder="Search by condition id..."
                value={conditionIdToShow}
              />
            }
          />
          {isSearching && <InlineLoading />}
          {!isSearching && (
            <DataTable
              className="outerTableWrapper"
              columns={columns}
              customStyles={customStyles}
              data={data?.conditions || []}
              highlightOnHover
              noDataComponent={<EmptyContentText>No conditions found.</EmptyContentText>}
              noHeader
              onRowClicked={handleRowClick}
              pagination
              responsive
            />
          )}
        </>
      )}
    </>
  )
}
