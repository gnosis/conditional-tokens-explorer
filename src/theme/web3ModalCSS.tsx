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
    margin: 0;
    max-width: 350px;
    padding-bottom: 50px;
    padding-left: ${(props) => props.theme.cards.paddingHorizontal};
    padding-right: ${(props) => props.theme.cards.paddingHorizontal};
    padding-top: ${(props) => props.theme.cards.paddingVertical};

    &::before {
      color: ${(props) => props.theme.colors.darkBlue};
      content: 'Connect A Wallet';
      font-family: ${(props) => props.theme.fonts.fontFamily};
      font-size: 22px;
      font-weight: 400;
      line-height: 1.2;
      margin: 0 0 25px;
      text-align: left;
    }
  }

  .web3modal-provider-wrapper {
    border-radius: 4px;
    border: solid 1px ${(props) => props.theme.colors.lightGrey};
    padding: 0;
    margin: 0 0 8px 0;

    .web3modal-provider-container {
      align-items: center;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      padding: 12px;
      transition: all 0.15s linear;

      .web3modal-provider-icon {
        flex-grow: 0;
        height: auto;
        width: 28px;
      }

      .web3modal-provider-name {
        color: #000;
        font-family: ${(props) => props.theme.fonts.fontFamily};
        font-size: 17px;
        font-weight: 600;
        line-height: 1;
        margin: 4px 0 0 12px;
        padding: 0;
        text-align: left;
      }

      .web3modal-provider-description {
        display: none;
      }
    }

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background-color: rgba(0, 156, 180, 0.1);
      border: solid 1px ${(props) => props.theme.colors.primary};

      .web3modal-provider-container {
        background-color: transparent;
      }
    }
  }
`
