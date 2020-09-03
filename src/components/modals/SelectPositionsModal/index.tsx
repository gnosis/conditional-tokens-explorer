import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'

import { Web3ContextStatus, useWeb3ConnectedOrInfura } from '../../../contexts/Web3Context'
import { Position, usePositions } from '../../../hooks'
import { customStyles } from '../../../theme/tableCustomStyles'
import { truncateStringInTheMiddle } from '../../../util/tools'
import { Button } from '../../buttons'
import { ButtonControl, ButtonControlType } from '../../buttons/ButtonControl'
import { Modal, ModalProps } from '../../common/Modal'
import { TokenIcon } from '../../common/TokenIcon'
import { SearchField } from '../../form/SearchField'
import { ButtonContainer } from '../../pureStyledComponents/ButtonContainer'
import { EmptyContentText } from '../../pureStyledComponents/EmptyContentText'
import { InfoCard } from '../../statusInfo/InfoCard'
import { InlineLoading } from '../../statusInfo/InlineLoading'
import { TableControls } from '../../table/TableControls'
import { TitleValue } from '../../text/TitleValue'

const LoadingWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 400px;
`

const SearchingWrapper = styled(LoadingWrapper)`
  min-height: 348px;
`

const Search = styled(SearchField)`
  max-width: 210px;
`

interface Props extends ModalProps {
  isOpen: boolean
  onConfirm?: (positions: Array<Position>) => void
  onRequestClose?: () => void
  preSelectedPositions?: string[]
  showOnlyPositionsWithBalance?: boolean
  singlePosition?: boolean
}

export const SelectPositionModal: React.FC<Props> = (props) => {
  const {
    onConfirm,
    preSelectedPositions,
    showOnlyPositionsWithBalance,
    singlePosition,
    ...restProps
  } = props
  const { _type: status, networkConfig } = useWeb3ConnectedOrInfura()
  const [selectedPositions, setSelectedPositions] = useState<Array<Position>>([])
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

  const { data, error, loading } = usePositions(positionIdToSearch)

  useEffect(() => {
    if (data && data.length && preSelectedPositions && preSelectedPositions.length) {
      setSelectedPositions((current) => {
        const currentIds = current.map(({ id }) => id)
        const filteredPre = preSelectedPositions.filter((pre) => !currentIds.includes(pre))
        return [...current, ...data.filter(({ id }) => filteredPre.includes(id))]
      })
    }
  }, [preSelectedPositions, data])

  const handleMultiAddClick = useCallback((position: Position) => {
    setSelectedPositions((current) => {
      const included = current.find((selected) => selected.id === position.id)
      return included ? current : [...current, position]
    })
  }, [])

  const handleSingleAddClick = useCallback((position: Position) => {
    setSelectedPositions([position])
  }, [])

  const handleRemoveClick = useCallback((position: Position) => {
    setSelectedPositions((current) => {
      return current.filter((selected) => selected.id !== position.id)
    })
  }, [])

  const defaultColumns: Array<any> = useMemo(
    () => [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Position) => truncateStringInTheMiddle(row.id, 8, 6),
        maxWidth: '160px',
        name: 'Position Id',
        selector: 'id',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Position) => {
          return networkConfig ? (
            <TokenIcon symbol={networkConfig.getTokenFromAddress(row.collateralToken).symbol} />
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
    ],
    [networkConfig]
  )

  const addCell = useMemo(
    () => ({
      name: '',
      button: true,
      ignoreRowClick: true,
      maxWidth: '36px',
      minWidth: '36px',
      // eslint-disable-next-line react/display-name
      cell: (row: Position) => (
        <ButtonControl
          buttonType={ButtonControlType.add}
          disabled={!!(singlePosition && selectedPositions.length)}
          onClick={() => (singlePosition ? handleSingleAddClick(row) : handleMultiAddClick(row))}
        />
      ),
    }),
    [singlePosition, handleSingleAddClick, handleMultiAddClick, selectedPositions]
  )

  const deleteCell = useMemo(
    () => ({
      name: '',
      button: true,
      ignoreRowClick: true,
      maxWidth: '36px',
      minWidth: '36px',
      // eslint-disable-next-line react/display-name
      cell: (row: Position) => (
        <ButtonControl
          buttonType={ButtonControlType.delete}
          onClick={() => handleRemoveClick(row)}
        />
      ),
    }),
    [handleRemoveClick]
  )

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
      ])
    }
  }, [status])

  const getPositionsColumns = useCallback(() => {
    return [...defaultColumns, ...connectedItems, addCell]
  }, [connectedItems, defaultColumns, addCell])

  const getSelectedColumns = useCallback(() => {
    return [
      ...defaultColumns.map((col) => ({ ...col, sortable: false })),
      ...connectedItems.map((col) => ({ ...col, sortable: false })),
      deleteCell,
    ]
  }, [defaultColumns, connectedItems, deleteCell])

  const handleDone = useCallback(() => {
    if (selectedPositions.length && onConfirm && typeof onConfirm === 'function') {
      onConfirm(selectedPositions)
    }
  }, [onConfirm, selectedPositions])

  const isLoading = !positionIdToSearch && loading
  const isSearching = positionIdToSearch && loading

  return (
    <Modal
      {...restProps}
      subTitle={singlePosition ? 'Select one position.' : 'Select multiple positions.'}
      title={'Select Position'}
    >
      {isLoading && (
        <LoadingWrapper>
          <InlineLoading message="Loading positions..." />
        </LoadingWrapper>
      )}
      {error && <InfoCard message={error.message} title="Error" />}
      {data && !isLoading && (
        <>
          <TableControls
            start={
              <Search
                onChange={inputHandler}
                placeholder="Search position id..."
                value={positionIdToShow}
              />
            }
          />
          {isSearching ? (
            <SearchingWrapper>
              <InlineLoading />
            </SearchingWrapper>
          ) : (
            <DataTable
              className="outerTableWrapper inlineTable"
              columns={getPositionsColumns()}
              customStyles={customStyles}
              data={
                data
                  ? showOnlyPositionsWithBalance
                    ? data.filter((position) => !position.userBalance.isZero())
                    : data
                  : []
              }
              noDataComponent={
                <EmptyContentText>{`No positions${
                  showOnlyPositionsWithBalance && data.length ? ' with balance' : ''
                } found.`}</EmptyContentText>
              }
              noHeader
              pagination
              paginationPerPage={5}
            />
          )}
          <TitleValue
            title={singlePosition ? 'Selected Position' : 'Selected Positions'}
            value={
              <DataTable
                className="outerTableWrapper inlineTable"
                columns={getSelectedColumns()}
                customStyles={customStyles}
                data={selectedPositions}
                noDataComponent={<EmptyContentText>No positions selected.</EmptyContentText>}
                noHeader
              />
            }
          />
          <ButtonContainer>
            <Button disabled={!selectedPositions.length} onClick={handleDone}>
              Done
            </Button>
          </ButtonContainer>
        </>
      )}
    </Modal>
  )
}
