import { css } from 'styled-components'

export const web3ModalCSS = css`
  .web3modal-modal-lightbox {
    background-color: ${(props) => props.theme.modalStyle.overlay.backgroundColor};
    z-index: ${(props) => props.theme.modalStyle.overlay.zIndex};
  }
  .web3modal-modal-card {
    background-color: ${(props) => props.theme.modalStyle.content.backgroundColor};
    border-color: ${(props) => props.theme.modalStyle.content.borderColor};
    border-radius: ${(props) => props.theme.modalStyle.content.borderRadius};
    box-shadow: ${(props) => props.theme.modalStyle.content.boxShadow};
  }
`
