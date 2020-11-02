import { createGlobalStyle } from 'styled-components'

import { dataTableCSS } from 'theme/dataTableCSS'
import { localFonts } from 'theme/fonts'
import theme from 'theme/index'
import { reactTooltipCSS } from 'theme/reactTooltipCSS'
import { walletConnectCSS } from 'theme/walletConnectCSS'
import { web3ModalCSS } from 'theme/web3ModalCSS'

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
  ${walletConnectCSS}
  ${dataTableCSS}
  ${reactTooltipCSS}
`
