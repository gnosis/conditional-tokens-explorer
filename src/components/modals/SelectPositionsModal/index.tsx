import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'

import { Button } from 'components/buttons'
import { ButtonControl, ButtonControlType } from 'components/buttons/ButtonControl'
import { Modal, ModalProps } from 'components/common/Modal'
import { TokenIcon } from 'components/common/TokenIcon'
import { SearchField } from 'components/form/SearchField'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { TableControls } from 'components/table/TableControls'
import { TitleValue } from 'components/text/TitleValue'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { PositionWithUserBalanceWithDecimals, usePositions } from 'hooks'
import { customStyles } from 'theme/tableCustomStyles'
import { getTokenSummary, truncateStringInTheMiddle } from 'util/tools'
import { Token } from 'util/types'

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
  onConfirm?: (positions: Array<PositionWithUserBalanceWithDecimals>) => void
  onRequestClose?: () => void
  preSelectedPositions?: string[]
  showOnlyPositionsWithBalance?: boolean
  singlePosition?: boolean
}

type PositionWithUserBalanceWithToken = PositionWithUserBalanceWithDecimals & { token: Token }

export const SelectPositionModal: React.FC<Props> = (props) => {
  const {
    onConfirm,
    preSelectedPositions,
    showOnlyPositionsWithBalance,
    singlePosition,
    ...restProps
  } = props
  const { _type: status, networkConfig, provider } = useWeb3ConnectedOrInfura()
  const [selectedPositions, setSelectedPositions] = useState<
    Array<PositionWithUserBalanceWithDecimals>
  >([])
  const [selectedPositionsWithToken, setSelectedPositionsWithToken] = useState<
    Array<PositionWithUserBalanceWithToken>
  >([])
  const [dataWithToken, setDataWithToken] = useState<Array<PositionWithUserBalanceWithToken>>([])
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

  const { data, error, loading } = usePositions({
    positionId: positionIdToSearch,
  })

  useEffect(() => {
    if (data && data.length && preSelectedPositions && preSelectedPositions.length) {
      setSelectedPositions((current: Array<PositionWithUserBalanceWithDecimals>) => {
        const currentIds = current.map(({ id }) => id)
        const filteredPre = preSelectedPositions.filter((pre) => !currentIds.includes(pre))
        const dataFiltered = data.filter(({ id }) => filteredPre.includes(id))
        return [...current, ...dataFiltered]
      })
    }
  }, [preSelectedPositions, data])

  const handleMultiAddClick = useCallback((position: PositionWithUserBalanceWithDecimals) => {
    setSelectedPositions((current) => {
      const included = current.find((selected) => selected.id === position.id)
      return included ? current : [...current, position]
    })
  }, [])

  const handleSingleAddClick = useCallback((position: PositionWithUserBalanceWithDecimals) => {
    setSelectedPositions([position])
  }, [])

  const handleRemoveClick = useCallback((position: PositionWithUserBalanceWithDecimals) => {
    setSelectedPositions((current) => {
      return current.filter((selected) => selected.id !== position.id)
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    const fetchTokens = async (
      positions: PositionWithUserBalanceWithDecimals[]
    ): Promise<PositionWithUserBalanceWithToken[]> => {
      return Promise.all(
        positions.map(async (position) => {
          const token = await getTokenSummary(networkConfig, provider, position.collateralToken)
          return { ...position, token }
        })
      )
    }

    fetchTokens(selectedPositions).then((positions) => {
      if (!cancelled) {
        setSelectedPositionsWithToken(positions)
      }
    })

    return () => {
      cancelled = true
    }
  }, [selectedPositions, networkConfig, provider])

  useEffect(() => {
    let cancelled = false
    const fetchTokens = async (
      positions: PositionWithUserBalanceWithDecimals[]
    ): Promise<PositionWithUserBalanceWithToken[]> => {
      return Promise.all(
        positions.map(async (position) => {
          const token = await getTokenSummary(networkConfig, provider, position.collateralToken)
          return { ...position, token }
        })
      )
    }

    if (data && !loading) {
      fetchTokens(data).then((positions) => {
        if (!cancelled) {
          setDataWithToken(positions)
        }
      })
    }

    return () => {
      cancelled = true
    }
  }, [data, networkConfig, provider, loading])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaultColumns: Array<any> = useMemo(
    () => [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithToken) => truncateStringInTheMiddle(row.id, 8, 6),
        maxWidth: '170px',
        name: 'Position Id',
        selector: 'id',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithToken) => {
          return row.token.symbol ? <TokenIcon symbol={row.token.symbol} /> : row.collateralToken
        },
        maxWidth: '140px',
        minWidth: '140px',
        name: 'Collateral',
        selector: 'collateralToken',
        sortable: true,
      },
    ],
    []
  )

  const addCell = useMemo(
    () => ({
      name: '',
      button: true,
      ignoreRowClick: true,
      maxWidth: '36px',
      minWidth: '36px',
      // eslint-disable-next-line react/display-name
      cell: (row: PositionWithUserBalanceWithToken) => (
        <ButtonControl
          buttonType={ButtonControlType.add}
          disabled={!!(singlePosition && selectedPositionsWithToken.length)}
          onClick={() => (singlePosition ? handleSingleAddClick(row) : handleMultiAddClick(row))}
        />
      ),
    }),
    [singlePosition, handleSingleAddClick, handleMultiAddClick, selectedPositionsWithToken]
  )

  const deleteCell = useMemo(
    () => ({
      name: '',
      button: true,
      ignoreRowClick: true,
      maxWidth: '36px',
      minWidth: '36px',
      // eslint-disable-next-line react/display-name
      cell: (row: PositionWithUserBalanceWithToken) => (
        <ButtonControl
          buttonType={ButtonControlType.delete}
          onClick={() => handleRemoveClick(row)}
        />
      ),
    }),
    [handleRemoveClick]
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [connectedItems, setConnectedItems] = useState<Array<any>>([])

  useEffect(() => {
    if (status === Web3ContextStatus.Connected) {
      setConnectedItems([
        {
          // eslint-disable-next-line react/display-name
          cell: (row: PositionWithUserBalanceWithToken) => (
            <span {...(row.userBalanceWithDecimals ? { title: row.userBalance.toString() } : {})}>
              {row.userBalanceWithDecimals}
            </span>
          ),
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
    if (selectedPositionsWithToken.length && onConfirm && typeof onConfirm === 'function') {
      onConfirm(selectedPositionsWithToken)
    }
  }, [onConfirm, selectedPositionsWithToken])

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
      {dataWithToken && !isLoading && (
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
                    ? dataWithToken.filter((position) => !position.userBalance.isZero())
                    : dataWithToken
                  : []
              }
              noDataComponent={
                <EmptyContentText>{`No positions${
                  showOnlyPositionsWithBalance && dataWithToken.length ? ' with balance' : ''
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
                data={selectedPositionsWithToken}
                noDataComponent={<EmptyContentText>No positions selected.</EmptyContentText>}
                noHeader
              />
            }
          />
          <ButtonContainer>
            <Button disabled={!selectedPositionsWithToken.length} onClick={handleDone}>
              Done
            </Button>
          </ButtonContainer>
        </>
      )}
    </Modal>
  )
}
