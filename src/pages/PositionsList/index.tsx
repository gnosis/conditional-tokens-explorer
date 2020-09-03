import { useDebounceCallback } from '@react-hook/debounce'
import { Position, usePositions } from 'hooks'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'

import { ButtonDots } from '../../components/buttons/ButtonDots'
import { CollateralFilterDropdown } from '../../components/common/CollateralFilterDropdown'
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
import { CollateralFilterOptions } from '../../util/types'

const logger = getLogger('PositionsList')

export const PositionsList = () => {
  const { _type: status, networkConfig } = useWeb3ConnectedOrInfura()
  const history = useHistory()
  const { setValue } = useLocalStorage('positionid')

  const [positionIdToSearch, setPositionIdToSearch] = useState<string>('')
  const [positionIdToShow, setPositionIdToShow] = useState<string>('')
  const [connectedItems, setConnectedItems] = useState<Array<any>>([])
  const [selectedCollateralFilter, setSelectedCollateralFilter] = useState<string>('')
  const [selectedCollateralValue, setSelectedCollateralValue] = useState<string>(
    CollateralFilterOptions.All
  )

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

  const { data, error, loading } = usePositions(positionIdToSearch, selectedCollateralFilter)

  const isLoading = !positionIdToSearch && loading
  const isSearching = positionIdToSearch && loading

  const buildMenuForRow = useCallback(
    ({ id }) => {
      const detailsOption = {
        text: 'Details',
        onClick: () => history.push(`/positions/${id}`),
      }

      const redeemOption = {
        text: 'Redeem',
        onClick: () => {
          setValue(id)
          history.push(`/redeem`)
        },
      }

      const wrapERC20Option = {
        text: 'Wrap ERC20',
        onClick: () => {
          console.log('wrap not implemented yet')
        },
      }

      const unwrapOption = {
        text: 'Unwrap ERC1155',
        onClick: () => {
          console.log('unwrap not implemented yet')
        },
      }

      return [detailsOption, redeemOption, wrapERC20Option, unwrapOption]
    },
    [history, setValue]
  )

  const handleRowClick = useCallback(
    (row: Position) => {
      history.push(`/positions/${row.id}`)
    },
    [history]
  )

  const menu = useMemo(() => {
    return [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Position) => (
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
  }, [buildMenuForRow])

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
      ])
    }
  }, [status, buildMenuForRow])

  const getColumns = useCallback(() => {
    // If you move this outside of the useCallback, can cause performance issues as a dep of this useCallback
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
            return <TokenIcon symbol={token.symbol} />
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

    return [...defaultColumns, ...connectedItems, ...menu]
  }, [connectedItems, menu, handleRowClick, networkConfig])

  return (
    <>
      <PageTitle>Positions</PageTitle>
      {isLoading && <InlineLoading />}
      {error && <InfoCard message={error.message} title="Error" />}
      {data && !isLoading && !error && (
        <>
          <TableControls
            end={
              <CollateralFilterDropdown
                onClick={(symbol: string, address: string) => {
                  setSelectedCollateralFilter(address)
                  setSelectedCollateralValue(symbol)
                }}
                value={selectedCollateralValue}
              />
            }
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
