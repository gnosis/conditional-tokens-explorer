import { BigNumber } from 'ethers/utils'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Button } from 'components/buttons'
import { Modal, ModalProps } from 'components/common/Modal'
import { Amount } from 'components/form/Amount'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Row } from 'components/pureStyledComponents/Row'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { TitleValue } from 'components/text/TitleValue'
import { ZERO_BN } from 'config/constants'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { TransferOptions } from 'util/types'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getTokenBytecode } = require('1155-to-20-helper/src')

const FirstRow = styled(Row)`
  padding-top: 12px;
`

const ButtonContainerStyled = styled(ButtonContainer)`
  margin-top: 100px;
`

interface Props extends ModalProps {
  positionId: string
  balance: BigNumber
  decimals: number
  onWrap: (transferValue: TransferOptions) => Promise<void>
  collateralSymbol?: string
  tokenWrappedSymbol?: string
  tokenWrappedName?: string
}

export const WrapModal: React.FC<Props> = (props) => {
  const { WrapperService } = useWeb3ConnectedOrInfura()

  const {
    balance,
    collateralSymbol,
    decimals,
    onRequestClose,
    onWrap,
    positionId,
    tokenWrappedName,
    tokenWrappedSymbol,
    ...restProps
  } = props

  const maxBalance = useMemo(() => (balance ? balance : ZERO_BN), [balance])

  const [amount, setAmount] = useState<BigNumber>(ZERO_BN)
  const amountChangeHandler = useCallback((value: BigNumber) => {
    setAmount(value)
  }, [])

  const [tokenName, setTokenName] = useState<string>(
    tokenWrappedName ? tokenWrappedName : 'Wrapped ERC-1155'
  )
  const [tokenSymbol, setTokenSymbol] = useState<string>(
    tokenWrappedSymbol ? tokenWrappedSymbol : 'WMT'
  )

  const useWalletHandler = useCallback(() => {
    if (maxBalance.gt(ZERO_BN)) {
      setAmount(maxBalance)
    }
  }, [maxBalance])

  const isSubmitDisabled = amount.isZero()

  const wrap = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLInputElement>
    ) => {
      const tokenBytes = getTokenBytecode(tokenName, tokenSymbol, decimals)
      const wrapValues = {
        amount,
        address: WrapperService.address,
        positionId,
        tokenBytes,
      }

      if (isSubmitDisabled) return

      onWrap(wrapValues)

      if (onRequestClose) onRequestClose(e)
    },
    [
      WrapperService,
      amount,
      isSubmitDisabled,
      onRequestClose,
      onWrap,
      positionId,
      tokenName,
      tokenSymbol,
      decimals,
    ]
  )

  const onPressEnter = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') wrap(e)
    },
    [wrap]
  )

  return (
    <Modal
      onRequestClose={onRequestClose}
      style={{ content: { width: '500px' } }}
      title={'Wrap ERC1155'}
      {...restProps}
    >
      <FirstRow>
        <TitleValue
          title="Token Name"
          value={
            <Textfield
              autoComplete="off"
              name="tokenName"
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="Type in a token name..."
              readOnly={tokenWrappedName !== undefined && tokenWrappedName !== '' ? true : false}
              type="text"
              value={tokenName}
            />
          }
        />
      </FirstRow>
      <Row>
        <TitleValue
          title="Token Symbol"
          value={
            <Textfield
              autoComplete="off"
              name="tokenSymbol"
              onChange={(e) => setTokenSymbol(e.target.value)}
              placeholder="Type in a token symbol..."
              readOnly={
                tokenWrappedSymbol !== undefined && tokenWrappedSymbol !== '' ? true : false
              }
              type="text"
              value={tokenSymbol}
            />
          }
        />
      </Row>
      <Row>
        <Amount
          amount={amount}
          autoFocus
          balance={maxBalance}
          decimals={decimals}
          isFromAPosition
          max={maxBalance.toString()}
          onAmountChange={amountChangeHandler}
          onKeyUp={onPressEnter}
          onUseWalletBalance={useWalletHandler}
          tokenSymbol={collateralSymbol}
        />
      </Row>
      <ButtonContainerStyled>
        <Button disabled={isSubmitDisabled} onClick={wrap}>
          Wrap
        </Button>
      </ButtonContainerStyled>
    </Modal>
  )
}
