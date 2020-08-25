import { useQuery } from '@apollo/react-hooks'
import { ConditionsListQuery, ConditionsSearchQuery } from 'queries/conditions'
import React, { useState } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'
import { Conditions, Conditions_conditions } from 'types/generatedGQL'

import { ButtonDots } from '../../components/buttons/ButtonDots'
import { ButtonSelect } from '../../components/buttons/ButtonSelect'
import { Dropdown, DropdownItem, DropdownPosition } from '../../components/common/Dropdown'
import { SearchField } from '../../components/form/SearchField'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { Pill, PillTypes } from '../../components/pureStyledComponents/Pill'
import { InfoCard } from '../../components/statusInfo/InfoCard'
import { InlineLoading } from '../../components/statusInfo/InlineLoading'
import { CellHash } from '../../components/table/CellHash'
import { TableControls } from '../../components/table/TableControls'
import { tableStyles } from '../../theme/tableStyles'

export const ConditionsList: React.FC = () => {
  const [conditionIdToSearch, setConditionIdToSearch] = React.useState('')
  const { data, error, loading } = useQuery<Conditions>(
    conditionIdToSearch ? ConditionsSearchQuery : ConditionsListQuery,
    {
      variables: { conditionId: conditionIdToSearch },
    }
  )
  const history = useHistory()

  const dropdownItems = [
    { text: 'Details' },
    { text: 'Split Position' },
    { text: 'Merge Positions' },
    { text: 'Report Payouts' },
  ]

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
          items={dropdownItems.map((item, index) => (
            <DropdownItem key={index} onClick={() => console.log(`${item.text} for ${row.id}`)}>
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
      dropdownButtonContent={<ButtonSelect content={filterItems[selectedFilter].text} />}
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
      {loading && <InlineLoading />}
      {error && <InfoCard message={error.message} title="Error" />}
      {data && !loading && (
        <>
          <TableControls
            end={filterDropdown}
            start={
              <SearchField
                onChange={(e) => setConditionIdToSearch(e.currentTarget.value)}
                placeholder="Search by condition id..."
                value={conditionIdToSearch}
              />
            }
          />
          <DataTable
            className="outerTableWrapper"
            columns={columns}
            customStyles={tableStyles}
            data={data?.conditions || []}
            highlightOnHover
            noHeader
            onRowClicked={handleRowClick}
            pagination={true}
            responsive
          />
        </>
      )}
    </>
  )
}
