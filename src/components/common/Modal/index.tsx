import React from 'react'
import ReactModal from 'react-modal'
import { withTheme } from 'styled-components'

import { ModalSubTitle } from '../ModalSubTitle'
import { ModalTitle } from '../ModalTitle'

export interface ModalBasicProps {
  disableCloseButton?: boolean
  hideCloseButton?: boolean
  title?: string
  subTitle?: string
}

interface Props extends React.ComponentProps<typeof ReactModal>, ModalBasicProps {
  children: React.ReactNode
  theme?: any
}

const ModalWrapper: React.FC<Props> = (props) => {
  const {
    onRequestClose,
    theme,
    title,
    subTitle,
    children,
    disableCloseButton,
    style = {},
    ...restProps
  } = props
  const { modalStyle } = theme
  const styles = {
    content: {
      ...modalStyle.content,
      ...style.content,
    },
    overlay: {
      ...modalStyle.overlay,
    },
  }

  return (
    <ReactModal
      appElement={document.getElementById('root') as HTMLElement}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={true}
      style={styles}
      {...restProps}
    >
      <ModalTitle disableCloseButton={disableCloseButton} onClose={onRequestClose} title={title} />
      {subTitle && <ModalSubTitle>{subTitle}</ModalSubTitle>}
      {children}
    </ReactModal>
  )
}

export const Modal = withTheme(ModalWrapper)
