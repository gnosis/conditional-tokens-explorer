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
import { UnwrapModal } from 'components/modals/UnwrapModal'
import { WrapModal } from 'components/modals/WrapModal'
import { Row } from 'components/pureStyledComponents/Row'
import { StripedList, StripedListItem } from 'components/pureStyledComponents/StripedList'
import { ActionButtonProps, FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
import { TitleValue } from 'components/text/TitleValue'
import { useBalanceForPosition } from 'hooks/useBalanceForPosition'
import { useCollateral } from 'hooks/useCollateral'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { GetPosition_position as Position } from 'types/generatedGQL'
import { formatBigNumber, positionString, truncateStringInTheMiddle } from 'util/tools'
import { Status } from 'util/types'

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
}

export const Contents = ({ position }: Props) => {
  const history = useHistory()
  const { setValue } = useLocalStorage('positionid')
  const { balance, error, loading } = useBalanceForPosition(position.id)

  const { collateral: positionCollateral } = useCollateral(
    position ? position.collateralToken.id : ''
  )
  const [collateralSymbol, setCollateralSymbol] = React.useState('')
  const { collateralToken, id } = position
  const [isWrapModalOpen, setIsWrapModalOpen] = useState(false)
  const [isUnwrapModalOpen, setIsUnwrapModalOpen] = useState(false)

  const dropdownItems = useMemo(() => {
    return [
      {
        onClick: () => {
          setValue(id)
          history.push(`/redeem`)
        },
        text: 'Redeem',
      },
      {
        onClick: () => {
          setValue(id)
          history.push(`/split`)
        },
        text: 'Split',
      },
    ]
  }, [id, history, setValue])

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

  const [statusTitle, setStatusTitle] = useState<string>('')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [status, setStatus] = useState<Maybe<Status>>(null)
  const [statusIcon, setStatusIcon] = useState<IconTypes>()
  const [statusOnClick, setStatusOnClick] = useState<ActionButtonProps | undefined>(undefined)

  const setStatusWorking = (title: string, message = 'Working...') => {
    setStatus(Status.Loading)
    setStatusTitle(title)
    setStatusIcon(IconTypes.spinner)
    setStatusMessage(message)
    setStatusOnClick(undefined)
  }

  const setStatusDone = (title: string, message = 'Done!') => {
    setStatusTitle(title)
    setStatus(Status.Done)
    setStatusMessage(message)
    setStatusIcon(IconTypes.ok)
    setStatusOnClick({
      onClick: () => setStatus(null),
      text: 'OK',
    })
  }

  const setStatusError = (title: string, message = 'There was an error...') => {
    setStatusTitle(title)
    setStatus(Status.Done)
    setStatusMessage(message)
    setStatusIcon(IconTypes.error)
    setStatusOnClick({
      buttonType: ButtonType.danger,
      onClick: () => setStatus(null),
      text: 'Close',
    })
  }

  const onWrap = useCallback(() => {
    const onWrapTitle = 'Wrapping ERC1155'
    setStatusWorking(onWrapTitle)

    setTimeout(() => {
      setStatusDone(onWrapTitle)
    }, 5000)
  }, [])

  const onUnwrap = useCallback(() => {
    const onWrapTitle = 'Unwrapping ERC20'
    setStatusWorking(onWrapTitle)

    setTimeout(() => {
      setStatusError(onWrapTitle)
    }, 5000)
  }, [])

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
              {truncateStringInTheMiddle(id, 8, 6)}
              <ButtonCopy value={id} />
            </>
          }
        />
        <TitleValue title="Collateral Token" value={<TokenIcon symbol={collateralSymbol} />} />
        <TitleValue
          title="Contract Address"
          value={
            <>
              {truncateStringInTheMiddle(collateralToken.id, 8, 6)}
              <ButtonCopy value={collateralToken.id} />
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
          onWrap={onUnwrap}
          tokenSymbol={collateralSymbol}
        />
      )}
      {status !== null && (
        <FullLoading
          actionButton={statusOnClick}
          icon={statusIcon}
          message={statusMessage}
          title={statusTitle}
        />
      )}
    </CenteredCard>
  )
}
