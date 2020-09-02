import { createGlobalStyle } from 'styled-components'

import { dataTableCSS } from './dataTableCSS'
import { localFonts } from './fonts'
import { reactTooltipCSS } from './reactTooltipCSS'
import { web3ModalCSS } from './web3ModalCSS'

import theme from './index'

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

  ${web3ModalCSS}
  ${dataTableCSS}
  ${reactTooltipCSS}
`
