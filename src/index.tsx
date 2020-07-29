import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import { Footer, Header } from './components/layout'
import { InnerContainer, MainScroll, MainWrapper } from './components/pureStyledComponents/layout'
import { ApolloProviderWrapper } from './contexts/Apollo'
import { Web3ContextProvider } from './contexts/Web3Context'
import { Main } from './pages/main'
import 'sanitize.css'
import theme from './theme'
import { GlobalStyle } from './theme/global_style'

ReactDOM.render(
  <React.StrictMode>
    <Web3ContextProvider>
      <ApolloProviderWrapper>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Router>
            <MainWrapper>
              <Header />
              <MainScroll>
                <InnerContainer>
                  <Main />
                </InnerContainer>
                <Footer />
              </MainScroll>
            </MainWrapper>
          </Router>
        </ThemeProvider>
      </ApolloProviderWrapper>
    </Web3ContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
