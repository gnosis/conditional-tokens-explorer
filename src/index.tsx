import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import { Header, MainFooter } from './components/layout'
import { Mainmenu } from './components/navigation/Mainmenu'
import { InnerContainer, MainScroll, MainWrapper } from './components/pureStyledComponents/layout'
import { ApolloProviderWrapper } from './contexts/Apollo'
import { Web3ContextProvider } from './contexts/Web3Context'
import { Routes } from './pages/Routes'
import 'sanitize.css'
import theme from './theme'
import { GlobalStyle } from './theme/globalStyle'

ReactDOM.render(
  <React.StrictMode>
    <Web3ContextProvider>
      <ApolloProviderWrapper>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Router>
            <MainWrapper>
              <Header />
              <Mainmenu />
              <MainScroll>
                <InnerContainer>
                  <Routes />
                </InnerContainer>
                <MainFooter />
              </MainScroll>
            </MainWrapper>
          </Router>
        </ThemeProvider>
      </ApolloProviderWrapper>
    </Web3ContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
