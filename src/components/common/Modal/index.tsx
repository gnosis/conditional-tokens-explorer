import React from 'react'
import ReactModal from 'react-modal'
import styled, { withTheme } from 'styled-components'

import { CloseIcon } from 'components/common/Modal/img/CloseIcon'

const Title = styled.div<{ hasTitle: boolean }>`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-left: -${(props) => props.theme.modalStyle.content.paddingHorizontal};
  margin-right: -${(props) => props.theme.modalStyle.content.paddingHorizontal};
  margin-top: 0;
  padding-bottom: ${(props) => (props.hasTitle ? '12px' : '0')};
  padding-left: ${(props) => props.theme.modalStyle.content.paddingHorizontal};
  padding-right: ${(props) => props.theme.modalStyle.content.paddingHorizontal};
  padding-top: 0;
`

const TitleText = styled.h2`
  color: ${(props) => props.theme.colors.darkBlue};
  flex-grow: 1;
  font-size: 22px;
  font-weight: 400;
  line-height: 1.3;
  margin: 0;
  overflow: hidden;
  padding: 0 10px 0 0;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Close = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: block;
  display: flex;
  height: 24px;
  justify-content: flex-end;
  outline: none;
  padding: 0;
  width: 24px;

  &:active {
    opacity: 0.7;
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const ModalSubTitle = styled.h3`
  color: ${(props) => props.theme.colors.textColor};
  font-size: 16px;
  font-weight: 400;
  font-style: italic;
  line-height: 1;
  margin: 0 0 12px;
  padding: 0;
`

export interface ModalProps extends React.ComponentProps<typeof ReactModal> {
  hideCloseButton?: boolean
  subTitle?: string | React.ReactNode | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme?: any
  title?: string | undefined
}

const ModalWrapper: React.FC<ModalProps> = (props) => {
  const {
    children,
    hideCloseButton,
    onRequestClose,
    style = {},
    subTitle,
    theme,
    title,
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
      {(title || hideCloseButton) && (
        <Title hasTitle={title !== ''}>
          {title && <TitleText>{title}</TitleText>}
          {!hideCloseButton && (
            <Close onClick={onRequestClose}>
              <CloseIcon />
            </Close>
          )}
        </Title>
      )}
      {subTitle && <ModalSubTitle>{subTitle}</ModalSubTitle>}
      {children}
    </ReactModal>
  )
}

export const Modal = withTheme(ModalWrapper)
