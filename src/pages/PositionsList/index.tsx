import { useDebounceCallback } from '@react-hook/debounce'
import { Position, usePositions } from 'hooks'
import React, { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'

import { ButtonDots } from '../../components/buttons/ButtonDots'
import { ButtonSelectLight } from '../../components/buttons/ButtonSelectLight'
import { Dropdown, DropdownItem, DropdownPosition } from '../../components/common/Dropdown'
import { TokenIcon } from '../../components/common/TokenIcon'
import { SearchField } from '../../components/form/SearchField'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { InfoCard } from '../../components/statusInfo/InfoCard'
import { InlineLoading } from '../../components/statusInfo/InlineLoading'
import { CellHash } from '../../components/table/CellHash'
import { TableControls } from '../../components/table/TableControls'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from '../../contexts/Web3Context'
import { customStyles } from '../../theme/tableCustomStyles'
import { getLogger } from '../../util/logger'

const logger = getLogger('PositionsList')

const dropdownItems = [
  { text: 'Details' },
  { text: 'Redeem' },
  { text: 'Wrap ERC20' },
  { text: 'Unwrap ERC1155' },
]

export const PositionsList = () => {
  const [positionIdToSearch, setPositionIdToSearch] = useState<string>('')
  const [positionIdToShow, setPositionIdToShow] = useState<string>('')
  const debouncedHandler = useDebounceCallback((positionIdToSearch) => {
    setPositionIdToSearch(positionIdToSearch)
  }, 500)
  const inputHandler = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget
      setPositionIdToShow(value)
      debouncedHandler(value)
    },
    [debouncedHandler]
  )
  const { _type: status, networkConfig } = useWeb3ConnectedOrInfura()
  const { data, error, loading } = usePositions(positionIdToSearch)
  const history = useHistory()
  const isLoading = !positionIdToSearch && loading
  const isSearching = positionIdToSearch && loading

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
        try {
          const token = networkConfig && networkConfig.getTokenFromAddress(row.collateralToken)
          return <TokenIcon symbol={(token && token.symbol) || ''} />
        } catch (error) {
          logger.error(error)
          return row.collateralToken
        }
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

  const tokensList = networkConfig
    ? [
        ...networkConfig.getTokens().map((item) => {
          return { content: <TokenIcon symbol={item.symbol} /> }
        }),
      ]
    : []

  const filterItems = [{ content: 'All Collaterals' }, ...tokensList]

  const [selectedFilter, setselectedFilter] = useState(0)

  const filterDropdown = (
    <Dropdown
      dropdownButtonContent={<ButtonSelectLight content={filterItems[selectedFilter].content} />}
      dropdownPosition={DropdownPosition.right}
      items={filterItems.map((item, index) => (
        <DropdownItem key={index} onClick={() => setselectedFilter(index)}>
          {item.content}
        </DropdownItem>
      ))}
    />
  )

  return (
    <>
      <PageTitle>Positions</PageTitle>
      {isLoading && <InlineLoading />}
      {error && <InfoCard message={error.message} title="Error" />}
      {data && !isLoading && (
        <>
          <TableControls
            end={filterDropdown}
            start={
              <SearchField
                onChange={inputHandler}
                placeholder="Search by position id..."
                value={positionIdToShow}
              />
            }
          />
          {isSearching && <InlineLoading />}
          {!isSearching && (
            <DataTable
              className="outerTableWrapper"
              columns={getColumns()}
              customStyles={customStyles}
              data={data || []}
              highlightOnHover
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
