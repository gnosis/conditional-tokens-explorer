import { css } from 'styled-components'

export const walletConnectCSS = css`
  #walletconnect-wrapper {
    .walletconnect-modal__header p {
      color: ${(props) => props.theme.colors.darkBlue};
    }
    .walletconnect-qrcode__base {
      background-color: transparent;
    }
    .walletconnect-modal__base {
      border-radius: ${(props) => props.theme.modalStyle.content.borderRadius};
      box-shadow: ${(props) => props.theme.modalStyle.content.boxShadow};
    }
    .walletconnect-qrcode__text {
      color: ${(props) => props.theme.colors.textColor};
      font-size: 16px;
    }
  }
`
