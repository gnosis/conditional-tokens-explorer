import React from 'react'
import styled from 'styled-components'

import { Button } from 'components/buttons'
import { Modal, ModalProps } from 'components/common/Modal'
import { DisplayTableHashes } from 'components/form/DisplayTableHashes'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { HashArray } from 'util/types'

const ButtonContainerStyled = styled(ButtonContainer)`
  margin-top: 100px;
`

interface Props extends ModalProps {
  hashes: Array<HashArray>
  title: string
  titleTable: string
  url: string
}

export const DisplayHashesTableModal = (props: Props) => {
  const { hashes, onRequestClose, title, titleTable, url, ...restProps } = props

  return (
    <Modal
      onRequestClose={onRequestClose}
      style={{ content: { width: '500px' } }}
      title={title}
      {...restProps}
    >
      <DisplayTableHashes hashes={hashes} titleTable={titleTable} url={url} />
      <ButtonContainerStyled>
        <Button onClick={onRequestClose}>Close</Button>
      </ButtonContainerStyled>
    </Modal>
  )
}
