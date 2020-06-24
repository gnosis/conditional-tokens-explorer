import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { Main } from './pages/main'
import { Web3ContextProvider } from './contexts/Web3Context'
import { HashRouter as Router } from 'react-router-dom'
import { Header } from './components/common/Header'

ReactDOM.render(
  <React.StrictMode>
    <Web3ContextProvider>
      <Router>
        <Header />
        <Main />
      </Router>
    </Web3ContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
