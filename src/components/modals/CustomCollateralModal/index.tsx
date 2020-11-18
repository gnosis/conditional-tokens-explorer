import React, { useState } from 'react'
import styled from 'styled-components'

import { Button } from 'components/buttons'
import { Modal, ModalProps } from 'components/common/Modal'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import { Row } from 'components/pureStyledComponents/Row'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { TitleValue } from 'components/text/TitleValue'
import { useCollateral } from 'hooks/useCollateral'
import { Token } from 'util/types'

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

  const { collateral: collateralData, error, loading } = useCollateral(collateralAddress)

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
                }}
                placeholder="A valid contract address..."
                type="text"
              />
              {error && (
                <ErrorContainer>
                  <Error>{error.message}</Error>
                </ErrorContainer>
              )}
            </>
          }
        />
      </FirstRow>
      {!collateralData && <SpinnerWrapper>{loading && !error && <InlineLoading />}</SpinnerWrapper>}
      {!loading && collateralData && (
        <Row cols="1fr 1fr">
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
