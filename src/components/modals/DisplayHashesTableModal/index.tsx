import React from 'react'
import styled from 'styled-components'

import { Modal, ModalProps } from 'components/common/Modal'
import { DisplayTableHashes } from 'components/form/DisplayTableHashes'
import { HashArray } from 'util/types'

const Table = styled(DisplayTableHashes)`
  &.noMarginBottom {
    margin-bottom: 0;
  }
`

interface Props extends ModalProps {
  hashes: Array<HashArray>
  title: string
  titleTable: string
}

export const DisplayHashesTableModal = (props: Props) => {
  const { hashes, onRequestClose, title, titleTable, ...restProps } = props

  return (
    <Modal
      onRequestClose={onRequestClose}
      style={{ content: { width: '500px' } }}
      title={title}
      {...restProps}
    >
      <Table className="noMarginBottom" hashes={hashes} titleTable={titleTable} />
    </Modal>
  )
}
