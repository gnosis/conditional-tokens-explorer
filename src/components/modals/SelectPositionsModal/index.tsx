import { useDebounceCallback } from '@react-hook/debounce'
import { Button } from 'components/buttons'
import { ButtonControl, ButtonControlType } from 'components/buttons/ButtonControl'
import { Modal, ModalProps } from 'components/common/Modal'
import { TokenIcon } from 'components/common/TokenIcon'
import { SearchField } from 'components/form/SearchField'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { CellHash } from 'components/table/CellHash'
import { TableControls } from 'components/table/TableControls'
import { TitleValue } from 'components/text/TitleValue'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Position, usePositions } from 'hooks'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'
import { customStyles } from 'theme/tableCustomStyles'

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
  singlePosition?: boolean
  showOnlyPositionsWithBalance?: boolean
  preSelectedPositions?: string[]
  onConfirm?: (positions: Array<Position>) => void
  onRequestClose?: () => void
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
    // removePositionId(position.id)
  }, [])

  const defaultColumns: Array<any> = useMemo(
    () => [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Position) => <CellHash underline value={row.id} />,
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
        name: 'Collateral',
        selector: 'collateralToken',
        sortable: true,
        maxWidth: '150px',
        minWidth: '150px',
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
    [singlePosition, handleSingleAddClick, handleMultiAddClick, singlePosition, selectedPositions]
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
    if (selectedPositions.length) {
      if (onConfirm && typeof onConfirm === 'function') {
        onConfirm(selectedPositions)
      }
    }
  }, [onConfirm, selectedPositions])

  const isLoading = !positionIdToSearch && loading
  const isSearching = positionIdToSearch && loading

  return (
    <Modal
      {...restProps}
      subTitle={singlePosition ? 'Select one Position.' : 'Select multiple Positions.'}
      title={'Select Position'}
    >
      {isLoading && (
        <LoadingWrapper>
          <InlineLoading message="Loading conditions..." />
        </LoadingWrapper>
      )}
      {error && <InfoCard message={error.message} title="Error" />}
      {data && !isLoading && (
        <>
          <TableControls
            start={
              <Search
                onChange={inputHandler}
                placeholder="Search condition id..."
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
              style={{
                width: '100%',
              }}
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
                style={{
                  width: '100%',
                }}
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
