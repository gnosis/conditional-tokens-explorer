import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { Main } from './pages/main'
import { Web3ContextProvider } from './contexts/Web3Context'

ReactDOM.render(
  <React.StrictMode>
    <Web3ContextProvider>
      <Main />
    </Web3ContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
