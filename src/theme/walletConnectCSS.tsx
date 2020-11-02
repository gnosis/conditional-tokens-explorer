import { css } from 'styled-components'

export const walletConnectCSS = css`
  #walletconnect-wrapper {
    .walletconnect-modal__close__wrapper {
      background-color: transparent;
      background-image: url(data:image/svg+xml;base64,PHN2ZwogICAgaGVpZ2h0PSIyMCIKICAgIHZpZXdCb3g9IjAgMCAyMCAyMCIKICAgIHdpZHRoPSIyMCIKICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICA+CiAgICA8cGF0aCBkPSJNMCAwaDIwdjIwSDB6IiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIC8+CiAgICA8cGF0aAogICAgICBkPSJNMTEuMTMgMTBsNi42MzMgNi42MzJhLjguOCAwIDAgMS0xLjEzMiAxLjEzMUwxMCAxMS4xM2wtNi42MzUgNi42MzJhLjguOCAwIDAgMS0xLjEzMi0xLjEzMkw4Ljg2NiAxMCAyLjIzMyAzLjM2NWEuOC44IDAgMCAxIDEuMTMyLTEuMTMyTDEwIDguODY2bDYuNjMzLTYuNjMzYS44LjggMCAwIDEgMS4xMzIgMS4xMzJMMTEuMTMgMTB6IgogICAgICBmaWxsPSIjMDAxNDI4IgogICAgICBmaWxsLXJ1bGU9ImV2ZW5vZGQiCiAgICAvPgogIDwvc3ZnPg==);
      background-position: 50% 50%;
      background-repeat: no-repeat;
      height: 25px;
      padding: 0;
      right: 0;
      top: 0;
      width: 25px;

      #walletconnect-qrcode-close {
        display: none;
      }
    }
    .walletconnect-modal__header p {
      color: ${(props) => props.theme.colors.darkBlue};
    }
    .walletconnect-qrcode__base {
      background-color: ${(props) => props.theme.modalStyle.overlay.backgroundColor};
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
