import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import { Contents } from 'components/layout/Contents'
import { ApolloProviderWrapper } from 'contexts/Apollo'
import { Web3ContextProvider } from 'contexts/Web3Context'
import theme from 'theme'
import { GlobalStyle } from 'theme/globalStyle'
import 'sanitize.css'

ReactDOM.render(
  <React.StrictMode>
    <Web3ContextProvider>
      <ApolloProviderWrapper>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Router>
            <Contents />
          </Router>
        </ThemeProvider>
      </ApolloProviderWrapper>
    </Web3ContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
