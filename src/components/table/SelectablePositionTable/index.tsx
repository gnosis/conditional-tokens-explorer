import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'

import { TokenIcon } from 'components/common/TokenIcon'
import { CollateralFilterDropdown } from 'components/filters/CollateralFilterDropdown'
import { DateFilter } from 'components/filters/DateFilter'
import { WrappedCollateralFilterDropdown } from 'components/filters/WrappedCollateralFilterDropdown'
import { SearchField } from 'components/form/SearchField'
import { Switch } from 'components/form/Switch'
import { CompactFiltersLayout } from 'components/pureStyledComponents/CompactFiltersLayout'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { SpinnerSize } from 'components/statusInfo/common'
import { TableControls } from 'components/table/TableControls'
import { FormatHash } from 'components/text/FormatHash'
import { TitleValue } from 'components/text/TitleValue'
import { PositionWithUserBalanceWithDecimals, usePositions } from 'hooks'
import { usePositionsSearchOptions } from 'hooks/usePositionsSearchOptions'
import { customStyles } from 'theme/tableCustomStyles'
import { truncateStringInTheMiddle } from 'util/tools'
import { CollateralFilterOptions, WrappedCollateralOptions } from 'util/types'

const Search = styled(SearchField)`
  min-width: 0;
  width: 400px;
`

const TableControlsStyled = styled(TableControls)`
  padding-top: 13px;
`

interface Props {
  title?: string
}

export const SelectablePositionTable: React.FC<Props> = (props) => {
  const { title = 'Positions', ...restProps } = props
  const [positionIdToSearch, setPositionIdToSearch] = useState<string>('')
  const [positionIdToShow, setPositionIdToShow] = useState<string>('')
  const [positionList, setPositionList] = useState<PositionWithUserBalanceWithDecimals[]>([])
  const [selectedCollateralFilter, setSelectedCollateralFilter] = useState<Maybe<string[]>>(null)
  const [selectedCollateralValue, setSelectedCollateralValue] = useState<string>(
    CollateralFilterOptions.All
  )
  const [wrappedCollateral, setWrappedCollateral] = useState<WrappedCollateralOptions>(
    WrappedCollateralOptions.All
  )
  const [selectedFromCreationDate, setSelectedFromCreationDate] = useState<Maybe<number>>(null)
  const [selectedToCreationDate, setSelectedToCreationDate] = useState<Maybe<number>>(null)

  const debouncedHandlerPositionIdToSearch = useDebounceCallback((positionIdToSearch) => {
    setPositionIdToSearch(positionIdToSearch)
  }, 500)

  const onChangePositionId = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget
      setPositionIdToShow(value)
      debouncedHandlerPositionIdToSearch(value)
    },
    [debouncedHandlerPositionIdToSearch]
  )

  const onClearSearch = React.useCallback(() => {
    setPositionIdToShow('')
    debouncedHandlerPositionIdToSearch('')
  }, [debouncedHandlerPositionIdToSearch])

  const { data, error, loading } = usePositions({
    positionId: positionIdToSearch,
  })

  // Filter selected positions from original list. And positions without balance as indicated by props.
  useEffect(() => {
    if (data) {
      setPositionList(data)
    }
  }, [setPositionList, data])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaultColumns: Array<any> = useMemo(
    () => [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => (
          <FormatHash hash={truncateStringInTheMiddle(row.id, 8, 6)} />
        ),
        maxWidth: '170px',
        name: 'Position Id',
        selector: 'createTimestamp',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => {
          return row.token ? <TokenIcon token={row.token} /> : row.collateralToken
        },
        maxWidth: '140px',
        minWidth: '140px',
        name: 'Collateral',
        selector: 'collateralToken',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => (
          <span
            {...(row.userBalanceERC1155WithDecimals
              ? { title: row.userBalanceERC1155.toString() }
              : {})}
          >
            {row.userBalanceERC1155WithDecimals}
          </span>
        ),
        name: 'ERC1155',
        right: true,
        selector: 'userBalanceERC1155Numbered',
        sortable: true,
      },
    ],
    []
  )

  const [showFilters, setShowFilters] = useState(false)
  const toggleShowFilters = useCallback(() => {
    setShowFilters(!showFilters)
  }, [showFilters])

  const isLoading = !positionIdToSearch && loading
  const isSearching = positionIdToSearch && loading
  const showSpinner = (isLoading || isSearching) && !error

  const [searchBy, setSearchBy] = useState('all')
  const dropdownItems = usePositionsSearchOptions(setSearchBy)

  return (
    <TitleValue
      title={title}
      value={
        <>
          <TableControlsStyled
            end={
              <Search
                dropdownItems={dropdownItems}
                onChange={onChangePositionId}
                onClear={onClearSearch}
                value={positionIdToShow}
              />
            }
            start={<Switch active={showFilters} label="Filters" onClick={toggleShowFilters} />}
          />
          {showFilters && (
            <CompactFiltersLayout>
              <CollateralFilterDropdown
                onClick={(symbol: string, address: Maybe<string[]>) => {
                  setSelectedCollateralFilter(address)
                  setSelectedCollateralValue(symbol)
                }}
                value={selectedCollateralValue}
              />
              <WrappedCollateralFilterDropdown
                onClick={(value: WrappedCollateralOptions) => {
                  setWrappedCollateral(value)
                }}
                value={wrappedCollateral}
              />
              <DateFilter
                onSubmit={(from, to) => {
                  setSelectedFromCreationDate(from)
                  setSelectedToCreationDate(to)
                }}
                title="Creation Date"
              />
            </CompactFiltersLayout>
          )}
          <DataTable
            className="outerTableWrapper condensedTable"
            columns={defaultColumns}
            customStyles={customStyles}
            data={showSpinner ? [] : positionList.length ? positionList : []}
            highlightOnHover
            noDataComponent={
              showSpinner ? (
                <InlineLoading size={SpinnerSize.small} />
              ) : error ? (
                <EmptyContentText>Error: {error.message}</EmptyContentText>
              ) : (
                <EmptyContentText>No positions found.</EmptyContentText>
              )
            }
            noHeader
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 15]}
            pointerOnHover
            responsive
          />
        </>
      }
      {...restProps}
    />
  )
}
