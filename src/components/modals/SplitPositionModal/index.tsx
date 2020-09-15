import React from 'react'

import { Modal, ModalProps } from 'components/common/Modal'
import { truncateStringInTheMiddle } from 'util/tools'

interface Props extends ModalProps {
  bodyComponent: React.ReactNode
  conditionId: string
  onRequestClose?: () => void
}

export const SplitPositionModal: React.FC<Props> = (props) => {
  const { bodyComponent, conditionId, onRequestClose, ...restProps } = props

  const subTitle = (
    <>
      Positions were successfully split from{' '}
      <span title={conditionId}>{truncateStringInTheMiddle(conditionId, 8, 6)}</span>
    </>
  )

  return (
    <Modal
      {...restProps}
      onRequestClose={onRequestClose}
      subTitle={subTitle}
      title={'Split positions'}
    >
      {bodyComponent}
    </Modal>
  )
}
