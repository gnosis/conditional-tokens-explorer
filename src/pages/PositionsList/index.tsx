import { Position, usePositions } from 'hooks'
import React, { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'

import { ButtonDots } from '../../components/buttons/ButtonDots'
import { Dropdown, DropdownItem, DropdownPosition } from '../../components/common/Dropdown'
import { TokenIcon } from '../../components/common/TokenIcon'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { InfoCard } from '../../components/statusInfo/InfoCard'
import { InlineLoading } from '../../components/statusInfo/InlineLoading'
import { CellHash } from '../../components/table/CellHash'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from '../../contexts/Web3Context'
import { tableStyles } from '../../theme/tableStyles'

const dropdownItems = [
  { text: 'Details' },
  { text: 'Redeem' },
  { text: 'Wrap ERC20' },
  { text: 'Unwrap ERC1155' },
]

export const PositionsList = () => {
  const [searchPositionId, setSearchPositionId] = React.useState('')
  const { _type: status, networkConfig } = useWeb3ConnectedOrInfura()
  const { data, error, loading } = usePositions(searchPositionId)
  const history = useHistory()

  const handleRowClick = (row: Position) => {
    history.push(`/positions/${row.id}`)
  }

  const defaultColumns: Array<any> = [
    {
      // eslint-disable-next-line react/display-name
      cell: (row: Position) => (
        <CellHash onClick={() => handleRowClick(row)} underline value={row.id} />
      ),
      name: 'Position Id',
      selector: 'id',
      sortable: true,
    },
    {
      // eslint-disable-next-line react/display-name
      cell: (row: Position) => {
        return <TokenIcon symbol={networkConfig.getTokenFromAddress(row.collateralToken).symbol} />
        // return <CellHash onClick={() => handleRowClick(row)} underline value={row.id} />
      },
      name: 'Collateral',
      selector: 'collateralToken',
      sortable: true,
    },
  ]
  const [connectedItems, setConnectedItems] = useState<Array<any>>([])

  useEffect(() => {
    if (status === Web3ContextStatus.Connected) {
      setConnectedItems([
        {
          // eslint-disable-next-line react/display-name
          cell: (row: Position) => row.userBalance.toString(),
          name: 'ERC1155 Amount',
          right: true,
          selector: 'userBalance',
          sortable: true,
        },
        {
          // eslint-disable-next-line react/display-name
          cell: (row: Position) => (
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
      ])
    }
  }, [status])

  const getColumns = useCallback(() => {
    return [...defaultColumns, ...connectedItems]
  }, [connectedItems, defaultColumns])

  return (
    <>
      <PageTitle>Positions</PageTitle>
      {loading && <InlineLoading />}
      {error && <InfoCard message={error.message} title="Error" />}
      {
        <input
          onChange={(e) => setSearchPositionId(e.currentTarget.value)}
          placeholder="Search position..."
          type="text"
          value={searchPositionId}
        />
      }
      {data && !loading && (
        <DataTable
          className="outerTableWrapper"
          columns={getColumns()}
          customStyles={tableStyles}
          data={data || []}
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
