import { BigNumber } from 'ethers/utils'
import React, { useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonCopy } from 'components/buttons/ButtonCopy'
import { ButtonDropdownCircle } from 'components/buttons/ButtonDropdownCircle'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
import { Dropdown, DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { TokenIcon } from 'components/common/TokenIcon'
import { TransferOutcomeTokensModal } from 'components/modals/TransferOutcomeTokensModal'
import { UnwrapModal } from 'components/modals/UnwrapModal'
import { WrapModal } from 'components/modals/WrapModal'
import { Row } from 'components/pureStyledComponents/Row'
import { StripedList, StripedListItem } from 'components/pureStyledComponents/StripedList'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
import { TitleValue } from 'components/text/TitleValue'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useBalanceForPosition } from 'hooks/useBalanceForPosition'
import { useCollateral } from 'hooks/useCollateral'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { GetPosition_position as Position } from 'types/generatedGQL'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import { formatBigNumber, positionString, truncateStringInTheMiddle } from 'util/tools'
import { TransferOutcomeOptions } from 'util/types'

const CollateralText = styled.span`
  color: ${(props) => props.theme.colors.darkerGray};
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  text-align: left;
`

const CollateralTextStrong = styled.span`
  font-weight: 600;
`

const CollateralTextAmount = styled.span<{ italic?: boolean }>`
  font-style: ${(props) => (props.italic ? 'italic' : 'normal')};
`

const CollateralWrapButton = styled(Button)`
  font-size: 14px;
  font-weight: 600;
  height: 24px;
  width: 80px;
`

const StripedListStyled = styled(StripedList)`
  margin-top: 6px;
`

interface Props {
  position: Position
  balance: Maybe<BigNumber>
}

const logger = getLogger('Contents')

