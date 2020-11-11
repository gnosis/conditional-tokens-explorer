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
import { RadioButton } from 'components/pureStyledComponents/RadioButton'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { SpinnerSize } from 'components/statusInfo/common'
import { TableControls } from 'components/table/TableControls'
import { FormatHash } from 'components/text/FormatHash'
import { TitleValue } from 'components/text/TitleValue'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { PositionWithUserBalanceWithDecimals, usePositionsList } from 'hooks/usePositionsList'
import { usePositionsSearchOptions } from 'hooks/usePositionsSearchOptions'
import { customStyles } from 'theme/tableCustomStyles'
import { truncateStringInTheMiddle } from 'util/tools'
import {
  AdvancedFilterPosition,
  CollateralFilterOptions,
  PositionSearchOptions,
  WrappedCollateralOptions,
} from 'util/types'

const Search = styled(SearchField)`
  min-width: 0;
  width: 400px;
`

const TableControlsStyled = styled(TableControls)`
  padding-top: 13px;
`

const TitleValueExtended = styled(TitleValue)<{ hideTitle?: boolean }>`
  ${(props) => props.hideTitle && 'h2 { display: none;}'}
`

interface Props {
  hideTitle?: boolean
  onRowClicked: (position: PositionWithUserBalanceWithDecimals) => void
  onClearCallback: () => void
  selectedPosition: Maybe<PositionWithUserBalanceWithDecimals>
  title?: string
  clearFilters: boolean
  refetch?: boolean
}

