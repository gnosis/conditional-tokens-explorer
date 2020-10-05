import React from 'react'
import styled from 'styled-components'

import { Button } from 'components/buttons'
import { Modal, ModalProps } from 'components/common/Modal'
import { DisplayTableConditions } from 'components/form/DisplayTableConditions'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { ConditionIdsArray } from 'util/types'

const ButtonContainerStyled = styled(ButtonContainer)`
  margin-top: 100px;
`

interface Props extends ModalProps {
  conditions: Array<ConditionIdsArray>
}

export const DisplayConditionsTableModal = (props: Props) => {
  const { conditions, onRequestClose, ...restProps } = props

  return (
    <Modal
      onRequestClose={onRequestClose}
      style={{ content: { width: '500px' } }}
      title={'Conditions'}
      {...restProps}
    >
      <DisplayTableConditions conditions={conditions} />
      <ButtonContainerStyled>
        <Button onClick={onRequestClose}>Close</Button>
      </ButtonContainerStyled>
    </Modal>
  )
}