export const Contents = ({ position }: Props) => {
  const { CTService, signer } = useWeb3ConnectedOrInfura()
  const { collateralToken, id: positionId } = position
  const { id: collateralTokenAddress } = collateralToken

  const history = useHistory()
  const { setValue } = useLocalStorage('positionid')
  const [refresh, setRefresh] = React.useState('')
  const { balance, error, loading } = useBalanceForPosition(position.id, refresh)

  const { collateral: positionCollateral } = useCollateral(position ? collateralTokenAddress : '')
  const [collateralSymbol, setCollateralSymbol] = React.useState('')
  const [isWrapModalOpen, setIsWrapModalOpen] = useState(false)
  const [isUnwrapModalOpen, setIsUnwrapModalOpen] = useState(false)
  const [openTransferOutcomeTokensModal, setOpenTransferOutcomeTokensModal] = useState(false)
  const [transfer, setTransfer] = useState<Remote<TransferOutcomeOptions>>(
    Remote.notAsked<TransferOutcomeOptions>()
  )
  const [transactionTitle, setTransactionTitle] = useState<string>('')

  const dropdownItems = useMemo(() => {
    const menu = [
      {
        onClick: () => {
          setValue(positionId)
          history.push(`/redeem`)
        },
        text: 'Redeem',
      },
      {
        onClick: () => {
          setValue(positionId)
          history.push(`/split`)
        },
        text: 'Split',
      },
    ]

    if (balance && !balance.isZero() && signer) {
      menu.push({
        text: 'Transfer Outcome Tokens',
        onClick: () => {
          setOpenTransferOutcomeTokensModal(true)
        },
      })
    }

    return menu
  }, [positionId, history, signer, balance, setValue])

  const ERC20Amount = new BigNumber('500000000000000000')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const positionPreview = React.useMemo(() => {
    if (positionCollateral && !loading && !error && balance) {
      return positionString(position.conditionIds, position.indexSets, balance, positionCollateral)
    }
  }, [positionCollateral, position, loading, error, balance])

  React.useEffect(() => {
    if (positionCollateral) {
      setCollateralSymbol(positionCollateral.symbol)
    } else {
      setCollateralSymbol('')
    }
  }, [positionCollateral])

  const decimals = useMemo(
    () => (positionCollateral && positionCollateral.decimals ? positionCollateral.decimals : 0),
    [positionCollateral]
  )

  const onWrap = useCallback(() => {
    setTransfer(Remote.loading())
    setTransactionTitle('Wrapping ERC1155')

    setTimeout(() => {
      setTransfer(Remote.success({ address: '', amount: new BigNumber(0), positionId: '' }))
    }, 5000)
  }, [])

  const onUnwrap = useCallback(() => {
    setTransfer(Remote.loading())
    setTransactionTitle('Unwrapping ERC20')

    setTimeout(
      () => setTransfer(Remote.success({ address: '', amount: new BigNumber(0), positionId: '' })),
      5000
    )
  }, [])

  const onTransferOutcomeTokens = useCallback(
    async (transferValue: TransferOutcomeOptions) => {
      if (signer) {
        try {
          setTransfer(Remote.loading())
          setTransactionTitle('Transfer Outcome Tokens')

          const { address: addressTo, amount, positionId } = transferValue
          const addressFrom = await signer.getAddress()

          const { transactionIndex } = await CTService.safeTransferFrom(
            addressFrom,
            addressTo,
            positionId,
            amount
          )

          setRefresh(transactionIndex + '')
          setTransfer(Remote.success(transferValue))
        } catch (err) {
          logger.error(err)
          setTransfer(Remote.failure(err))
        }
      }
    },
    [signer, CTService]
  )

  const fullLoadingActionButton = transfer.isSuccess()
    ? {
        buttonType: ButtonType.primary,
        onClick: () => setTransfer(Remote.notAsked<TransferOutcomeOptions>()),
        text: 'OK',
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
    : undefined
  const fullLoadingTitle = transfer.isFailure() ? 'Error' : transactionTitle

  return (
    <CenteredCard
      dropdown={
        <Dropdown
          dropdownButtonContent={<ButtonDropdownCircle />}
          dropdownPosition={DropdownPosition.right}
          items={dropdownItems.map((item, index) => (
            <DropdownItem key={index} onClick={item.onClick}>
              {item.text}
            </DropdownItem>
          ))}
        />
      }
    >
      <Row marginBottomXL>
        <TitleValue
          title="Position Id"
          value={
            <>
              {truncateStringInTheMiddle(positionId, 8, 6)}
              <ButtonCopy value={positionId} />
            </>
          }
        />
        <TitleValue title="Collateral Token" value={<TokenIcon symbol={collateralSymbol} />} />
        <TitleValue
          title="Contract Address"
          value={
            <>
              {truncateStringInTheMiddle(collateralTokenAddress, 8, 6)}
              <ButtonCopy value={collateralTokenAddress} />
            </>
          }
        />
      </Row>
      <Row cols="1fr" marginBottomXL>
        <TitleValue
          title="Collateral Wrapping"
          value={
            <StripedListStyled maxHeight="auto">
              <StripedListItem>
                <CollateralText>
                  <CollateralTextStrong>ERC1155:</CollateralTextStrong>{' '}
                  <CollateralTextAmount>
                    {formatBigNumber(balance, decimals)} {collateralSymbol}
                  </CollateralTextAmount>
                </CollateralText>
                <CollateralWrapButton
                  disabled={!balance || balance.isZero()}
                  onClick={() => setIsWrapModalOpen(true)}
                >
                  Wrap
                </CollateralWrapButton>
              </StripedListItem>
              <StripedListItem>
                <CollateralText>
                  <CollateralTextStrong>ERC20:</CollateralTextStrong>{' '}
                  <CollateralTextAmount>
                    {!ERC20Amount.isZero()
                      ? `${formatBigNumber(ERC20Amount, decimals)} ${collateralSymbol}`
                      : 'No unwrapped collateral yet.'}
                  </CollateralTextAmount>
                </CollateralText>
                <CollateralWrapButton
                  disabled={!ERC20Amount || ERC20Amount.isZero()}
                  onClick={() => setIsUnwrapModalOpen(true)}
                >
                  Unwrap
                </CollateralWrapButton>
              </StripedListItem>
            </StripedListStyled>
          }
        />
      </Row>
      <Row cols="1fr" marginBottomXL>
        <TitleValue
          title="Position"
          value={<StripedListItem>{positionPreview || ''} </StripedListItem>}
        />
      </Row>
      {isWrapModalOpen && (
        <WrapModal
          balance={balance}
          decimals={decimals}
          isOpen={isWrapModalOpen}
          onRequestClose={() => setIsWrapModalOpen(false)}
          onWrap={onWrap}
          tokenSymbol={collateralSymbol}
        />
      )}
      {isUnwrapModalOpen && (
        <UnwrapModal
          balance={ERC20Amount}
          decimals={decimals}
          isOpen={isUnwrapModalOpen}
          onRequestClose={() => setIsUnwrapModalOpen(false)}
          onUnWrap={onUnwrap}
          tokenSymbol={collateralSymbol}
        />
      )}
      {openTransferOutcomeTokensModal && positionId && collateralTokenAddress && (
        <TransferOutcomeTokensModal
          collateralToken={collateralTokenAddress}
          isOpen={openTransferOutcomeTokensModal}
          onRequestClose={() => setOpenTransferOutcomeTokensModal(false)}
          onSubmit={onTransferOutcomeTokens}
          positionId={positionId}
        />
      )}
      {(transfer.isLoading() || transfer.isFailure() || transfer.isSuccess()) && (
        <FullLoading
          actionButton={fullLoadingActionButton}
          icon={fullLoadingIcon}
          message={fullLoadingMessage}
          title={fullLoadingTitle}
          width={transfer.isFailure() ? '400px' : '320px'}
        />
      )}
    </CenteredCard>
  )
}
