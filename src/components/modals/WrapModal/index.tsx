import { BigNumber } from 'ethers/utils'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Amount } from 'components/form/Amount'
import { Button } from 'components/buttons'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Modal, ModalProps } from 'components/common/Modal'
import { Row } from 'components/pureStyledComponents/Row'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { TitleValue } from 'components/text/TitleValue'
import { TransferOptions } from 'util/types'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { ZERO_BN } from 'config/constants'

const { getTokenBytecode, getBatchTokenBytecode } = require('1155-to-20-helper/src');

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
  tokenSymbol?: string
}

export const WrapModal: React.FC<Props> = (props) => {

  const { WrapperService } = useWeb3ConnectedOrInfura()

  const { balance, decimals, onRequestClose, onWrap, positionId, tokenSymbol, ...restProps } = props

  const maxBalance = useMemo(() => (balance ? balance : ZERO_BN), [balance])

  const [amount, setAmount] = useState<BigNumber>(ZERO_BN)
  const amountChangeHandler = useCallback((value: BigNumber) => {
    setAmount(value)
  }, [])

  const [tokenWrappedName, setTokenWrappedName] = useState<string>('Wrapped ERC-1155')
  const [tokenWrappedSymbol, setTokenWrappedSymbol] = useState<string>('WMT')
  const [tokenWrappedDecimal, setTokenWrappedDecimal] = useState<number>(18)

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
      setTokenWrappedDecimal(decimals);
      const tokenBytes = getTokenBytecode(tokenWrappedName, tokenWrappedSymbol, tokenWrappedDecimal)
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
    [WrapperService, amount, isSubmitDisabled, onRequestClose, onWrap, positionId, tokenWrappedName, tokenWrappedSymbol, tokenWrappedDecimal]
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
        <Amount
          amount={amount}
          autoFocus
          balance={maxBalance}
          decimals={tokenWrappedDecimal}
          isFromAPosition
          max={maxBalance.toString()}
          onAmountChange={amountChangeHandler}
          onKeyUp={onPressEnter}
          onUseWalletBalance={useWalletHandler}
          tokenSymbol={tokenSymbol}
        />
      </FirstRow>
      <Row>
        <TitleValue
          title="Token Name"
          value={
            <Textfield
              autoComplete="off"
              name="tokenWrappedName"
              value={tokenWrappedName}
              onChange={(e) => setTokenWrappedName(e.target.value)}
              placeholder="Type in a token name..."
              type="text"
            />
          }
        />
      </Row>
      <Row>
        <TitleValue
          title="Token Symbol"
          value={
            <Textfield
              autoComplete="off"
              name="tokenSymbol"
              value={tokenWrappedSymbol}
              onChange={(e) => setTokenWrappedSymbol(e.target.value)}
              placeholder="Type in a token symbol..."
              type="text"
            />
          }
        />
      </Row>
      <Row>
        <TitleValue
          title="Token decimals"
          value={
            <Textfield
              autoComplete="off"
              name="tokenDecimals"
              value={tokenWrappedDecimal.toString()}
              onChange={(e) => { 
                if (e.target.value !== "" && parseInt(e.target.value)) {
                  setTokenWrappedDecimal(Number(e.target.value));
                }
              }}
              placeholder="Type in a token decimals..."
              type="text"
            />
          }
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
