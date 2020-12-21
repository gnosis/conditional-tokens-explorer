import { css } from 'styled-components'

const MODAL_HEIGHT = '226px'
const MODAL_WIDTH = '350px'
const X_DIMENSIONS = '20px'

export const web3ModalCSS = css`
  .web3modal-modal-lightbox {
    background-color: ${(props) => props.theme.modalStyle.overlay.backgroundColor};
    z-index: ${(props) => props.theme.modalStyle.overlay.zIndex};
  }

  .web3modal-modal-container {
    align-items: center;
    display: block;
    height: 100vh;
    padding: 0;
    position: relative;
    width: 100vw;

    .web3modal-modal-hitbox {
      bottom: 0;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;

      &::before {
        color: ${(props) => props.theme.colors.darkBlue};
        content: '';
        background: url(data:image/svg+xml;base64,PHN2ZwogICAgaGVpZ2h0PSIyMCIKICAgIHZpZXdCb3g9IjAgMCAyMCAyMCIKICAgIHdpZHRoPSIyMCIKICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICA+CiAgICA8cGF0aCBkPSJNMCAwaDIwdjIwSDB6IiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIC8+CiAgICA8cGF0aAogICAgICBkPSJNMTEuMTMgMTBsNi42MzMgNi42MzJhLjguOCAwIDAgMS0xLjEzMiAxLjEzMUwxMCAxMS4xM2wtNi42MzUgNi42MzJhLjguOCAwIDAgMS0xLjEzMi0xLjEzMkw4Ljg2NiAxMCAyLjIzMyAzLjM2NWEuOC44IDAgMCAxIDEuMTMyLTEuMTMyTDEwIDguODY2bDYuNjMzLTYuNjMzYS44LjggMCAwIDEgMS4xMzIgMS4xMzJMMTEuMTMgMTB6IgogICAgICBmaWxsPSIjMDAxNDI4IgogICAgICBmaWxsLXJ1bGU9ImV2ZW5vZGQiCiAgICAvPgogIDwvc3ZnPg==);
        cursor: pointer;
        font-family: ${(props) => props.theme.fonts.fontFamily};
        font-size: 22px;
        height: ${X_DIMENSIONS};
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translateX(
            calc(
              -50% + (
                  ${MODAL_WIDTH} - ${(props) => props.theme.cards.paddingHorizontal} * 2 -
                    ${X_DIMENSIONS} / 2
                ) / 2
            )
          )
          translateY(
            calc(
              -50% - (
                  ${MODAL_HEIGHT} - ${(props) => props.theme.cards.paddingVertical} * 2 -
                    ${X_DIMENSIONS} / 2
                ) / 2
            )
          );
        width: ${X_DIMENSIONS};
        z-index: 150;
      }
    }
  }

  .web3modal-modal-card {
    align-items: flex-start;
    background-color: ${(props) => props.theme.modalStyle.content.backgroundColor};
    border-color: ${(props) => props.theme.modalStyle.content.borderColor};
    border-radius: ${(props) => props.theme.modalStyle.content.borderRadius};
    box-shadow: ${(props) => props.theme.modalStyle.content.boxShadow};
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: ${MODAL_HEIGHT};
    left: 50%;
    margin: 0;
    max-width: 100%;
    overflow: hidden;
    padding-bottom: 50px;
    padding-left: ${(props) => props.theme.cards.paddingHorizontal};
    padding-right: ${(props) => props.theme.cards.paddingHorizontal};
    padding-top: ${(props) => props.theme.cards.paddingVertical};
    position: absolute;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: ${MODAL_WIDTH};
    z-index: 10;

    &::before {
      color: ${(props) => props.theme.colors.darkBlue};
      content: 'Connect to Wallet';
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
