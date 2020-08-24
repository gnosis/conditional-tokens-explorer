import { Token } from 'util/types'

import { Button } from 'components/buttons'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { Card } from 'components/statusInfo/common'
import { TitleValue } from 'components/text/TitleValue'
import { useCollateral } from 'hooks/useCollateral'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

const ButtonStyled = styled(Button)`
  margin-right: auto;
`
const Wrapper = styled.div`
  align-items: center;
  background-color: rgb(255, 255, 255, 0.75);
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 3000;
`

const Grid = styled.div`
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 14px;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 25px;
`

interface Props {
  onClose: () => void
  onAdd: (token: Token) => void
}

export const CustomCollateralModal = ({ onAdd, onClose }: Props) => {
  const [collateralAddress, setCollateralAddress] = useState<string>('')

  const collateralData = useCollateral(collateralAddress)

  const onClickCloseButton = () => {
    onClose()
  }

  const onClickAddButton = () => {
    if (collateralData) {
      onAdd(collateralData)
      onClose()
    }
  }

  const portal = document.getElementById('portalContainer')

  const tokenDetails = () => {
    return (
      <Grid>
        <TitleValue title={'Token Symbol:'} value={collateralData && collateralData.symbol} />
        <TitleValue
          title={'Decimals of Precision:'}
          value={collateralData && collateralData.decimals}
        />
      </Grid>
    )
  }

  const messageToRender = (
    <Wrapper>
      <Card>
        <TitleValue
          title="Token Contract Address"
          value={
            <Textfield
              name="collateralAddress"
              onChange={(event) => {
                const { value } = event.target
                setCollateralAddress(value)
              }}
              placeholder="Type in a collateral address..."
              type="text"
            />
          }
        />

        {tokenDetails()}
        <ButtonContainer>
          <ButtonStyled disabled={!collateralData} onClick={onClickAddButton}>
            Add
          </ButtonStyled>
          <Button onClick={onClickCloseButton}>Close</Button>
        </ButtonContainer>
      </Card>
    </Wrapper>
  )

  return ReactDOM.createPortal(messageToRender, portal as Element)
}
