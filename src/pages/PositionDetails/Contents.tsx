import { BigNumber } from 'ethers/utils'
import React, { useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { ethers } from 'ethers'
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
import { Outcome } from 'components/partitions/Outcome'
import { CardTextSm } from 'components/pureStyledComponents/CardText'
import { OutcomesContainer } from 'components/pureStyledComponents/OutcomesContainer'
import { Row } from 'components/pureStyledComponents/Row'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
  StripedListItemLessPadding,
} from 'components/pureStyledComponents/StripedList'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
import { TitleValue } from 'components/text/TitleValue'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useCollateral } from 'hooks/useCollateral'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { GetPosition_position as Position } from 'types/generatedGQL'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import { formatBigNumber, positionString, truncateStringInTheMiddle } from 'util/tools'
import { OutcomeProps, TransferOutcomeOptions } from 'util/types'

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
  balanceERC1155: BigNumber
  balanceERC20: BigNumber
  refetchBalances: () => void
}

const logger = getLogger('Contents')

export const Contents = (props: Props) => {
  const { CTService, signer } = useWeb3ConnectedOrInfura()
  const history = useHistory()
  const { position, balanceERC1155, balanceERC20, refetchBalances } = props

  const { collateralToken, wrappedToken, id: positionId, indexSets } = position
  const collateralERC1155Address = collateralToken?.id || ethers.constants.HashZero
  const collateralERC20Address = wrappedToken?.id || ethers.constants.HashZero

  const { setValue } = useLocalStorage('positionid')

  const { collateral: collateralERC1155 } = useCollateral(collateralERC1155Address)
  const { collateral: collateralERC20 } = useCollateral(collateralERC20Address)

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

    if (balanceERC1155 && !balanceERC1155.isZero() && signer) {
      menu.push({
        text: 'Transfer Outcome Tokens',
        onClick: () => {
          setOpenTransferOutcomeTokensModal(true)
        },
      })
    }

    return menu
  }, [positionId, history, signer, balanceERC1155, setValue])

  const positionPreview = React.useMemo(() => {
    if (collateralERC1155 && balanceERC1155) {
      return positionString(
        position.conditionIds,
        position.indexSets,
        balanceERC1155,
        collateralERC1155
      )
    }
  }, [collateralERC1155, position, balanceERC1155])

  const numberedOutcomes = React.useMemo(() => {
    return indexSets.map((indexSet: string) => {
      return Number(indexSet)
        .toString(2)
        .split('')
        .reverse()
        .map((value, index) => (value === '1' ? index + 1 : 0))
        .filter((n) => !!n)
        .map((n) => n - 1)
    })
  }, [indexSets])

  const ERC1155Symbol = useMemo(
    () => (collateralERC1155 && collateralERC1155.symbol ? collateralERC1155.symbol : ''),
    [collateralERC1155]
  )

  const ERC1155Decimals = useMemo(
    () => (collateralERC1155 && collateralERC1155.decimals ? collateralERC1155.decimals : 18),
    [collateralERC1155]
  )

  const ERC20Symbol = useMemo(
    () => (collateralERC20 && collateralERC20.symbol ? collateralERC20.symbol : ''),
    [collateralERC20]
  )

  const ERC20Decimals = useMemo(
    () => (collateralERC20 && collateralERC20.decimals ? collateralERC20.decimals : 18),
    [collateralERC20]
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

          await CTService.safeTransferFrom(
            addressFrom,
            addressTo,
            positionId,
            amount
          )

          refetchBalances()
          setTransfer(Remote.success(transferValue))
        } catch (err) {
          logger.error(err)
          setTransfer(Remote.failure(err))
        }
      }
    },
    [signer, CTService, refetchBalances]
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
    : 'All done!'
  const fullLoadingTitle = transfer.isFailure() ? 'Error' : transactionTitle

  const outcomesByRow = '15'
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
        <TitleValue title="Collateral Token" value={<TokenIcon symbol={ERC1155Symbol} />} />
        <TitleValue
          title="Contract Address"
          value={
            <>
              {truncateStringInTheMiddle(collateralERC1155Address, 8, 6)}
              <ButtonCopy value={collateralERC1155Address} />
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
                    {formatBigNumber(balanceERC1155, ERC1155Decimals)} {ERC1155Symbol}
                  </CollateralTextAmount>
                </CollateralText>
                <CollateralWrapButton
                  disabled={!balanceERC1155 || balanceERC1155.isZero()}
                  onClick={() => setIsWrapModalOpen(true)}
                >
                  Wrap
                </CollateralWrapButton>
              </StripedListItem>
              <StripedListItem>
                <CollateralText>
                  <CollateralTextStrong>ERC20:</CollateralTextStrong>{' '}
                  <CollateralTextAmount>
                    {!balanceERC20.isZero()
                      ? `${formatBigNumber(balanceERC20, ERC20Decimals)} ${ERC20Symbol}`
                      : 'No unwrapped collateral yet.'}
                  </CollateralTextAmount>
                </CollateralText>
                <CollateralWrapButton
                  disabled={!balanceERC20 || balanceERC20.isZero()}
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
          title="Partition"
          value={
            <>
              <CardTextSm>Outcomes Collections</CardTextSm>
              <StripedListStyled minHeight="auto">
                {numberedOutcomes && numberedOutcomes.length ? (
                  numberedOutcomes
                    .map((value) => {
                      return value.map((value, id) => {
                        return { id: id.toString(), value }
                      })
                    })
                    .map((outcomeList: OutcomeProps[], outcomeListIndex: number) => {
                      return (
                        <StripedListItemLessPadding key={outcomeListIndex}>
                          <OutcomesContainer columnGap="0" columns={outcomesByRow}>
                            {outcomeList.map((outcome: OutcomeProps, outcomeIndex: number) => (
                              <Outcome
                                key={outcomeIndex}
                                lastInRow={outcomesByRow}
                                outcome={outcome}
                              />
                            ))}
                          </OutcomesContainer>
                        </StripedListItemLessPadding>
                      )
                    })
                ) : (
                  <StripedListEmpty>No Collections.</StripedListEmpty>
                )}
              </StripedListStyled>
            </>
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
          balance={balanceERC1155}
          decimals={ERC1155Decimals}
          isOpen={isWrapModalOpen}
          onRequestClose={() => setIsWrapModalOpen(false)}
          onWrap={onWrap}
          tokenSymbol={ERC1155Symbol}
        />
      )}
      {isUnwrapModalOpen && (
        <UnwrapModal
          balance={balanceERC20}
          decimals={ERC20Decimals}
          isOpen={isUnwrapModalOpen}
          onRequestClose={() => setIsUnwrapModalOpen(false)}
          onUnWrap={onUnwrap}
          tokenSymbol={ERC20Symbol}
        />
      )}
      {openTransferOutcomeTokensModal && positionId && collateralERC1155Address && (
        <TransferOutcomeTokensModal
          collateralToken={collateralERC1155Address}
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
