import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useCollateral } from '../../../hooks/useCollateral'
import { Token } from '../../../util/types'
import { Button } from '../../buttons'
import { Modal, ModalProps } from '../../common/Modal'
import { ButtonContainer } from '../../pureStyledComponents/ButtonContainer'
import { Error, ErrorContainer } from '../../pureStyledComponents/Error'
import { Row } from '../../pureStyledComponents/Row'
import { Textfield } from '../../pureStyledComponents/Textfield'
import { InlineLoading } from '../../statusInfo/InlineLoading'
import { TitleValue } from '../../text/TitleValue'

const FirstRow = styled(Row)`
  padding-top: 12px;
`

const SpinnerWrapper = styled.div`
  align-items: center;
  height: 71px;
  justify-content: center;
`

interface Props extends ModalProps {
  onAdd: (token: Token) => void
}

export const CustomCollateralModal: React.FC<Props> = (props) => {
  const { onAdd, onRequestClose, ...restProps } = props
  const [collateralAddress, setCollateralAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const collateralData = useCollateral(collateralAddress)

  useEffect(() => {
    if (collateralData) {
      setIsLoading(false)
    }
  }, [collateralData])

  const onClickAddButton = (
    e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>
  ) => {
    if (collateralData) {
      onAdd(collateralData)

      if (typeof onRequestClose === 'function') {
        onRequestClose(e)
      }
    }
  }

  return (
    <Modal
      onRequestClose={onRequestClose}
      style={{ content: { width: '500px' } }}
      title={'Add Custom Token'}
      {...restProps}
    >
      <FirstRow cols="1fr">
        <TitleValue
          title="Token Contract Address"
          value={
            <>
              <Textfield
                name="collateralAddress"
                onChange={(event) => {
                  const { value } = event.target
                  setCollateralAddress(value)
                  setIsLoading(true)
                  // Note: This is just a mockery to test displaying errors, we should
                  // show proper informative errors
                  if (value.length < 16) {
                    setError('Not a valid contract address.')
                  } else {
                    setError('')
                  }
                }}
                placeholder="A valid contract address..."
                type="text"
              />
              {error && (
                <ErrorContainer>
                  <Error>{error}</Error>
                </ErrorContainer>
              )}
            </>
          }
        />
      </FirstRow>
      {!collateralData && (
        <SpinnerWrapper>{isLoading && !error && <InlineLoading />}</SpinnerWrapper>
      )}
      {!isLoading && collateralData && (
        <Row>
          <TitleValue title={'Token Symbol'} value={collateralData && collateralData.symbol} />
          <TitleValue
            title={'Decimals of Precision'}
            value={collateralData && collateralData.decimals}
          />
        </Row>
      )}
      <ButtonContainer>
        <Button disabled={!collateralData} onClick={(e) => onClickAddButton(e)}>
          Add
        </Button>
      </ButtonContainer>
    </Modal>
  )
}
