import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'

import { ButtonDots } from 'components/buttons/ButtonDots'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CollateralFilterDropdown } from 'components/common/CollateralFilterDropdown'
import { Dropdown, DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { TokenIcon } from 'components/common/TokenIcon'
import { SearchField } from 'components/form/SearchField'
import { TransferOutcomeTokensModal } from 'components/modals/TransferOutcomeTokensModal'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { IconTypes } from 'components/statusInfo/common'
import { CellHash } from 'components/table/CellHash'
import { TableControls } from 'components/table/TableControls'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import {
  PositionWithUserBalanceWithDecimals,
  PositionWithUserBalanceWithDecimalsWithToken,
  usePositions,
} from 'hooks'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { useWithToken } from 'hooks/useWithToken'
import { customStyles } from 'theme/tableCustomStyles'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import { CollateralFilterOptions, TransferOutcomeOptions } from 'util/types'

const logger = getLogger('PositionsList')

export const PositionsList = () => {
  const { _type: status, CTService, connect, signer } = useWeb3ConnectedOrInfura()
  const history = useHistory()
  const { setValue } = useLocalStorage('positionid')

  const [positionIdToSearch, setPositionIdToSearch] = useState<string>('')
  const [positionIdToShow, setPositionIdToShow] = useState<string>('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [connectedItems, setConnectedItems] = useState<Array<any>>([])
  const [selectedCollateralFilter, setSelectedCollateralFilter] = useState<string>('')
  const [selectedCollateralValue, setSelectedCollateralValue] = useState<string>(
    CollateralFilterOptions.All
  )
  const [openTransferOutcomeTokensModal, setOpenTransferOutcomeTokensModal] = useState(false)
  const [selectedPositionId, setSelectedPositionId] = useState<string>('')
  const [selectedCollateralToken, setSelectedCollateralToken] = useState<string>('')
  const [transfer, setTransfer] = useState<Remote<TransferOutcomeOptions>>(
    Remote.notAsked<TransferOutcomeOptions>()
  )

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

  const { data, error, loading, refetchPositions, refetchUserPositions } = usePositions({
    positionId: positionIdToSearch,
    collateralFilter: selectedCollateralFilter,
    collateralValue: selectedCollateralValue,
  })
  const { data: dataWithToken, loading: loadingCustomTokens } = useWithToken(data || [])

  const isLoading = !positionIdToSearch && (loading || loadingCustomTokens) && transfer.isNotAsked()
  const isSearching = positionIdToSearch && (loading || loadingCustomTokens)

  const buildMenuForRow = useCallback(
    (row: PositionWithUserBalanceWithDecimals) => {
      const { collateralToken, id, userBalanceERC1155, userBalanceERC20 } = row

      const menu = [
        {
          text: 'Details',
          onClick: () => history.push(`/positions/${id}`),
        },
        {
          text: 'Redeem',
          onClick: () => {
            setValue(id)
            history.push(`/redeem`)
          },
        },
      ]

      if (!userBalanceERC1155.isZero() && signer) {
        const menuERC1155 = [
          {
            text: 'Wrap ERC1155',
            onClick: () => {
              logger.log('wrap not implemented yet')
            },
          },
          {
            text: 'Transfer Outcome Tokens',
            onClick: () => {
              setSelectedPositionId(id)
              setSelectedCollateralToken(collateralToken)
              setOpenTransferOutcomeTokensModal(true)
            },
          }
        ]
        menu.push(...menuERC1155)
      }

      if (!userBalanceERC20.isZero() && signer) {
        const menuERC20 = [
          {
            text: 'Unwrap ERC20',
            onClick: () => {
              logger.log('unwrap not implemented yet')
            },
          },
        ]
        menu.push(...menuERC20)
      }

      return menu
    },
    [history, setValue, signer]
  )

  const handleRowClick = useCallback(
    (row: PositionWithUserBalanceWithDecimals) => {
      history.push(`/positions/${row.id}`)
    },
    [history]
  )

  const menu = useMemo(() => {
    return [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => (
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
          cell: (row: PositionWithUserBalanceWithDecimals) => (
            <span
              onClick={() => handleRowClick(row)}
              {...(row.userBalanceERC1155WithDecimals
                ? { title: row.userBalanceERC1155.toString() }
                : {})}
            >
              {row.userBalanceERC1155WithDecimals}
            </span>
          ),
          name: 'ERC1155 Amount',
          right: true,
          selector: 'userBalanceERC1155',
          sortable: true,
        },
        {
          // eslint-disable-next-line react/display-name
          cell: (row: PositionWithUserBalanceWithDecimals) => (
            <span
              onClick={() => handleRowClick(row)}
              {...(row.userBalanceERC20WithDecimals
                ? { title: row.userBalanceERC20.toString() }
                : {})}
            >
              {row.userBalanceERC20WithDecimals}
            </span>
          ),
          name: 'ERC20 Amount',
          right: true,
          selector: 'userBalanceERC20',
          sortable: true,
        },
      ])
    }
  }, [status, buildMenuForRow, handleRowClick])

  const getColumns = useCallback(() => {
    // If you move this outside of the useCallback, can cause performance issues as a dep of this useCallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultColumns: Array<any> = [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => (
          <CellHash onClick={() => handleRowClick(row)} underline value={row.id} />
        ),
        name: 'Position Id',
        selector: 'id',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimalsWithToken) => {
          const { token } = row
          // Please don't delete this because the tests will explode
          return token ? <TokenIcon symbol={token.symbol || ''} /> : row.collateralToken
        },
        name: 'Collateral',
        selector: 'collateralToken',
        sortable: true,
      },
    ]

    return [...defaultColumns, ...connectedItems, ...menu]
  }, [connectedItems, menu, handleRowClick])

  const onTransferOutcomeTokens = useCallback(
    async (transferValue: TransferOutcomeOptions) => {
      if (signer) {
        try {
          setTransfer(Remote.loading())

          const { address: addressTo, amount, positionId } = transferValue
          const addressFrom = await signer.getAddress()
          await CTService.safeTransferFrom(addressFrom, addressTo, positionId, amount)

          refetchPositions()
          refetchUserPositions()

          setTransfer(Remote.success(transferValue))
        } catch (err) {
          logger.error(err)
          setTransfer(Remote.failure(err))
        }
      } else {
        connect()
      }
    },
    [signer, CTService, connect, refetchUserPositions, refetchPositions]
  )

  const fullLoadingActionButton = transfer.isSuccess()
    ? {
        buttonType: ButtonType.primary,
        text: 'OK',
        onClick: () => setTransfer(Remote.notAsked<TransferOutcomeOptions>()),
      }
    : transfer.isFailure()
    ? {
        buttonType: ButtonType.danger,
        text: 'Close',
        onClick: () => setTransfer(Remote.notAsked<TransferOutcomeOptions>()),
      }
    : undefined

  const fullLoadingIcon = transfer.isFailure()
    ? IconTypes.error
    : transfer.isSuccess()
    ? IconTypes.ok
    : IconTypes.spinner

  const fullLoadingMessage = transfer.isFailure()
    ? transfer.getFailure()
    : transfer.isLoading()
    ? 'Working...'
    : 'All done!'

  return (
    <>
      <PageTitle>Positions</PageTitle>
      {isLoading && !error && <InlineLoading />}
      {error && <InfoCard message={error.message} title="Error" />}
      {dataWithToken && !isLoading && !error && (
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
                onChange={onChangePositionId}
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
              data={dataWithToken || []}
              highlightOnHover
              noHeader
              onRowClicked={handleRowClick}
              pagination
              responsive
            />
          )}
          {openTransferOutcomeTokensModal && selectedPositionId && selectedCollateralToken && (
            <TransferOutcomeTokensModal
              collateralToken={selectedCollateralToken}
              isOpen={openTransferOutcomeTokensModal}
              onRequestClose={() => setOpenTransferOutcomeTokensModal(false)}
              onSubmit={onTransferOutcomeTokens}
              positionId={selectedPositionId}
            />
          )}
          {(transfer.isLoading() || transfer.isFailure() || transfer.isSuccess()) && (
            <FullLoading
              actionButton={fullLoadingActionButton}
              icon={fullLoadingIcon}
              message={fullLoadingMessage}
              title={transfer.isFailure() ? 'Error' : 'Transfer Outcome Tokens'}
              width={transfer.isFailure() ? '400px' : '320px'}
            />
          )}
        </>
      )}
    </>
  )
}
