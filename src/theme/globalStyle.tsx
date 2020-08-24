import { createGlobalStyle } from 'styled-components'

import { localFonts } from './fonts'

import theme from '.'

type ThemeType = typeof theme

export const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  ${localFonts}

  html body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background-color: ${(props) => props.theme.colors.mainBodyBackground};
    color: ${(props) => props.theme.colors.textColor};
    font-family: ${(props) => props.theme.fonts.fontFamily};
    font-size: ${(props) => props.theme.fonts.defaultSize};
  }

  code {
    font-family: ${(props) => props.theme.fonts.fontFamilyCode};
  }

  body,
  html,
  #root {
    height: 100vh;
  }

  .web3modal-modal-lightbox {
    z-index: 10;
  }

  .outerTableWrapper {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px 0 rgba(212, 213, 211, 0.7);

    .rdt_TableRow {
      border-bottom-color: ${(props) => props.theme.colors.lightGrey}!important;

      &:hover {
        color: ${(props) => props.theme.colors.darkerGray}!important;
      }

      &:last-of-type {
        border-bottom: none!important;
      }

      &:nth-last-of-type(1),
      &:nth-last-of-type(2),
      &:nth-last-of-type(3) {
        .dropdownItems {
          bottom: calc(100% + 10px);
          top: auto;
        }
      }
    }
  }
`
