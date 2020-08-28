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
  .web3modal-provider-icon {
    width: 45px;
    height: 45px;
    display: flex;
    box-shadow: none;
    -webkit-box-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    align-items: center;
    border-radius: 50%;
    overflow: visible;
    > img {
      height: 45px;
      width: 45px;
    }
  }
`
