import { useQuery } from '@apollo/react-hooks'
import { ConditionsListQuery } from 'queries/conditions'
import React from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'
import { Conditions, Conditions_conditions } from 'types/generatedGQL'

import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { InfoCard } from '../../components/statusInfo/InfoCard'
import { InlineLoading } from '../../components/statusInfo/InlineLoading'
import { tableStyles } from '../../theme/tableStyles'
import { truncateStringInTheMiddle } from '../../util/tools'

const columns = [
  {
    cell: (row: Conditions_conditions) => truncateStringInTheMiddle(row.id, 10, 8),
    name: 'Condition Id',
    selector: 'id',
    sortable: true,
  },
  {
    cell: (row: Conditions_conditions) => truncateStringInTheMiddle(row.oracle, 10, 8),
    name: 'Reporting Address / Oracle',
    selector: 'oracle',
    sortable: true,
  },
  {
    cell: (row: Conditions_conditions) => truncateStringInTheMiddle(row.questionId, 10, 8),
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
    name: 'Status',
    center: true,
    selector: 'resolved',
    sortable: true,
    // eslint-disable-next-line react/display-name
    cell: (row: Conditions_conditions) => <div>{row.resolved ? 'Resolved' : 'Open'}</div>,
    sortFunction: (a: Conditions_conditions, b: Conditions_conditions) => {
      const valA = a.resolved ? 2 : 1
      const valB = b.resolved ? 2 : 1
      return valA - valB
    },
  },
  {
    name: '',
    cell: () => {
      return <div>x</div>
    },
    width: '40px',
  },
]

export const ConditionsList = () => {
  const { data, error, loading } = useQuery<Conditions>(ConditionsListQuery)
  const history = useHistory()

  const handleRowClick = (row: Conditions_conditions) => {
    history.push(`/conditions/${row.id}`)
  }

  return (
    <>
      <PageTitle>Conditions</PageTitle>
      {loading && <InlineLoading />}
      {error && <InfoCard title="Error" />}
      {data && !loading && (
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
      )}
    </>
  )
}