export const SelectablePositionTable: React.FC<Props> = (props) => {
  const {
    clearFilters,
    hideTitle,
    onClearCallback,
    onRowClicked,
    refetch,
    selectedPosition,
    title = 'Positions',
    ...restProps
  } = props

  const { networkConfig } = useWeb3ConnectedOrInfura()

  const [positionList, setPositionList] = useState<PositionWithUserBalanceWithDecimals[]>([])

  const [searchBy, setSearchBy] = useState<PositionSearchOptions>(PositionSearchOptions.PositionId)
  const [textToShow, setTextToShow] = useState<string>('')
  const [textToSearch, setTextToSearch] = useState<string>('')
  const [resetPagination, setResetPagination] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState(false)

  const [selectedCollateralFilter, setSelectedCollateralFilter] = useState<Maybe<string[]>>(null)
  const [selectedCollateralValue, setSelectedCollateralValue] = useState<string>(
    CollateralFilterOptions.All
  )

  const [selectedFromCreationDate, setSelectedFromCreationDate] = useState<Maybe<number>>(null)
  const [selectedToCreationDate, setSelectedToCreationDate] = useState<Maybe<number>>(null)
  const [wrappedCollateral, setWrappedCollateral] = useState<WrappedCollateralOptions>(
    WrappedCollateralOptions.All
  )

  const debouncedHandlerTextToSearch = useDebounceCallback((textToSearch) => {
    setTextToSearch(textToSearch)
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

  const advancedFilters: AdvancedFilterPosition = useMemo(() => {
    return {
      CollateralValue: {
        type: selectedCollateralValue,
        value: selectedCollateralFilter,
      },
      ToCreationDate: selectedToCreationDate,
      FromCreationDate: selectedFromCreationDate,
      TextToSearch: {
        type: searchBy,
        value: textToSearch,
      },
      WrappedCollateral: wrappedCollateral,
    }
  }, [
    wrappedCollateral,
    selectedCollateralValue,
    selectedCollateralFilter,
    selectedToCreationDate,
    selectedFromCreationDate,
    searchBy,
    textToSearch,
  ])

  const { data, error, loading, refetchPositions, refetchUserPositions } = usePositionsList(
    advancedFilters
  )

  // #1 Filter, only positions with balance
  const positionsWithBalance = useMemo(
    () =>
      data &&
      data.length &&
      data.filter(
        (position: PositionWithUserBalanceWithDecimals) => !position.userBalanceERC1155.isZero()
      ),
    [data]
  )

  const resetFilters = useCallback(() => {
    setResetPagination(!resetPagination)
    setSelectedToCreationDate(null)
    setSelectedFromCreationDate(null)
    setSearchBy(PositionSearchOptions.PositionId)
    setTextToSearch('')
    setSelectedCollateralFilter(null)
    setSelectedCollateralValue(CollateralFilterOptions.All)
    setWrappedCollateral(WrappedCollateralOptions.All)
  }, [resetPagination])

  // Clear the filters on network change
  useEffect(() => {
    setShowFilters(false)
    resetFilters()
    onClearCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkConfig, clearFilters])

  // Filter selected positions from original list. And positions without balance as indicated by props.
  useEffect(() => {
    if (positionsWithBalance) {
      setPositionList(positionsWithBalance)
    } else {
      setPositionList([])
    }
  }, [setPositionList, positionsWithBalance])

  useEffect(() => {
    if (refetch) {
      onClearSearch()
      refetchPositions()
      refetchUserPositions()
    }
  }, [refetch, refetchPositions, refetchUserPositions, onClearSearch])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaultColumns: Array<any> = useMemo(
    () => [
      {
        // eslint-disable-next-line react/display-name
        cell: (position: PositionWithUserBalanceWithDecimals) => (
          <RadioButton
            checked={!!(selectedPosition && selectedPosition?.id === position.id)}
            onClick={() => onRowClicked(position)}
          />
        ),
        maxWidth: '12px',
        minWidth: '12px',
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => (
          <FormatHash
            hash={truncateStringInTheMiddle(row.id, 8, 6)}
            onClick={() => onRowClicked(row)}
          />
        ),
        maxWidth: '170px',
        name: 'Position Id',
        selector: 'createTimestamp',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => {
          return row.token ? (
            <TokenIcon onClick={() => onRowClicked(row)} token={row.token} />
          ) : (
            row.collateralToken
          )
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
          <span onClick={() => onRowClicked(row)}>{row.userBalanceERC1155WithDecimals}</span>
        ),
        name: 'ERC1155',
        right: true,
        selector: 'userBalanceERC1155Numbered',
        sortable: true,
      },
    ],
    [onRowClicked, selectedPosition]
  )

  const toggleShowFilters = useCallback(() => {
    setShowFilters(!showFilters)
  }, [showFilters])

  // Clear the filters
  useEffect(() => {
    if (!showFilters) {
      resetFilters()
      onClearCallback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFilters])

  const isLoading = useMemo(() => !textToSearch && loading, [textToSearch, loading])
  const isSearching = useMemo(() => textToSearch && loading, [textToSearch, loading])

  const showSpinner = useMemo(() => (isLoading || isSearching) && !error, [
    isLoading,
    isSearching,
    error,
  ])

  const dropdownItems = usePositionsSearchOptions(setSearchBy)

  useEffect(() => {
    if (
      textToSearch !== '' ||
      wrappedCollateral !== WrappedCollateralOptions.All ||
      selectedCollateralValue !== CollateralFilterOptions.All ||
      selectedCollateralFilter ||
      selectedToCreationDate ||
      selectedFromCreationDate
    ) {
      setResetPagination(!resetPagination)
    }
    onClearCallback()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    textToSearch,
    wrappedCollateral,
    selectedCollateralValue,
    selectedCollateralFilter,
    selectedToCreationDate,
    selectedFromCreationDate,
  ])

  return (
    <TitleValueExtended
      hideTitle={hideTitle}
      title={title}
      value={
        <>
          <TableControlsStyled
            end={
              <Search
                dropdownItems={dropdownItems}
                onChange={onChangeSearch}
                onClear={onClearSearch}
                value={textToShow}
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
            onRowClicked={onRowClicked}
            pagination
            paginationPerPage={5}
            paginationResetDefaultPage={resetPagination}
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
