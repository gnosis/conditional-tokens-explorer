import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { ModalBasicProps } from '../Modal'

import CloseIcon from './img/close.svg'

const ModalTitleWrapper = styled.div<{ noTitle: boolean }>`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${(props) => (props.noTitle ? '0' : '15px')};
  margin-left: -${(props) => props.theme.modalStyle.content.paddingHorizontal};
  margin-right: -${(props) => props.theme.modalStyle.content.paddingHorizontal};
  margin-top: 0;
  padding-bottom: ${(props) => (props.noTitle ? '0' : '12px')};
  padding-left: ${(props) => props.theme.modalStyle.content.paddingHorizontal};
  padding-right: ${(props) => props.theme.modalStyle.content.paddingHorizontal};
  padding-top: 0;
  position: relative;
`

const ModalTitleText = styled.h2`
  color: ${(props) => props.theme.colors.darkBlue};
  flex-grow: 1;
  font-size: 22px;
  font-weight: normal;
  line-height: 1.2;
  margin: 0;
  overflow: hidden;
  padding: 0;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 1;
`

const ModalClose = styled.button`
  background-color: transparent;
  background-image: url(${CloseIcon});
  background-position: 100% 0;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  display: block;
  height: 22px;
  justify-content: flex-end;
  outline: none;
  padding: 0;
  width: 22px;
  z-index: 12;

  &:active {
    opacity: 0.8;
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

interface Props extends HTMLAttributes<HTMLDivElement>, ModalBasicProps {
  onClose?: ((e?: any) => void) | undefined
}

export const ModalTitle: React.FC<Props> = (props: Props) => {
  const { disableCloseButton, hideCloseButton, onClose, title, ...restProps } = props

  return (
    <ModalTitleWrapper noTitle={!title} {...restProps}>
      {title && <ModalTitleText>{title}</ModalTitleText>}
      {hideCloseButton ? null : <ModalClose disabled={disableCloseButton} onClick={onClose} />}
    </ModalTitleWrapper>
  )
}
